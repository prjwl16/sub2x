import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  userApi,
  accountsApi,
  sourcesApi,
  postsApi,
  draftsApi,
  scheduleApi,
  tweetsApi,
  usageApi,
  onboardingApi,
  systemApi,
} from './services';
import { DraftStatusFilter, PostStatusFilter } from './types';

// Query Keys
export const queryKeys = {
  user: ['user'] as const,
  me: ['me'] as const,
  accounts: ['accounts'] as const,
  sources: ['sources'] as const,
  posts: ['posts'] as const,
  drafts: ['drafts'] as const,
  schedule: ['schedule'] as const,
  usage: ['usage'] as const,
  onboarding: ['onboarding'] as const,
  system: ['system'] as const,
  cron: ['cron'] as const,
};

// User Hooks
export const useMe = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: userApi.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
};

// Accounts Hooks
export const useAccounts = () => {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: accountsApi.listAccounts,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: accountsApi.deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
};

// Sources Hooks
export const useSources = (params?: { offset?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...queryKeys.sources, params],
    queryFn: () => sourcesApi.listSources(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddSources = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sourcesApi.addSources,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
    },
  });
};

export const useDeleteSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sourcesApi.deleteSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
    },
  });
};

export const useReorderSources = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sourcesApi.reorderSources,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
    },
  });
};

// Posts Hooks
export const usePosts = (
  filter?: { status?: string; from?: string; to?: string },
  pagination?: { offset?: number; limit?: number }
) => {
  return useQuery({
    queryKey: [...queryKeys.posts, filter, pagination],
    queryFn: () => postsApi.listPosts(filter as PostStatusFilter, pagination),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePostAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      postsApi.performAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};

// Drafts Hooks
export const useDrafts = (
  filter?: { status?: string },
  pagination?: { offset?: number; limit?: number }
) => {
  return useQuery({
    queryKey: [...queryKeys.drafts, filter, pagination],
    queryFn: () => draftsApi.listDrafts(filter as DraftStatusFilter, pagination),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useApproveDraft = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: draftsApi.approveDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drafts });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};

export const useRejectDraft = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: draftsApi.rejectDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drafts });
    },
  });
};

// Schedule Hooks
export const useSchedule = () => {
  return useQuery({
    queryKey: queryKeys.schedule,
    queryFn: scheduleApi.getSchedule,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpsertSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: scheduleApi.upsertSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
    },
  });
};

// Tweet Generation Hooks
export const useGenerateTweets = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tweetsApi.generateTweets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drafts });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};

// Usage Hooks
export const useUsage = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.usage,
    queryFn: usageApi.getUsage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
};

// Onboarding Hooks
export const useOnboardingSuggestions = (params?: { q?: string; limit?: number }) => {
  return useQuery({
    queryKey: [...queryKeys.onboarding, 'suggestions', params],
    queryFn: () => onboardingApi.getSuggestions(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: onboardingApi.completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sources });
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
};

// System Hooks
export const useSystemInit = () => {
  return useQuery({
    queryKey: queryKeys.system,
    queryFn: systemApi.initSystem,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useCronStatus = () => {
  return useQuery({
    queryKey: queryKeys.cron,
    queryFn: systemApi.getCronStatus,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useCronControl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: systemApi.controlCron,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cron });
    },
  });
};

import apiClient from './client';
import type {
  MeResponse,
  UserProfile,
  SocialAccountSummary,
  SourceItem,
  CommunityItem,
  DraftItem,
  PostItem,
  SchedulePolicy,
  UsageSummary,
  UpdateMeRequest,
  AddSourcesRequest,
  ReorderSourcesRequest,
  ScheduleUpsertRequest,
  PostActionRequest,
  OnboardingCompleteRequest,
  CronControlRequest,
  PaginationParams,
  PostStatusFilter,
  DraftStatusFilter,
  GenerateTweetResponse,
  SubredditSuggestion,
  VoiceProfile,
  CreateVoiceProfileRequest,
  UpdateVoiceProfileRequest,
} from './types';

// User Management
export const userApi = {
  // GET /api/me
  getMe: async (): Promise<MeResponse> => {
    const response = await apiClient.get('/me');
    return response.data.data;
  },

  // POST /api/me
  updateMe: async (data: UpdateMeRequest): Promise<UserProfile> => {
    const response = await apiClient.post('/me', data);
    return response.data.data;
  },
};

// Social Accounts
export const accountsApi = {
  // GET /api/accounts
  listAccounts: async (): Promise<SocialAccountSummary[]> => {
    const response = await apiClient.get('/accounts');
    return response.data.data;
  },

  // DELETE /api/accounts/:id
  deleteAccount: async (id: string): Promise<void> => {
    await apiClient.delete(`/accounts/${id}`);
  },
};

// Sources (Subreddits)
export const sourcesApi = {
  // GET /api/sources
  listSources: async (params?: PaginationParams): Promise<{
    items: CommunityItem[];
    meta: { total: number; offset: number; limit: number };
  }> => {
    const response = await apiClient.get('/sources', { params });
    return response.data;
  },

  // POST /api/sources
  addSources: async (data: AddSourcesRequest): Promise<CommunityItem[]> => {
    const response = await apiClient.post('/sources', data);
    return response.data.data;
  },

  // DELETE /api/sources/:id
  deleteSource: async (id: string): Promise<void> => {
    await apiClient.delete(`/sources/${id}`);
  },

  // POST /api/sources/reorder
  reorderSources: async (data: ReorderSourcesRequest): Promise<{
    sources: Array<{
      id: string;
      subreddit: { name: string; title: string | null };
      priority: number;
    }>;
  }> => {
    const response = await apiClient.post('/sources/reorder', data);
    return response.data.data;
  },
};

// Posts
export const postsApi = {
  // GET /api/posts
  listPosts: async (
    filter?: PostStatusFilter,
    pagination?: PaginationParams
  ): Promise<{
    items: PostItem[];
    meta: { total: number; offset: number; limit: number };
  }> => {
    const params = { ...filter, ...pagination };
    const response = await apiClient.get('/posts', { params });
    return response.data;
  },

  // POST /api/posts/:id
  performAction: async (id: string, data: PostActionRequest): Promise<{
    success: boolean;
    data?: { id: string; status: string; updatedAt: string };
    error?: string;
    code?: string;
  }> => {
    const response = await apiClient.post(`/posts/${id}`, data);
    return response.data;
  },

  listDrafts: async (
    filter?: DraftStatusFilter,
    pagination?: PaginationParams
  ): Promise<{
    items: DraftItem[];
    meta: { total: number; offset: number; limit: number };
  }> => {
    const params = { ...filter, ...pagination };
    const response = await apiClient.get('/posts/drafts', { params });
    return response.data;
  },
};

// Drafts
export const draftsApi = {
  // GET /api/drafts
  listDrafts: async (
    filter?: DraftStatusFilter,
    pagination?: PaginationParams
  ): Promise<{
    items: DraftItem[];
    meta: { total: number; offset: number; limit: number };
  }> => {
    const params = { ...filter, ...pagination };
    const response = await apiClient.get('/posts/drafts', { params });
    return response.data;
  },

  // POST /api/drafts/:id/approve
  approveDraft: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/posts/drafts/${id}/approve`);
    return response.data.data;
  },

  // POST /api/drafts/:id/reject
  rejectDraft: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/posts/drafts/${id}/reject`);
    return response.data.data;
  },
};

// Schedule
export const scheduleApi = {
  // GET /api/schedule
  getSchedule: async (): Promise<SchedulePolicy> => {
    const response = await apiClient.get('/schedule');
    return response.data.data;
  },

  // POST /api/schedule
  upsertSchedule: async (data: ScheduleUpsertRequest): Promise<SchedulePolicy> => {
    const response = await apiClient.post('/schedule', data);
    return response.data.data;
  },
};

// Tweet Generation
export const tweetsApi = {
  // POST /api/tweets/generate
  generateTweets: async (): Promise<GenerateTweetResponse> => {
    const response = await apiClient.post('/tweets/generate');
    return response.data;
  },
};

// Usage
export const usageApi = {
  // GET /api/usage
  getUsage: async (): Promise<UsageSummary> => {
    const response = await apiClient.get('/usage');
    return response.data.data;
  },
};

// Onboarding
export const onboardingApi = {
  // POST /api/onboarding/complete
  completeOnboarding: async (data: OnboardingCompleteRequest): Promise<{
    message: string;
  }> => {
    const response = await apiClient.post('/onboarding/complete', data);
    return response.data.data;
  },

  // GET /api/onboarding/suggestions
  getSuggestions: async (params?: {
    q?: string;
    limit?: number;
  }): Promise<SubredditSuggestion[]> => {
    const response = await apiClient.get('/onboarding/suggestions', { params });
    return response.data.data;
  },
};

// System & Cron
export const systemApi = {
  // GET /api/system/init
  initSystem: async (): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> => {
    const response = await apiClient.get('/system/init');
    return response.data;
  },

  // GET /api/cron/tweet-generator
  getCronStatus: async (): Promise<{
    success: boolean;
    data: any;
  }> => {
    const response = await apiClient.get('/cron/tweet-generator');
    return response.data;
  },

  // POST /api/cron/tweet-generator
  controlCron: async (data: CronControlRequest): Promise<{
    success: boolean;
    data: {
      action: string;
      message: string;
      stats?: any;
    };
  }> => {
    const response = await apiClient.post('/cron/tweet-generator', data);
    return response.data;
  },
};

// Voice Profile
export const voiceProfileApi = {
  // GET /api/voice-profile
  getVoiceProfile: async (): Promise<VoiceProfile[]> => {
    const response = await apiClient.get('/voice-profile');
    return response.data.data;
  },

  // POST /api/voice-profile
  createVoiceProfile: async (data: CreateVoiceProfileRequest): Promise<VoiceProfile> => {
    const response = await apiClient.post('/voice-profile', data);
    return response.data.data;
  },

  // PUT /api/voice-profile
  updateVoiceProfile: async (data: UpdateVoiceProfileRequest): Promise<VoiceProfile> => {
    const response = await apiClient.put('/voice-profile', data);
    return response.data.data;
  },

  // DELETE /api/voice-profile
  deleteVoiceProfile: async (): Promise<void> => {
    await apiClient.delete('/voice-profile');
  },
};

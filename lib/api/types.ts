// API Response Types
export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// User types
export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  handle: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccountSummary {
  id: string;
  provider: string;
  providerAccountId: string;
  username: string | null;
  displayName: string | null;
  expiresAt: string | null;
}

export interface UsageSummary {
  postsAllotted: number;
  postsScheduled: number;
  postsPosted: number;
}

export interface MeResponse {
  user: UserProfile;
  account: SocialAccountSummary | null;
  usage: UsageSummary;
}

// Source types
export interface SourceItem {
  id: string;
  name: string;
  title: string | null;
  nsfw: boolean;
  isEnabled: boolean;
  priority: number;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CommunityItem {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  priority: number;
  title: string | null;
  nsfw: boolean;
  lastUsedAt: string | null;
}

// Draft types
export interface DraftItem {
  id: string;
  text: string;
  status: 'DRAFT' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'POSTED';
  score: number | null;
  createdAt: string;
  updatedAt: string;
  sourceItem?: {
    id: string;
    title: string | null;
    url: string | null;
    subreddit: {
      name: string;
    } | null;
  } | null;
}

// Schedule types
export interface SchedulePolicy {
  id: string;
  timeZone: string;
  postsPerDay: number;
  preferredTimes: string[];
  daysOfWeek: string[];
  windowStart: number | null;
  windowEnd: number | null;
  nextRunAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Post types
export interface PostItem {
  id: string;
  status: string;
  scheduledFor: string;
  postedAt: string | null;
  externalPostId: string | null;
  error: string | null;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
  draft?: {
    id: string;
    text: string;
  } | null;
  socialAccount: {
    id: string;
    provider: string;
    username: string | null;
  };
}

export interface PostEvent {
  id: string;
  type: string;
  message: string | null;
  data: unknown;
  createdAt: string;
}

// Request types
export interface UpdateMeRequest {
  email?: string;
  name?: string;
  timeZone?: string;
}

export interface AddSourcesRequest {
  subreddits: string[];
}

export interface ReorderSourcesRequest {
  items: Array<{
    id: string;
    priority: number;
  }>;
}

export interface ScheduleUpsertRequest {
  timeZone: string;
  postsPerDay: number;
  preferredTimes: string[];
  daysOfWeek?: string[];
  windowStart?: number | null;
  windowEnd?: number | null;
  isActive?: boolean;
}

export interface PostActionRequest {
  action: 'post_now' | 'approve' | 'reject';
}

export interface OnboardingCompleteRequest {
  subreddits: string[];
}

export interface CronControlRequest {
  action: 'start' | 'stop' | 'run';
}

// Pagination types
export interface PaginationParams {
  offset?: number;
  limit?: number;
}

export interface PostStatusFilter {
  status?: 'SCHEDULED' | 'POSTED' | 'FAILED' | 'CANCELED' | 'SKIPPED';
  from?: string;
  to?: string;
}

export interface DraftStatusFilter {
  status?: 'DRAFT' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'POSTED';
}

// Tweet generation types
export interface GenerateTweetResponse {
  success: boolean;
  data?: {
    tweetsGenerated: number;
    tweets: Array<{
      id: string;
      text: string;
      scheduledFor: string;
      sourcePost?: {
        title: string;
        subreddit: string;
      };
    }>;
  };
  error?: string;
  code?: string;
}

// Onboarding types
export interface SubredditSuggestion {
  name: string;
  topic?: string;
  audience?: string;
}

// Voice Profile types
export interface VoiceProfileRules {
  tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'humorous';
  style: 'informative' | 'entertaining' | 'persuasive' | 'educational' | 'conversational';
  length: 'short' | 'medium' | 'long';
  hashtags?: boolean;
  mentions?: boolean;
  emojis?: boolean;
  [key: string]: any; // Allow custom rules
}

export interface VoiceProfile {
  id: string;
  rules: VoiceProfileRules;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoiceProfileRequest {
  rules: VoiceProfileRules;
}

export interface UpdateVoiceProfileRequest {
  rules: Partial<VoiceProfileRules>;
}

// API Response Types

export interface ApiSuccess<T> {
  ok: true
  data: T
  meta?: {
    total?: number
    limit?: number
    offset?: number
  }
}

export interface ApiErrorBody {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// User types
export interface UserProfile {
  id: string
  email: string | null
  name: string | null
  image: string | null
  handle: string | null
  createdAt: string // API returns ISO date strings
  updatedAt: string // API returns ISO date strings
}

export interface SocialAccountSummary {
  id: string
  provider: string
  providerAccountId: string
  username: string | null
  displayName: string | null
  expiresAt: string | null // API returns ISO date strings
}

export interface UsageSummary {
  postsAllotted: number
  postsScheduled: number
  postsPosted: number
}

export interface MeResponse {
  user: UserProfile
  account: SocialAccountSummary | null
  usage: UsageSummary
}

// Source types
export interface SourceItem {
  id: string
  name: string
  title: string | null
  nsfw: boolean
  isEnabled: boolean
  priority: number
  lastUsedAt: string | null // API returns ISO date strings
  createdAt: string // API returns ISO date strings
}

// Draft types
export interface DraftItem {
  id: string
  text: string
  status: 'DRAFT' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'POSTED'
  score: number | null
  createdAt: string // API returns ISO date strings
  updatedAt: string // API returns ISO date strings
  sourceItem?: {
    id: string
    title: string | null
    url: string | null
    subreddit: {
      name: string
    } | null
  } | null
}

// Schedule types
export interface SchedulePolicy {
  id: string
  timeZone: string
  postsPerDay: number
  preferredTimes: string[]
  daysOfWeek: string[]
  windowStart: number | null
  windowEnd: number | null
  nextRunAt: string | null // API returns ISO date strings
  isActive: boolean
  createdAt: string // API returns ISO date strings
  updatedAt: string // API returns ISO date strings
}

// Post types
export interface PostItem {
  id: string
  status: string
  scheduledFor: string // API returns ISO date strings
  postedAt: string | null // API returns ISO date strings
  externalPostId: string | null
  error: string | null
  attemptCount: number
  createdAt: string // API returns ISO date strings
  updatedAt: string // API returns ISO date strings
  draft?: {
    id: string
    text: string
  } | null
  socialAccount: {
    id: string
    provider: string
    username: string | null
  }
}

export interface PostEvent {
  id: string
  type: string
  message: string | null
  data: unknown
  createdAt: string // API returns ISO date strings
}

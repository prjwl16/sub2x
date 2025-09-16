// Voice Profile specific types
export interface VoiceProfileRules {
  tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'humorous'
  style: 'informative' | 'entertaining' | 'persuasive' | 'educational' | 'conversational'
  length: 'short' | 'medium' | 'long'
  hashtags?: boolean
  mentions?: boolean
  emojis?: boolean
  vocabulary?: string[]
  topics?: string[]
  sentenceStructure?: string
  engagement?: string
  personality?: string[]
  [key: string]: any // Allow custom rules
}

export interface VoiceProfile {
  id: string
  rules: VoiceProfileRules
  createdAt: string
  updatedAt: string
}

export interface CreateVoiceProfileRequest {
  rules: VoiceProfileRules
}

export interface UpdateVoiceProfileRequest {
  rules: Partial<VoiceProfileRules>
}

export interface VoiceProfileErrorResponse {
  ok: false
  error: {
    code: 'NO_FILES_PROVIDED' | 'INVALID_IMAGE_COUNT' | 'INVALID_FILE_TYPE' | 'IMAGE_PARSING_FAILED' | 'VOICE_PROFILE_GENERATION_FAILED'
    message: string
  }
}

export interface VoiceProfileSuccessResponse {
  ok: true
  data: VoiceProfile
  message?: string
}

export interface VoiceProfileState {
  selectedFiles: File[]
  isCreating: boolean
  error: string | null
  hasFailedAttempt: boolean
}

export interface VoiceProfileContextType extends VoiceProfileState {
  setSelectedFiles: (files: File[]) => void
  setError: (error: string | null) => void
  startCreation: () => Promise<{ shouldCloseModal: boolean }>
  clearError: () => void
  reset: () => void
}

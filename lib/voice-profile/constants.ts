export const VOICE_PROFILE_CONSTANTS = {
  MAX_FILES: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  VALID_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  TOAST_DELAY: 1500, // 1.5 seconds
} as const

export const VOICE_PROFILE_MESSAGES = {
  CREATION_STARTED: "Voice profile creation started...",
  CREATION_SUCCESS: "Voice profile created! You can start generating tweets",
  CREATION_FAILED: "Voice profile creation failed. Please try again.",
  PASTE_SUCCESS: (count: number) => `${count} image${count > 1 ? 's' : ''} pasted successfully!`,
  NO_FILES: "Please select at least one image.",
  MAX_FILES_EXCEEDED: (max: number) => `Maximum ${max} images allowed. Only the first ${max} were selected.`,
  INVALID_FILE_TYPE: (filename: string) => `${filename}: Invalid file type. Please use JPEG, PNG, or WebP images.`,
  FILE_TOO_LARGE: (filename: string) => `${filename}: File too large. Maximum size is 10MB.`,
} as const

export const VOICE_PROFILE_ERRORS = {
  INVALID_REQUEST: "Invalid request. Please check your images and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  NETWORK_ERROR: "Network error occurred",
  GENERATION_FAILED: "Failed to create voice profile",
} as const

import { VOICE_PROFILE_ERRORS } from './constants'

export interface ErrorHandlingResult {
  message: string
  shouldRetry: boolean
}

export function handleVoiceProfileError(error: any): ErrorHandlingResult {
  console.error("Voice profile error:", error)
  
  let message = VOICE_PROFILE_ERRORS.GENERATION_FAILED
  let shouldRetry = true
  
  if (error?.response) {
    const status = error.response.status
    const data = error.response.data
    
    if (data?.error?.message) {
      message = data.error.message
    } else if (status >= 400 && status < 500) {
      message = VOICE_PROFILE_ERRORS.INVALID_REQUEST
    } else if (status >= 500) {
      message = VOICE_PROFILE_ERRORS.SERVER_ERROR
    }
  } else if (error?.message) {
    message = error.message
  }
  
  return { message, shouldRetry }
}


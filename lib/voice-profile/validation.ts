import { VOICE_PROFILE_CONSTANTS, VOICE_PROFILE_MESSAGES } from './constants'

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export function validateFile(file: File): FileValidationResult {
  if (!VOICE_PROFILE_CONSTANTS.VALID_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: VOICE_PROFILE_MESSAGES.INVALID_FILE_TYPE(file.name)
    }
  }
  
  if (file.size > VOICE_PROFILE_CONSTANTS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: VOICE_PROFILE_MESSAGES.FILE_TOO_LARGE(file.name)
    }
  }
  
  return { isValid: true }
}

export function validateFileList(files: File[], existingFiles: File[] = []): {
  validFiles: File[]
  error?: string
} {
  const allFiles = [...existingFiles]
  let hasErrors = false
  let errorMessage = ''
  
  for (const file of files) {
    const validation = validateFile(file)
    if (!validation.isValid) {
      hasErrors = true
      errorMessage = validation.error!
      break
    }
    
    // Check if file already exists
    const exists = allFiles.some(existingFile => 
      existingFile.name === file.name && existingFile.size === file.size
    )
    
    if (!exists && allFiles.length < VOICE_PROFILE_CONSTANTS.MAX_FILES) {
      allFiles.push(file)
    }
  }
  
  if (hasErrors) {
    return { validFiles: existingFiles, error: errorMessage }
  }
  
  if (allFiles.length > VOICE_PROFILE_CONSTANTS.MAX_FILES) {
    return {
      validFiles: allFiles.slice(0, VOICE_PROFILE_CONSTANTS.MAX_FILES),
      error: VOICE_PROFILE_MESSAGES.MAX_FILES_EXCEEDED(VOICE_PROFILE_CONSTANTS.MAX_FILES)
    }
  }
  
  return { validFiles: allFiles }
}

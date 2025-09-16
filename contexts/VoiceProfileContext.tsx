"use client"

import React, { createContext, useContext, useState, useRef, useCallback } from "react"
import { useGenerateVoiceProfile } from "@/lib/api/hooks"
import { toast } from "sonner"
import { 
  VOICE_PROFILE_CONSTANTS, 
  VOICE_PROFILE_MESSAGES, 
  handleVoiceProfileError
} from "@/lib/voice-profile"
import { VoiceProfileState, VoiceProfileContextType } from "@/types/voice-profile"

const VoiceProfileContext = createContext<VoiceProfileContextType | null>(null)

export function VoiceProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<VoiceProfileState>({
    selectedFiles: [],
    isCreating: false,
    error: null,
    hasFailedAttempt: false,
  })
  
  const generateVoiceProfile = useGenerateVoiceProfile()
  
  // Keep track of ongoing creation to prevent duplicate calls
  const creationPromiseRef = useRef<Promise<void> | null>(null)

  const setSelectedFiles = useCallback((files: File[]) => {
    setState(prev => ({ 
      ...prev, 
      selectedFiles: files, 
      error: null,
      hasFailedAttempt: false 
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const startCreation = useCallback(async (): Promise<{ shouldCloseModal: boolean }> => {
    if (state.selectedFiles.length === 0) {
      setError(VOICE_PROFILE_MESSAGES.NO_FILES)
      return { shouldCloseModal: false }
    }

    // If already creating, don't start another
    if (creationPromiseRef.current) {
      return { shouldCloseModal: false }
    }

    setState(prev => ({ ...prev, isCreating: true, error: null }))
    
    // Show initial toast
    toast.info(VOICE_PROFILE_MESSAGES.CREATION_STARTED)

    // Create the promise and store it
    const creationPromise = generateVoiceProfile.mutateAsync(state.selectedFiles)
      .then((result) => {
        // Success - clear everything
        setState({
          selectedFiles: [],
          isCreating: false,
          error: null,
          hasFailedAttempt: false,
        })
        toast.success(VOICE_PROFILE_MESSAGES.CREATION_SUCCESS)
      })
      .catch((error: any) => {
        const { message } = handleVoiceProfileError(error)
        setState(prev => ({
          ...prev,
          isCreating: false,
          error: message,
          hasFailedAttempt: true,
        }))
        toast.error(VOICE_PROFILE_MESSAGES.CREATION_FAILED)
      })
      .finally(() => {
        creationPromiseRef.current = null
      })

    creationPromiseRef.current = creationPromise

    // Add delay to ensure toast is visible before closing modal
    await new Promise(resolve => setTimeout(resolve, VOICE_PROFILE_CONSTANTS.TOAST_DELAY))
    
    // Return to close modal after delay
    return { shouldCloseModal: true }
  }, [state.selectedFiles, generateVoiceProfile, setError])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, hasFailedAttempt: false }))
  }, [])

  const reset = useCallback(() => {
    // Only reset if not currently creating
    if (!state.isCreating) {
      setState({
        selectedFiles: [],
        isCreating: false,
        error: null,
        hasFailedAttempt: false,
      })
    }
  }, [state.isCreating])


  const value: VoiceProfileContextType = {
    ...state,
    setSelectedFiles,
    setError,
    startCreation,
    clearError,
    reset,
  }

  return (
    <VoiceProfileContext.Provider value={value}>
      {children}
    </VoiceProfileContext.Provider>
  )
}

export function useVoiceProfileCreation(): VoiceProfileContextType {
  const context = useContext(VoiceProfileContext)
  if (!context) {
    throw new Error('useVoiceProfileCreation must be used within a VoiceProfileProvider')
  }
  return context
}

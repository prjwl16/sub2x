"use client"

import React, { createContext, useContext, useState, useRef, useCallback } from "react"
import { useGenerateVoiceProfile } from "@/lib/api/hooks"
import { toast } from "sonner"

interface VoiceProfileState {
  selectedFiles: File[]
  isCreating: boolean
  error: string | null
  hasFailedAttempt: boolean
}

interface VoiceProfileContextType extends VoiceProfileState {
  setSelectedFiles: (files: File[]) => void
  setError: (error: string | null) => void
  startCreation: () => Promise<{ shouldCloseModal: boolean }>
  clearError: () => void
  reset: () => void
  simulateFailure: () => void
}

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
    console.log("VoiceProfileContext: Setting selected files", files.length)
    setState(prev => ({ 
      ...prev, 
      selectedFiles: files, 
      error: null,
      hasFailedAttempt: false 
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    console.log("VoiceProfileContext: Setting error", error)
    setState(prev => ({ ...prev, error }))
  }, [])

  const startCreation = useCallback(async (): Promise<{ shouldCloseModal: boolean }> => {
    console.log("VoiceProfileContext: Starting creation with", state.selectedFiles.length, "files")
    
    if (state.selectedFiles.length === 0) {
      setError("Please select at least one image.")
      return { shouldCloseModal: false }
    }

    // If already creating, don't start another
    if (creationPromiseRef.current) {
      return { shouldCloseModal: false }
    }

    setState(prev => ({ ...prev, isCreating: true, error: null }))
    
    // Show initial toast
    toast.info("Voice profile creation started...")

    // Create the promise and store it
    const creationPromise = generateVoiceProfile.mutateAsync(state.selectedFiles)
      .then((result) => {
        console.log("VoiceProfileContext: Voice profile created successfully:", result)
        // Success - clear everything
        setState({
          selectedFiles: [],
          isCreating: false,
          error: null,
          hasFailedAttempt: false,
        })
        toast.success("Voice profile created! You can start generating tweets")
      })
      .catch((error: any) => {
        console.error("VoiceProfileContext: Voice profile creation failed:", error)
        // Failure - keep files, set error state
        let errorMessage = "Failed to create voice profile"
        
        // Handle different error types
        if (error?.response) {
          // HTTP error response
          const status = error.response.status
          const data = error.response.data
          
          if (data?.error?.message) {
            errorMessage = data.error.message
          } else if (status >= 400 && status < 500) {
            errorMessage = "Invalid request. Please check your images and try again."
          } else if (status >= 500) {
            errorMessage = "Server error. Please try again later."
          }
        } else if (error?.message) {
          // Network or other error
          errorMessage = error.message
        }
        
        console.log("VoiceProfileContext: Setting failed attempt state")
        setState(prev => ({
          ...prev,
          isCreating: false,
          error: errorMessage,
          hasFailedAttempt: true,
        }))
        toast.error("Voice profile creation failed. Please try again.")
      })
      .finally(() => {
        creationPromiseRef.current = null
      })

    creationPromiseRef.current = creationPromise

    // Add delay to ensure toast is visible before closing modal
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Return to close modal after delay
    return { shouldCloseModal: true }
  }, [state.selectedFiles, generateVoiceProfile, setError])

  const clearError = useCallback(() => {
    console.log("VoiceProfileContext: Clearing error")
    setState(prev => ({ ...prev, error: null, hasFailedAttempt: false }))
  }, [])

  const reset = useCallback(() => {
    console.log("VoiceProfileContext: Resetting state")
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

  // Debug function to simulate failure (remove in production)
  const simulateFailure = useCallback(() => {
    console.log("VoiceProfileContext: Simulating failure")
    setState(prev => ({
      ...prev,
      error: "Simulated API failure for testing",
      hasFailedAttempt: true,
    }))
    toast.error("Simulated failure - modal should reopen")
  }, [])

  const value: VoiceProfileContextType = {
    ...state,
    setSelectedFiles,
    setError,
    startCreation,
    clearError,
    reset,
    simulateFailure,
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

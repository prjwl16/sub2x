"use client"

import { useCallback, useEffect } from "react"
import { toast } from "sonner"
import { VOICE_PROFILE_MESSAGES } from "@/lib/voice-profile/constants"

export function useClipboardPaste(
  isEnabled: boolean,
  onFilesPasted: (files: File[]) => void
) {
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!isEnabled) return
    
    const items = e.clipboardData?.items
    if (!items) return
    
    const imageFiles: File[] = []
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          imageFiles.push(file)
        }
      }
    }
    
    if (imageFiles.length > 0) {
      e.preventDefault()
      onFilesPasted(imageFiles)
      toast.success(VOICE_PROFILE_MESSAGES.PASTE_SUCCESS(imageFiles.length))
    }
  }, [isEnabled, onFilesPasted])

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('paste', handlePaste)
      return () => {
        document.removeEventListener('paste', handlePaste)
      }
    }
  }, [isEnabled, handlePaste])
}

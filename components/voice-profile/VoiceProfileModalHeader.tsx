"use client"

import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RefreshCw, Image as ImageIcon } from "lucide-react"

interface VoiceProfileModalHeaderProps {
  hasFailedAttempt: boolean
}

export function VoiceProfileModalHeader({ hasFailedAttempt }: VoiceProfileModalHeaderProps) {
  return (
    <DialogHeader>
      {hasFailedAttempt ? (
        <DialogTitle className="flex items-center gap-2 text-red-600">
          <RefreshCw className="w-5 h-5" />
          Try Again - Voice Creation Failed
        </DialogTitle>
      ) : (
        <DialogTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-600" />
          Create Voice Profile
        </DialogTitle>
      )}
      <DialogDescription>
        {hasFailedAttempt ? (
          "The voice profile creation failed. Your images are preserved - you can modify your selection or try again with the same images."
        ) : (
          "Upload 1-10 screenshots of your X (Twitter) profile to analyze your writing style and create a personalized voice profile. You can drag & drop, browse files, or paste images from your clipboard."
        )}
      </DialogDescription>
    </DialogHeader>
  )
}

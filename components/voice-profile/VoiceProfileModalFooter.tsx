"use client"

import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"

interface VoiceProfileModalFooterProps {
  selectedFiles: File[]
  isCreating: boolean
  hasFailedAttempt: boolean
  onCancel: () => void
  onUpload: () => void
}

export function VoiceProfileModalFooter({
  selectedFiles,
  isCreating,
  hasFailedAttempt,
  onCancel,
  onUpload
}: VoiceProfileModalFooterProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="text-sm text-gray-600">
        {selectedFiles.length > 0 ? (
          <span className="text-green-600 font-medium">
            {selectedFiles.length} of 10 images selected
          </span>
        ) : (
          "No images selected"
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button
          onClick={onUpload}
          disabled={selectedFiles.length === 0 || isCreating}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Starting Creation...
            </>
          ) : hasFailedAttempt ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </>
          ) : (
            "Create Voice Profile"
          )}
        </Button>
      </div>
    </div>
  )
}

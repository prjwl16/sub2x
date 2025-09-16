"use client"

import { useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useVoiceProfileCreation } from "@/contexts/VoiceProfileContext"
import { useClipboardPaste } from "@/hooks/useClipboardPaste"
import { validateFileList } from "@/lib/voice-profile"
import { AlertCircle } from "lucide-react"
import {
  VoiceProfileDropArea,
  VoiceProfileFileList,
  VoiceProfileModalHeader,
  VoiceProfileModalFooter
} from "@/components/voice-profile"

interface VoiceProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VoiceProfileModal({ isOpen, onClose }: VoiceProfileModalProps) {
  const {
    selectedFiles,
    isCreating,
    error,
    hasFailedAttempt,
    setSelectedFiles,
    setError,
    startCreation,
    clearError,
  } = useVoiceProfileCreation()


  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const result = validateFileList(fileArray, selectedFiles)
    
    if (result.error) {
      setError(result.error)
    } else {
      setError(null)
      setSelectedFiles(result.validFiles)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setError(null)
  }

  const handleUpload = async () => {
    const result = await startCreation()
    if (result.shouldCloseModal) {
      onClose()
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      onClose()
      clearError()
    }
  }

  // Enable clipboard paste when modal is open
  useClipboardPaste(isOpen, handleFiles)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <VoiceProfileModalHeader hasFailedAttempt={hasFailedAttempt} />

        <div className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <VoiceProfileDropArea
            selectedFiles={selectedFiles}
            isCreating={isCreating}
            onFilesSelected={handleFiles}
          />

          <VoiceProfileFileList
            files={selectedFiles}
            onRemoveFile={removeFile}
            disabled={isCreating}
          />
        </div>

        <VoiceProfileModalFooter
          selectedFiles={selectedFiles}
          isCreating={isCreating}
          hasFailedAttempt={hasFailedAttempt}
          onCancel={handleClose}
          onUpload={handleUpload}
        />
      </DialogContent>
    </Dialog>
  )
}
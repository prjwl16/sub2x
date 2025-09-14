"use client"

import { useCallback, useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useVoiceProfileCreation } from "@/contexts/VoiceProfileContext"
import { toast } from "sonner"
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

interface VoiceProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VoiceProfileModal({ isOpen, onClose }: VoiceProfileModalProps) {
  const [dragActive, setDragActive] = useState(false)
  
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

  // Debug logging
  useEffect(() => {
    console.log("VoiceProfileModal: State changed", {
      isOpen,
      selectedFiles: selectedFiles.length,
      isCreating,
      error,
      hasFailedAttempt
    })
  }, [isOpen, selectedFiles, isCreating, error, hasFailedAttempt])

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return `${file.name}: Invalid file type. Please use JPEG, PNG, or WebP images.`
    }
    
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return `${file.name}: File too large. Maximum size is 10MB.`
    }
    
    return null
  }

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newFiles = [...selectedFiles]
    let hasErrors = false
    
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        hasErrors = true
        break
      }
      
      // Check if file already exists
      const exists = newFiles.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      )
      
      if (!exists && newFiles.length < 10) {
        newFiles.push(file)
      }
    }
    
    if (!hasErrors) {
      setError(null)
      if (newFiles.length > 10) {
        setSelectedFiles(newFiles.slice(0, 10))
        setError("Maximum 10 images allowed. Only the first 10 were selected.")
      } else {
        setSelectedFiles(newFiles)
      }
    }
  }, [selectedFiles, setSelectedFiles, setError])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setError(null)
  }, [selectedFiles, setSelectedFiles, setError])

  const handleUpload = async () => {
    const result = await startCreation()
    if (result.shouldCloseModal) {
      onClose()
    }
  }

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!isOpen) return
    
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
      handleFiles(imageFiles)
      toast.success(`${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} pasted successfully!`)
    }
  }, [isOpen, handleFiles])

  // Add paste event listener when modal is open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('paste', handlePaste)
      return () => {
        document.removeEventListener('paste', handlePaste)
      }
    }
  }, [isOpen, handlePaste])

  const handleClose = () => {
    if (!isCreating) {
      onClose()
      // Only clear error, keep files for retry
      clearError()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
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

        <div className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive
                ? "border-indigo-500 bg-indigo-50"
                : selectedFiles.length > 0
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isCreating}
            />
            
            <div className="flex flex-col items-center gap-3">
              {isCreating ? (
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              ) : selectedFiles.length > 0 ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <Upload className={`w-12 h-12 ${dragActive ? "text-indigo-500" : "text-gray-400"}`} />
              )}
              
              <div>
                <p className={`text-lg font-medium ${isCreating ? "text-indigo-600" : selectedFiles.length > 0 ? "text-green-700" : "text-gray-700"}`}>
                  {isCreating
                    ? "Starting voice profile creation..."
                    : selectedFiles.length > 0
                    ? `${selectedFiles.length} image${selectedFiles.length > 1 ? "s" : ""} selected`
                    : dragActive
                    ? "Drop your images here"
                    : "Drag & drop images here, click to browse, or paste from clipboard"
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports JPEG, PNG, WebP • Max 10 images • Up to 10MB each • Paste with Ctrl+V (Cmd+V on Mac)
                </p>
              </div>
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h4>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <ImageIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isCreating}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
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
      </DialogContent>
    </Dialog>
  )
}

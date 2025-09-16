"use client"

import { Upload, CheckCircle, Loader2 } from "lucide-react"
import { useDragAndDrop } from "@/hooks/useDragAndDrop"

interface VoiceProfileDropAreaProps {
  selectedFiles: File[]
  isCreating: boolean
  onFilesSelected: (files: FileList | File[]) => void
  disabled?: boolean
}

export function VoiceProfileDropArea({
  selectedFiles,
  isCreating,
  onFilesSelected,
  disabled = false
}: VoiceProfileDropAreaProps) {
  const { dragActive, handleDrag, handleDrop } = useDragAndDrop(onFilesSelected)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFilesSelected(e.target.files)
    }
  }

  return (
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
        disabled={disabled || isCreating}
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
          <p className={`text-lg font-medium ${
            isCreating 
              ? "text-indigo-600" 
              : selectedFiles.length > 0 
              ? "text-green-700" 
              : "text-gray-700"
          }`}>
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
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { X, Image as ImageIcon } from "lucide-react"

interface VoiceProfileFileListProps {
  files: File[]
  onRemoveFile: (index: number) => void
  disabled?: boolean
}

export function VoiceProfileFileList({ 
  files, 
  onRemoveFile, 
  disabled = false 
}: VoiceProfileFileListProps) {
  if (files.length === 0) return null

  return (
    <div className="mt-4 max-h-48 overflow-y-auto">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h4>
      <div className="space-y-2">
        {files.map((file, index) => (
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
              onClick={() => onRemoveFile(index)}
              disabled={disabled}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

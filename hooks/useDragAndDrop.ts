"use client"

import { useCallback, useState } from "react"

export interface DragAndDropHandlers {
  dragActive: boolean
  handleDrag: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
}

export function useDragAndDrop(
  onFilesDropped: (files: FileList) => void
): DragAndDropHandlers {
  const [dragActive, setDragActive] = useState(false)

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
      onFilesDropped(e.dataTransfer.files)
    }
  }, [onFilesDropped])

  return {
    dragActive,
    handleDrag,
    handleDrop,
  }
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { VoiceProfileModal } from "@/components/VoiceProfileModal"
import { useVoiceProfileCreation } from "@/contexts/VoiceProfileContext"
import { Sparkles, User, MessageSquare } from "lucide-react"

interface VoiceProfileBannerProps {
  className?: string
}

export function VoiceProfileBanner({ className = "" }: VoiceProfileBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const voiceProfileState = useVoiceProfileCreation()
  const { hasFailedAttempt, simulateFailure, selectedFiles, isCreating, error, clearError } = voiceProfileState

  // Debug: log all state changes
  useEffect(() => {
    console.log("VoiceProfileBanner: State changed", {
      hasFailedAttempt,
      selectedFiles: selectedFiles.length,
      isCreating,
      error,
      isModalOpen
    })
  }, [hasFailedAttempt, selectedFiles, isCreating, error, isModalOpen])

  // Auto-open modal if there's a failed attempt
  useEffect(() => {
    console.log("VoiceProfileBanner: hasFailedAttempt changed to", hasFailedAttempt)
    if (hasFailedAttempt && !isModalOpen) {
      console.log("VoiceProfileBanner: Opening modal due to failed attempt")
      setIsModalOpen(true)
    }
  }, [hasFailedAttempt, isModalOpen])

  return (
    <>
      <div className={`w-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Create your voice profile to start generating content
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Upload screenshots of your X profile to analyze your writing style and generate personalized tweets that sound authentically like you.
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center text-xs text-gray-500">
                  <User className="w-3 h-3 mr-1" />
                  Analyze your style
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Generate authentic content
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Create Voice Profile
            </Button>
            {/* Debug button - remove in production */}
            <Button
              onClick={simulateFailure}
              variant="outline"
              className="text-xs px-3 py-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              Test Failure
            </Button>
          </div>
        </div>
      </div>

      <VoiceProfileModal 
        isOpen={isModalOpen} 
        onClose={() => {
          console.log("VoiceProfileBanner: Modal closing")
          setIsModalOpen(false)
          // Clear error state when modal is manually closed
          if (hasFailedAttempt) {
            clearError()
          }
        }} 
      />
    </>
  )
}

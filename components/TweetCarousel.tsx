"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2, Hash, Calendar, Send, ChevronLeft, ChevronRight } from "lucide-react"
import { usePosts, useGenerateTweets, usePostAction, useApproveDraft, useRejectDraft } from "@/lib/api"
import { PostItem } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"

interface TweetCarouselProps {
  className?: string
}

interface CarouselItem {
  type: 'draft' | 'scheduled' | 'generate'
  data: any
  index: number
}

// Generate random aesthetic gradients - Light Cool Japanese Theme
const generateRandomGradient = (index: number) => {
  const gradients = [
    "from-slate-200 via-blue-100 to-indigo-100",
    "from-gray-100 via-slate-100 to-blue-50",
    "from-zinc-100 via-gray-50 to-slate-100",
    "from-neutral-100 via-gray-100 to-blue-100",
    "from-stone-100 via-neutral-100 to-slate-100",
    "from-gray-50 via-zinc-100 to-blue-50",
    "from-slate-50 via-gray-100 to-indigo-50",
    "from-neutral-50 via-stone-100 to-gray-100",
    "from-zinc-50 via-neutral-100 to-slate-100",
    "from-gray-100 via-zinc-50 to-blue-100",
  ]
  
  return gradients[index % gradients.length]
}

export function TweetCarousel({ className }: TweetCarouselProps) {
  const [actioningIds, setActioningIds] = useState<Set<string>>(new Set())
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Use TanStack Query hooks - fetch all posts with pagination
  const { data: postsData, isLoading: postsLoading } = usePosts({}, { limit: 20 })

  // Mutations
  const generateTweetsMutation = useGenerateTweets()
  const postActionMutation = usePostAction()
  const approveDraftMutation = useApproveDraft()
  const rejectDraftMutation = useRejectDraft()

  // Filter posts by status - API returns data array
  const allPosts = postsData?.data || []
  const drafts = allPosts.filter((post: any) => post.status === 'DRAFT')
  const scheduledPosts = allPosts.filter((post: any) => post.status === 'SCHEDULED')

  // Debug log to see the actual data structure
  console.log('TweetCarousel postsData:', postsData)
  console.log('TweetCarousel allPosts:', allPosts)

  // Generate a single tweet
  const generateSingleTweet = async () => {
    try {
      const result = await generateTweetsMutation.mutateAsync()

      if (result.success && result.data) {
        setGenerateSuccess('Generated 1 new tweet!')
        setTimeout(() => setGenerateSuccess(null), 5000)
      } else {
        const errorMessage = getErrorMessage(result.code, result.error)
        setGenerateError(errorMessage)
        setTimeout(() => setGenerateError(null), 8000)
      }
    } catch (error) {
      console.error('Failed to generate tweet:', error)
      setGenerateError('Something went wrong. Please try again.')
      setTimeout(() => setGenerateError(null), 8000)
    }
  }

  // Handle post actions (post now, approve, reject)
  const handlePostAction = async (id: string, action: 'post_now' | 'approve' | 'reject') => {
    setActioningIds(prev => new Set([...prev, id]))

    try {
      if (action === 'approve') {
        await approveDraftMutation.mutateAsync(id)
      } else if (action === 'reject') {
        await rejectDraftMutation.mutateAsync(id)
      } else if (action === 'post_now') {
        await postActionMutation.mutateAsync({ id, data: { action } })
      }
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActioningIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const getErrorMessage = (code?: string, error?: string): string => {
    switch (code) {
      case 'UNAUTHORIZED':
        return 'Please log in to generate tweets.'
      case 'VOICE_PROFILE_MISSING':
        return 'Please complete your onboarding to create a voice profile.'
      case 'NO_SOURCES':
        return 'Please add some subreddits to generate content from.'
      case 'NO_X_ACCOUNT':
        return 'Please connect your X (Twitter) account first.'
      case 'NO_REDDIT_CONTENT':
        return 'No content found from your subreddits. Please try again later.'
      case 'TWEET_GENERATION_FAILED':
        return 'Failed to generate tweet. Please try again later.'
      default:
        return error || 'An unexpected error occurred.'
    }
  }

  const formatRelativeTime = (date: Date | string) => {
    const now = new Date()
    const dateObj = new Date(date)
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const getTimeUntilNext = (scheduledFor: Date | string) => {
    const now = new Date().getTime()
    const scheduled = new Date(scheduledFor).getTime()
    const timeLeft = scheduled - now

    if (timeLeft <= 0) return "Due now"

    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `in ${hours}h ${minutes}m`
    } else {
      return `in ${minutes}m`
    }
  }

  const formatScheduledDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Create carousel items
  const allItems = useMemo(() => {
    const items: CarouselItem[] = []

    // Add draft cards
    drafts.forEach((draft: any, index: number) => {
      items.push({
        type: 'draft',
        data: draft,
        index
      })
    })

    // Add scheduled tweet cards
    scheduledPosts.forEach((tweet: any, index: number) => {
      items.push({
        type: 'scheduled',
        data: tweet,
        index: drafts.length + index
      })
    })

    // Add generate more card
    items.push({
      type: 'generate',
      data: null,
      index: drafts.length + scheduledPosts.length
    })

    return items
  }, [drafts, scheduledPosts])

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % allItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + allItems.length) % allItems.length)
  }

  // Render individual card
  const renderCard = (item: CarouselItem) => {
    const { type, data, index } = item
    const gradient = generateRandomGradient(index)

    if (type === 'draft' && data) {
      const draft = data
      const isActioning = actioningIds.has(draft.id)

      return (
        <div
          key={`draft-${draft.id}`}
          className={cn(
            "relative h-80 w-64 md:h-96 md:w-80 flex-shrink-0 rounded-3xl overflow-hidden",
            "bg-gradient-to-br", gradient
          )}
        >
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative z-10 h-full flex flex-col p-4 text-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-yellow-100/90 text-yellow-800 text-xs">
                DRAFT
              </Badge>
              <span className="text-xs text-gray-600">
                {formatRelativeTime(draft.createdAt)}
              </span>
            </div>

            {/* Tweet Content */}
            <div className="flex-1 bg-white/30 backdrop-blur-sm rounded-lg p-3 mb-3">
              <p className="text-gray-800 text-sm leading-relaxed line-clamp-6">
                {draft.content || draft.draft?.text || 'No content available'}
              </p>
            </div>

            {/* Source Info */}
            <div className="flex items-center space-x-1 text-xs text-gray-600 mb-3">
              <Hash className="w-3 h-3" />
              <span>r/unknown</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handlePostAction(draft.id, 'approve')}
                disabled={isActioning || approveDraftMutation.isPending}
                className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs h-8 shadow-sm border border-emerald-200"
              >
                {isActioning || approveDraftMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handlePostAction(draft.id, 'reject')}
                disabled={isActioning || rejectDraftMutation.isPending}
                className="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs h-8 shadow-sm border border-rose-200"
              >
                {isActioning || rejectDraftMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Reject
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    if (type === 'scheduled' && data) {
      const tweet = data
      const isActioning = actioningIds.has(tweet.id)

      return (
        <div
          key={`scheduled-${tweet.id}`}
          className={cn(
            "relative h-80 w-64 md:h-96 md:w-80 flex-shrink-0 rounded-3xl overflow-hidden",
            "bg-gradient-to-br", gradient
          )}
        >
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative z-10 h-full flex flex-col p-4 text-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-blue-100/90 text-blue-800 text-xs">
                SCHEDULED
              </Badge>
              <span className="text-xs text-gray-600 bg-white/30 px-2 py-1 rounded-full">
                {getTimeUntilNext(tweet.scheduledFor)}
              </span>
            </div>

            {/* Tweet Content */}
            <div className="flex-1 bg-white/30 backdrop-blur-sm rounded-lg p-3 mb-3">
              <p className="text-gray-800 text-sm leading-relaxed line-clamp-6">
                {tweet.content || tweet.draft?.text || 'No content available'}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <Hash className="w-3 h-3" />
                <span>Unknown</span>
              </div>
              <span>{formatScheduledDate(tweet.scheduledFor)}</span>
            </div>

            {/* Action Button */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handlePostAction(tweet.id, 'post_now')}
                disabled={isActioning || postActionMutation.isPending}
                className="flex-1 bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs h-8 shadow-sm border border-sky-200"
              >
                {isActioning || postActionMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-1" />
                    Post Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    if (type === 'generate') {
      return (
        <div
          key="generate-more"
          className={cn(
            "relative h-80 w-64 md:h-96 md:w-80 flex-shrink-0 rounded-3xl overflow-hidden",
            "bg-gradient-to-br", gradient
          )}
        >
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-gray-800 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full mb-4">
              <Calendar className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generate More</h3>
            <p className="text-gray-600 text-sm mb-4">
              Create a new tweet from your curated Reddit sources.
            </p>

            <Button
              onClick={generateSingleTweet}
              disabled={generateTweetsMutation.isPending}
              className="bg-gray-700 hover:bg-gray-800 text-white border-0 backdrop-blur-sm text-xs h-8"
            >
              {generateTweetsMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="w-3 h-3 mr-1" />
                  Generate Tweet
                </>
              )}
            </Button>
          </div>
        </div>
      )
    }

    return null
  }

  if (postsLoading) {
    return (
      <div className={cn("glass-card p-6 rounded-xl", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  const hasContent = drafts.length > 0 || scheduledPosts.length > 0

  return (
    <div className={cn("glass-card p-6 rounded-xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
      </div>

      {/* Success/Error Messages */}
      {(generateSuccess || generateError) && (
        <div className="mb-6">
          {generateSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 text-sm font-medium">{generateSuccess}</span>
              </div>
            </div>
          )}
          {generateError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 text-sm">{generateError}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Carousel */}
      {hasContent ? (
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                {renderCard(allItems[currentSlide])}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {allItems.length > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={allItems.length <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex space-x-2">
                {Array.from({ length: allItems.length }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      index === currentSlide ? 'bg-gray-800' : 'bg-gray-300'
                    )}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={allItems.length <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center py-12 md:py-16">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full mb-4">
            <Calendar className="w-7 h-7 md:w-8 md:h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Get started by generating your first tweet from your curated Reddit sources.
          </p>

          <Button
            onClick={generateSingleTweet}
            disabled={generateTweetsMutation.isPending}
            className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            {generateTweetsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Generate Tweet
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
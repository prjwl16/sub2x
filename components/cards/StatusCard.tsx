"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Hash, Loader2, CheckCircle, AlertCircle, Send, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { useState, useRef } from "react"
import Link from "next/link"
import { useDrafts, usePosts, useUsage, useGenerateTweets, usePostAction, useApproveDraft, useRejectDraft } from "@/lib/api"

interface StatusCardProps {}

export function StatusCard({}: StatusCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [actioningIds, setActioningIds] = useState<Set<string>>(new Set())
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Use TanStack Query hooks
  const { data: draftsData, isLoading: draftsLoading } = useDrafts({ status: 'DRAFT' }, { limit: 5 })
  const { data: postsData, isLoading: postsLoading } = usePosts({ status: 'SCHEDULED' }, { limit: 5 })
  const { data: usage } = useUsage()
  const { data: lastPostedData } = usePosts({ status: 'POSTED' }, { limit: 1 })
  
  // Mutations
  const generateTweetsMutation = useGenerateTweets()
  const postActionMutation = usePostAction()
  const approveDraftMutation = useApproveDraft()
  const rejectDraftMutation = useRejectDraft()

  const drafts = draftsData?.items || []
  const upcomingTweets = postsData?.items || []
  const lastPostedTweet = lastPostedData?.items?.[0] || null
  const isLoading = draftsLoading || postsLoading

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      case 'POSTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Navigate carousel
  const nextSlide = () => {
    const totalItems = drafts.length + upcomingTweets.length + 1 // +1 for generate card
    setCurrentSlide(prev => (prev + 1) % totalItems)
  }

  const prevSlide = () => {
    const totalItems = drafts.length + upcomingTweets.length + 1
    setCurrentSlide(prev => (prev - 1 + totalItems) % totalItems)
  }

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="space-y-4 p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const nextScheduledTweet = upcomingTweets[0]
  const nextPostTime = nextScheduledTweet?.scheduledFor
  const allItems = [...drafts, ...upcomingTweets]

  return (
    <div className="glass-card p-6 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
        <Link href="/tweets" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50">
          <Eye className="w-4 h-4 mr-1" />
          View all
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 text-center rounded-lg border border-gray-200/60 bg-white/50 divide-x divide-gray-200/80 mb-6 overflow-hidden">
        <div className="p-3 md:p-4">
          <div className="font-semibold text-gray-900 text-sm md:text-base">
            {nextPostTime ? getTimeUntilNext(nextPostTime) : 'None scheduled'}
          </div>
          <div className="text-xs md:text-sm text-gray-500">Next post</div>
        </div>
        <div className="p-3 md:p-4">
          <div className="font-semibold text-gray-900 text-sm md:text-base">
            {lastPostedTweet ? formatRelativeTime(lastPostedTweet.postedAt!) : 'None yet'}
          </div>
          <div className="text-xs md:text-sm text-gray-500">Last post</div>
        </div>
        <div className="p-3 md:p-4">
          <div className="font-semibold text-gray-900 text-sm md:text-base">
            {usage ? `${usage.postsPosted}/${usage.postsAllotted}` : '0/0'}
          </div>
          <div className="text-xs md:text-sm text-gray-500">This month</div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(generateSuccess || generateError) && (
        <div className="mb-4">
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

      {/* Carousel Section */}
      <div className="relative">
        {allItems.length > 0 ? (
          <>
            {/* Carousel */}
            <div className="overflow-hidden">
              <div 
                ref={carouselRef}
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Draft Cards */}
                {drafts.map((draft) => (
                  <div key={`draft-${draft.id}`} className="w-full flex-shrink-0">
                    <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/60 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-5 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(draft.status)}>
                            DRAFT
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(draft.createdAt)}
                          </span>
                        </div>
                        
                        {/* Tweet Content - Full Text */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {draft.text}
                          </p>
                        </div>

                        {/* Source Info */}
                        {draft.sourceItem && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Hash className="w-4 h-4" />
                            <span>r/{draft.sourceItem.subreddit?.name || 'unknown'}</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handlePostAction(draft.id, 'approve')}
                            disabled={actioningIds.has(draft.id) || approveDraftMutation.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {actioningIds.has(draft.id) || approveDraftMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handlePostAction(draft.id, 'reject')}
                            disabled={actioningIds.has(draft.id) || rejectDraftMutation.isPending}
                            className="flex-1"
                          >
                            {actioningIds.has(draft.id) || rejectDraftMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {/* Scheduled Tweet Cards */}
                {upcomingTweets.map((tweet) => (
                  <div key={`tweet-${tweet.id}`} className="w-full flex-shrink-0">
                    <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/60 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-5 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(tweet.status)}>
                            SCHEDULED
                          </Badge>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {getTimeUntilNext(tweet.scheduledFor)}
                          </span>
                        </div>
                        
                        {/* Tweet Content - Full Text */}
                        {tweet.draft && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {tweet.draft.text}
                            </p>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Hash className="w-4 h-4" />
                            <span>{tweet.socialAccount.username || 'Unknown'}</span>
                          </div>
                          <span className="text-gray-500">
                            {formatScheduledDate(tweet.scheduledFor)}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handlePostAction(tweet.id, 'post_now')}
                            disabled={actioningIds.has(tweet.id) || postActionMutation.isPending}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            {actioningIds.has(tweet.id) || postActionMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-1" />
                                Post Now
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {/* Generate More Card - Always Last */}
                <div className="w-full flex-shrink-0">
                  <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/60 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5 flex flex-col items-center justify-center min-h-[300px] text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Generate More</h3>
                      <p className="text-gray-600 mb-6 max-w-sm">
                        Create a new tweet from your curated Reddit sources.
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
                            <Plus className="w-4 h-4 mr-2" />
                            Generate Tweet
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Navigation */}
            {allItems.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  disabled={allItems.length + 1 <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: allItems.length + 1 }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentSlide ? 'bg-gray-800' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  disabled={allItems.length + 1 <= 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-12 md:py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full mb-4">
              <Plus className="w-7 h-7 md:w-8 md:h-8 text-gray-400" />
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
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Tweet
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

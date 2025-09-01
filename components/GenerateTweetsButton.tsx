'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface GeneratedTweet {
  id: string
  text: string
  scheduledFor: string
  sourcePost?: {
    title: string
    subreddit: string
  }
}

interface GenerateTweetsResponse {
  success: boolean
  data?: {
    tweetsGenerated: number
    tweets: GeneratedTweet[]
  }
  error?: string
  code?: string
}

interface GenerateTweetsButtonProps {
  onSuccess?: (tweets: GeneratedTweet[]) => void
  onError?: (error: string, code?: string) => void
  className?: string
}

export function GenerateTweetsButton({ 
  onSuccess, 
  onError, 
  className 
}: GenerateTweetsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTweets = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/tweets/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookie
      })
      
      const result: GenerateTweetsResponse = await response.json()
      
      if (result.success && result.data) {
        console.log(`Generated ${result.data.tweetsGenerated} tweets!`)
        onSuccess?.(result.data.tweets)
      } else {
        const errorMessage = getErrorMessage(result.code, result.error)
        console.error('Tweet generation failed:', errorMessage)
        onError?.(errorMessage, result.code)
      }
    } catch (error) {
      console.error('Failed to generate tweets:', error)
      onError?.('Something went wrong. Please try again.', 'NETWORK_ERROR')
    } finally {
      setIsGenerating(false)
    }
  }

  const getErrorMessage = (code?: string, error?: string): string => {
    switch (code) {
      case 'UNAUTHORIZED':
        return 'Please log in to generate tweets.'
      case 'DAILY_LIMIT_REACHED':
        return 'You\'ve reached your daily tweet limit. New tweets will be generated tomorrow.'
      case 'SCHEDULE_NOT_ACTIVE':
        return 'Tweet generation is not enabled. Please set up your posting schedule first.'
      case 'VOICE_PROFILE_MISSING':
        return 'Please complete your onboarding to create a voice profile.'
      case 'NO_SOURCES':
        return 'Please add some subreddits to generate content from.'
      case 'NO_X_ACCOUNT':
        return 'Please connect your X (Twitter) account first.'
      case 'NO_REDDIT_CONTENT':
        return 'No content found from your subreddits. Please try again later.'
      case 'TWEET_GENERATION_FAILED':
        return 'Failed to generate tweets. Please try again later.'
      default:
        return error || 'An unexpected error occurred.'
    }
  }

  return (
    <Button
      onClick={generateTweets}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Generating...
        </>
      ) : (
        'Generate Tweets'
      )}
    </Button>
  )
}

// Usage example component
export function TweetGenerationExample() {
  const [tweets, setTweets] = useState<GeneratedTweet[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = (generatedTweets: GeneratedTweet[]) => {
    setTweets(generatedTweets)
    setError(null)
    // You could show a toast notification here
    console.log('Tweets generated successfully!')
  }

  const handleError = (errorMessage: string, code?: string) => {
    setError(errorMessage)
    setTweets([])
    
    // Handle specific error cases
    if (code === 'VOICE_PROFILE_MISSING') {
      // Redirect to onboarding
      window.location.href = '/onboarding'
    }
    // You could show a toast notification here
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Generate Tweets</h2>
        <GenerateTweetsButton
          onSuccess={handleSuccess}
          onError={handleError}
          className="bg-blue-500 hover:bg-blue-600"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {tweets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-md font-medium text-green-700">
            ✅ Generated {tweets.length} tweet{tweets.length !== 1 ? 's' : ''}!
          </h3>
          
          {tweets.map((tweet) => (
            <div key={tweet.id} className="bg-gray-50 border rounded-md p-3">
              <p className="text-sm font-medium mb-2">{tweet.text}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Scheduled: {new Date(tweet.scheduledFor).toLocaleString()}
                </span>
                {tweet.sourcePost && (
                  <span>
                    From r/{tweet.sourcePost.subreddit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

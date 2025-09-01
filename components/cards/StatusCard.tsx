"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {  Activity, Plus, Calendar, Hash } from "lucide-react"
import { useState, useEffect } from "react"
import type { PostItem, UsageSummary } from "@/types/api"

interface StatusCardProps {}

export function StatusCard({}: StatusCardProps) {
  const [upcomingTweets, setUpcomingTweets] = useState<PostItem[]>([])
  const [usage, setUsage] = useState<UsageSummary | null>(null)
  const [lastPostedTweet, setLastPostedTweet] = useState<PostItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch upcoming tweets (scheduled posts)
        const tweetsResponse = await fetch('/api/posts?status=SCHEDULED&limit=10')
        if (tweetsResponse.ok) {
          const tweetsData = await tweetsResponse.json()
          setUpcomingTweets(tweetsData.data || [])
        }

        // Fetch usage data
        const usageResponse = await fetch('/api/usage')
        if (usageResponse.ok) {
          const usageData = await usageResponse.json()
          setUsage(usageData.data)
        }

        // Fetch last posted tweet
        const lastPostResponse = await fetch('/api/posts?status=POSTED&limit=1')
        if (lastPostResponse.ok) {
          const lastPostData = await lastPostResponse.json()
          if (lastPostData.data && lastPostData.data.length > 0) {
            setLastPostedTweet(lastPostData.data[0])
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const getTimeUntilNext = (scheduledFor: Date) => {
    const now = new Date().getTime()
    const scheduled = scheduledFor.getTime()
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

  const truncateText = (text: string, maxLength: number = 80) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const formatScheduledDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">Status</CardTitle>
            <Activity className="w-5 h-5 text-gray-500" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">Status</CardTitle>
            <Activity className="w-5 h-5 text-gray-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  const nextScheduledTweet = upcomingTweets[0]
  const nextPostTime = nextScheduledTweet?.scheduledFor

  return (
    <div className="glass-card p-6 rounded-xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Content</h2>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {nextPostTime ? getTimeUntilNext(nextPostTime) : 'None scheduled'}
            </div>
            <div className="text-gray-500">Next post</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {lastPostedTweet ? formatRelativeTime(lastPostedTweet.postedAt!) : 'None yet'}
            </div>
            <div className="text-gray-500">Last post</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {usage ? `${usage.postsPosted}/${usage.postsAllotted}` : '0/0'}
            </div>
            <div className="text-gray-500">This month</div>
          </div>
        </div>
      </div>

      {/* Main Carousel Section */}
      <div className="space-y-4">
        {upcomingTweets.length > 0 ? (
          <div className="relative">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide">
              {upcomingTweets.map((tweet, index) => (
                <div 
                  key={tweet.id}
                  className="flex-shrink-0 w-96 snap-start"
                >
                  <div className="bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl p-5 hover:shadow-md transition-all duration-200">
                    {/* Tweet Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">
                          {formatScheduledDate(tweet.scheduledFor)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {getTimeUntilNext(tweet.scheduledFor)}
                      </span>
                    </div>
                    
                    {/* Tweet Content */}
                    {tweet.draft && (
                      <div className="mb-4">
                        <p className="text-gray-800 leading-relaxed text-base">
                          {truncateText(tweet.draft.text, 140)}
                        </p>
                      </div>
                    )}
                    
                    {/* Tweet Footer */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Hash className="w-4 h-4" />
                        <span>{tweet.socialAccount.username || 'Unknown'}</span>
                      </div>
                      <div className="text-gray-400">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel Navigation Dots */}
            {upcomingTweets.length > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                {upcomingTweets.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === 0 ? 'bg-gray-800' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled content</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by generating your first tweet from your curated Reddit sources.
            </p>
            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Tweet
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

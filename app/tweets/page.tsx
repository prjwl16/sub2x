"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/DashboardHeader"
import { Check, X, Calendar, Hash, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import type { DraftItem } from "@/types/api"
import { AuthGuard } from "@/components/guards/AuthGuard"
import { useAuth } from "@/hooks/useAuth"
import { postsApi } from "@/lib/api/services"

interface TweetsPageState {
  drafts: DraftItem[]
  isLoading: boolean
  error: string | null
  processingIds: Set<string>
  currentPage: number
  totalPages: number
  hasMore: boolean
}

function TweetsPageContent() {
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState<TweetsPageState>({
    drafts: [],
    isLoading: true,
    error: null,
    processingIds: new Set(),
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  })

  const fetchDrafts = async (page: number = 1) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await postsApi.listDrafts()
      if (response) {
        const data = response
        setState(prev => ({
          ...prev,
          drafts: data.items || [],
          currentPage: page,
          totalPages: Math.ceil((data.meta?.total || 0) / 10),
          hasMore: (data.meta?.total || 0) > page * 10,
          isLoading: false,
        }))
      } else {
        setState(prev => ({
          ...prev,
          error: 'Failed to fetch tweets',
          isLoading: false,
        }))
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch tweets',
        isLoading: false,
      }))
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchDrafts(1)
    }
  }, [isAuthenticated])

  const handleAction = async (draftId: string, action: 'approve' | 'reject') => {
    setState(prev => ({
      ...prev,
      processingIds: new Set([...prev.processingIds, draftId])
    }))

    try {
      const response = await fetch(`/api/posts/${draftId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        // Update the draft status in the local state
        setState(prev => ({
          ...prev,
          drafts: prev.drafts.map(draft =>
            draft.id === draftId
              ? { ...draft, status: action === 'approve' ? 'POSTED' : 'REJECTED' }
              : draft
          ),
          processingIds: new Set([...prev.processingIds].filter(id => id !== draftId))
        }))
      } else {
        const errorData = await response.json()
        console.error('Failed to update draft:', errorData)
        setState(prev => ({
          ...prev,
          processingIds: new Set([...prev.processingIds].filter(id => id !== draftId))
        }))
      }
    } catch (error) {
      console.error('Error updating draft:', error)
      setState(prev => ({
        ...prev,
        processingIds: new Set([...prev.processingIds].filter(id => id !== draftId))
      }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      case 'POSTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Please sign in to view your tweets</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grid">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generated Tweets</h1>
            <p className="text-gray-600 mt-2">Review and manage all your AI-generated tweets</p>
          </div>
        </div>

        {/* Loading State */}
        {state.isLoading && state.drafts.length === 0 && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-red-700">{state.error}</p>
          </div>
        )}

        {/* Tweets Grid */}
        {state.drafts.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {state.drafts.map((draft) => (
                <Card key={draft.id} className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(draft.status)}>
                        {draft.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(draft.createdAt)}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Tweet Text */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {draft.text}
                      </p>
                    </div>

                    {/* Source Info */}
                    {draft.sourceItem && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Hash className="w-4 h-4" />
                        <span>
                          r/{draft.sourceItem.subreddit?.name || 'unknown'}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {draft.status === 'DRAFT' && (
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction(draft.id, 'approve')}
                          disabled={state.processingIds.has(draft.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {state.processingIds.has(draft.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(draft.id, 'reject')}
                          disabled={state.processingIds.has(draft.id)}
                          className="flex-1"
                        >
                          {state.processingIds.has(draft.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {state.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDrafts(state.currentPage - 1)}
                  disabled={state.currentPage === 1 || state.isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {state.currentPage} of {state.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDrafts(state.currentPage + 1)}
                  disabled={state.currentPage === state.totalPages || state.isLoading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!state.isLoading && state.drafts.length === 0 && !state.error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tweets generated yet</h3>
            <p className="text-gray-600">
              Start by generating some tweets from your dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TweetsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthGuard>
        <TweetsPageContent />
      </AuthGuard>
    </Suspense>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus, Settings, Loader2, RefreshCw, ExternalLink } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { AddSubredditsModal } from "@/components/modals/AddSubredditsModal"

interface Community {
  id: string
  name: string
  url: string
  isActive: boolean
  priority?: number
  title?: string | null
  nsfw?: boolean
  lastUsedAt?: Date | null
}

interface CommunitiesCardProps {
  onReorder?: (communities: Community[]) => void
  onManage?: () => void
}

export function CommunitiesCard({
  onReorder,
  onManage
}: CommunitiesCardProps) {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [localCommunities, setLocalCommunities] = useState<Community[]>([])

  // Load communities from API
  const loadCommunities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/sources', { method: 'GET', cache: 'no-store' })
      if (!res.ok) {
        throw new Error('Failed to load communities')
      }
      const json = await res.json()
      const data = json.data ?? []
      setCommunities(data)
      setLocalCommunities(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load communities')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load communities on mount
  useEffect(() => {
    loadCommunities()
  }, [loadCommunities])

  // Handle adding new subreddits
  const handleAddSubreddits = useCallback(async (subreddits: string[]) => {
    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subreddits }),
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText || 'Failed to add communities')
    }
    
    // Refresh the list
    await loadCommunities()
  }, [loadCommunities])

  // Get existing subreddit names for the modal
  const existingSubredditNames = communities.map(c => 
    c.name.replace(/^r\//, '').toLowerCase()
  )

  return (
    <>
      <Card className="glass-card hover:translate-y-[-2px] transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Communities
            </CardTitle>
            <div className="flex space-x-2">
              {!loading && (
                <Button
                  onClick={loadCommunities}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={() => setShowAddModal(true)}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
              <Button
                onClick={onManage}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
                disabled={loading}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading communities...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-3">
                <Users className="w-12 h-12 mx-auto mb-2 text-red-300" />
                <p className="text-sm">{error}</p>
              </div>
              <Button
                onClick={loadCommunities}
                variant="outline"
                size="sm"
                className="border-red-300 hover:bg-red-50 text-red-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : localCommunities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm mb-2">No communities added yet</p>
              <p className="text-xs text-gray-400 mb-4">Add subreddits to start generating content from your favorite communities</p>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Community
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {localCommunities.slice(0, 10).map((community) => (
                  <div
                    key={community.id}
                    className={`
                      inline-flex items-center px-4 py-2 dark:px-2 rounded-full border text-sm transition-all select-none shrink-0 whitespace-nowrap group
                      ${community.isActive 
                        ? 'border-black bg-white text-black shadow-sm' 
                        : 'border-gray-300 bg-gradient-to-br from-white to-gray-50 text-gray-700'
                      }
                    `}
                  >
                    <button
                      onClick={() => window.open(community.url, '_blank')}
                      className={`
                        flex items-center justify-center w-4 h-4 rounded-full transition-colors hover:scale-105
                        ${community.isActive 
                          ? 'hover:bg-gray-100' 
                          : 'hover:bg-gray-200'
                        }
                      `}
                      title={`Open ${community.name} in new tab`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <span className={`h-2.5 w-2.5 rounded-full ${community.isActive ? 'bg-white' : 'border border-current opacity-50'}`} />
                    <span className="font-medium truncate max-w-[12rem]">
                      {community.name}
                    </span>
                    {community.nsfw && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${community.isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>
                        NSFW
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              {localCommunities.length > 10 && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    Showing 10 of {localCommunities.length} communities
                  </p>
                  <Button
                    onClick={onManage}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    View all communities
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddSubredditsModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSubreddits}
        existingSubreddits={existingSubredditNames}
      />
    </>
  )
}

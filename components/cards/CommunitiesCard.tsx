"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, GripVertical, Settings, Loader2, RefreshCw } from "lucide-react"
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
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) return

    const draggedIndex = localCommunities.findIndex(c => c.id === draggedItem)
    const targetIndex = localCommunities.findIndex(c => c.id === targetId)
    
    const newCommunities = [...localCommunities]
    const [draggedCommunity] = newCommunities.splice(draggedIndex, 1)
    newCommunities.splice(targetIndex, 0, draggedCommunity)
    
    setLocalCommunities(newCommunities)
    onReorder?.(newCommunities)
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

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
            <div className="space-y-2">
              {localCommunities.map((community) => (
                <div
                  key={community.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, community.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, community.id)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg border border-gray-200 
                    hover:bg-gray-50 transition-colors cursor-move group
                    ${draggedItem === community.id ? 'opacity-50' : ''}
                  `}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-gray-600" />
                  <div className="flex items-center space-x-2 flex-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        {community.name}
                      </span>
                      {community.title && (
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">
                          {community.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {community.nsfw && (
                      <Badge variant="destructive" className="text-xs">
                        NSFW
                      </Badge>
                    )}
                    <Badge 
                      variant={community.isActive ? "default" : "secondary"}
                      className={community.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                    >
                      {community.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {localCommunities.length > 0 && (
            <div className="text-xs text-gray-500 text-center pt-2">
              Drag to reorder communities
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

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, GripVertical, Settings } from "lucide-react"
import { useState } from "react"

interface Community {
  id: string
  name: string
  url: string
  isActive: boolean
}

interface CommunitiesCardProps {
  communities?: Community[]
  onReorder?: (communities: Community[]) => void
  onAdd?: () => void
  onManage?: () => void
}

export function CommunitiesCard({
  communities = [
    { id: "1", name: "r/technology", url: "https://reddit.com/r/technology", isActive: true },
    { id: "2", name: "r/programming", url: "https://reddit.com/r/programming", isActive: true },
    { id: "3", name: "r/startups", url: "https://reddit.com/r/startups", isActive: true },
    { id: "4", name: "r/entrepreneur", url: "https://reddit.com/r/entrepreneur", isActive: false }
  ],
  onReorder,
  onAdd,
  onManage
}: CommunitiesCardProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [localCommunities, setLocalCommunities] = useState(communities)

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
    <Card className="glass-card hover:translate-y-[-2px] transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Communities
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={onAdd}
              variant="outline"
              size="sm"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
            <Button
              onClick={onManage}
              variant="outline"
              size="sm"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {localCommunities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No communities added yet</p>
            <Button
              onClick={onAdd}
              variant="outline"
              size="sm"
              className="mt-3 border-gray-300 hover:bg-gray-50"
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
                  hover:bg-gray-50 transition-colors cursor-move
                  ${draggedItem === community.id ? 'opacity-50' : ''}
                `}
              >
                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex items-center space-x-2 flex-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-800">
                    {community.name}
                  </span>
                </div>
                <Badge 
                  variant={community.isActive ? "default" : "secondary"}
                  className={community.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                >
                  {community.isActive ? "Active" : "Inactive"}
                </Badge>
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
  )
}

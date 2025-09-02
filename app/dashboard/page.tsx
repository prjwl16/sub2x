"use client"

import { useState, Suspense } from "react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { ConnectedAccountCard } from "@/components/cards/ConnectedAccountCard"
import { PostingPlanCard } from "@/components/cards/PostingPlanCard"
import { CommunitiesCard } from "@/components/cards/CommunitiesCard"
import { StatusCard } from "@/components/cards/StatusCard"
import { EditPlanModal } from "@/components/modals/EditPlanModal"
import { useAuth } from "@/hooks/useAuth"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Toast, useToast } from "@/components/ui/toast"

function DashboardContent() {
  const { user, account, usage } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  const [editPlanOpen, setEditPlanOpen] = useState(false)

  const handleReorderCommunities = async (communities: any[]) => {
    try {
      // TODO: Call API to reorder communities
      console.log("Reordered communities:", communities)
      addToast("Communities reordered successfully!", "success")
    } catch (error) {
      addToast("Failed to reorder communities", "error")
    }
  }

  const handleManageCommunities = () => {
    // TODO: Open manage communities modal/page
    console.log("Manage communities")
    addToast("Manage communities feature coming soon!", "info")
  }

  return (
    <div className="min-h-screen bg-grid">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back, {user?.name || "User"}!
              </h1>
              <p className="text-gray-600">
                @{user?.handle || account?.username || "your-handle"}
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Status Card - Full Width */}
        <div className="mb-8">
          <StatusCard />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PostingPlanCard
            onEditPlan={() => setEditPlanOpen(true)}
          />

          <CommunitiesCard
            onReorder={handleReorderCommunities}
            onManage={handleManageCommunities}
          />
        </div>
      </div>

      {/* Modals and Drawers */}
      <EditPlanModal
        open={editPlanOpen}
        onOpenChange={setEditPlanOpen}
      />

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

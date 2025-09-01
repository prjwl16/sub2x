"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { ConnectedAccountCard } from "@/components/cards/ConnectedAccountCard"
import { PostingPlanCard } from "@/components/cards/PostingPlanCard"
import { CommunitiesCard } from "@/components/cards/CommunitiesCard"
import { StatusCard } from "@/components/cards/StatusCard"
import { EditPlanModal } from "@/components/modals/EditPlanModal"
import { PreviewTweetDrawer } from "@/components/drawers/PreviewTweetDrawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Toast, useToast } from "@/components/ui/toast"

export default function Dashboard() {
  const { data: session } = useSession()
  const { toasts, addToast, removeToast } = useToast()
  const [editPlanOpen, setEditPlanOpen] = useState(false)
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false)
  const [planData, setPlanData] = useState({
    monthlyLimit: 100,
    postsThisMonth: 23,
    schedule: "1/day at 9:00 AM",
    timezone: "IST",
    isActive: true
  })

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Please sign in to access your dashboard</h1>
        </div>
      </div>
    )
  }

  const handleEditPlan = (data: any) => {
    setPlanData(prev => ({
      ...prev,
      monthlyLimit: data.monthlyLimit,
      schedule: `${data.postsPerDay}/day at ${data.time}`,
      timezone: data.timezone,
      isActive: data.isActive
    }))
  }

  const handleToggleActive = (active: boolean) => {
    setPlanData(prev => ({ ...prev, isActive: active }))
  }

  const handleReorderCommunities = (communities: any[]) => {
    // TODO: Call API to reorder communities
    console.log("Reordered communities:", communities)
    addToast("Communities reordered successfully!", "success")
  }

  return (
    <div className="min-h-screen bg-grid">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Avatar className="w-12 h-12">
              <AvatarImage src={session.user.image} alt={session.user.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                {session.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back, {session.user.name}!
              </h1>
              <p className="text-gray-600">
                @{session.user.handle || "your-handle"}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ConnectedAccountCard 
            handle={session.user.handle}
            isConnected={true}
            expiresAt={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}
          />
          
          <PostingPlanCard
            monthlyLimit={planData.monthlyLimit}
            postsThisMonth={planData.postsThisMonth}
            schedule={planData.schedule}
            timezone={planData.timezone}
            isActive={planData.isActive}
            onEditPlan={() => setEditPlanOpen(true)}
            onToggleActive={handleToggleActive}
          />
          
          <CommunitiesCard
            onReorder={handleReorderCommunities}
            onAdd={() => console.log("Add community")}
            onManage={() => console.log("Manage communities")}
          />
          
          <StatusCard
            onPreviewNext={() => setPreviewDrawerOpen(true)}
          />
        </div>
      </div>

      {/* Modals and Drawers */}
      <EditPlanModal
        open={editPlanOpen}
        onOpenChange={setEditPlanOpen}
        onSave={handleEditPlan}
        initialData={{
          postsPerDay: 1,
          time: "09:00",
          timezone: "IST",
          isActive: true,
          monthlyLimit: 100
        }}
      />

      <PreviewTweetDrawer
        open={previewDrawerOpen}
        onOpenChange={setPreviewDrawerOpen}
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

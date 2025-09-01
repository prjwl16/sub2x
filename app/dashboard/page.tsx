"use client"

import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/GlassCard";
import { SignOutButton } from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Calendar, 
  Users, 
  Activity, 
  Settings, 
  Clock,
  CheckCircle,
  Plus
} from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Please sign in to access your dashboard</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <Avatar className="w-12 h-12">
            <AvatarImage src={session.user.image} alt={session.user.name || ""} />
            <AvatarFallback>
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
        {/* Connected Account Card */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Connected Account</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            <X className="w-8 h-8 text-blue-500" />
            <div>
              <p className="font-medium text-gray-800">@{session.user.handle || "your-handle"}</p>
              <p className="text-sm text-gray-600">Twitter/X Account</p>
            </div>
          </div>
        </GlassCard>

        {/* Posting Plan Card */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Posting Plan</h2>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Monthly Limit</span>
              <span className="font-semibold text-gray-800">100 tweets</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Schedule</span>
              <span className="font-semibold text-gray-800">1/day at 9:00 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Active
              </Badge>
            </div>
          </div>
        </GlassCard>

        {/* Communities Card */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Communities</h2>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">r/technology</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">r/programming</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">r/startups</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <Button variant="ghost" className="w-full text-sm text-gray-500">
              + Add more communities
            </Button>
          </div>
        </GlassCard>

        {/* Status Card */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Status</h2>
            <Activity className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Next Post</span>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-800">Tomorrow 9:00 AM</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Post</span>
              <span className="font-semibold text-gray-800">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-800">23 tweets</span>
            </div>
            <Button variant="outline" className="w-full">
              Preview Next Tweet
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <Users className="w-6 h-6" />
            <span>Select Communities</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <Calendar className="w-6 h-6" />
            <span>Set Schedule</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <Activity className="w-6 h-6" />
            <span>Preview Next Tweet</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

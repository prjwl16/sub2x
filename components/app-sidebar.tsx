"use client"

import * as React from "react"
import {
  Clock,
  Library,
  Palette,
  User,
  Command,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Queue",
      url: "/dashboard/queue",
      icon: Clock,
      isActive: true,
    },
    {
      title: "Library",
      url: "/dashboard/library",
      icon: Library,
    },
    {
      title: "Studio",
      url: "/dashboard/studio",
      icon: Palette,
    },
    {
      title: "Personalities",
      url: "/dashboard/personalities",
      icon: User,
    },
  ],
  navSecondary: [],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Create user data for NavUser component
  const userData = user ? {
    name: user.name,
    username: user.username,
    avatar: user.avatar,
  } : {
    name: "Guest",
    username: "guest",
    avatar: "",
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sub2X</span>
                  <span className="truncate text-xs">AI Content Studio</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

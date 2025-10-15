"use client"

import { useAutoCloseSidebar } from "@/hooks/useAutoCloseSidebar"

/**
 * Wrapper component that handles auto-closing the sidebar on mobile navigation.
 * This component doesn't render anything visible but provides the auto-close functionality.
 */
export function AutoCloseSidebarWrapper() {
  useAutoCloseSidebar()
  return null
}

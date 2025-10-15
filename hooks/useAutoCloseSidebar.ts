"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"

/**
 * Hook that automatically closes the mobile sidebar when navigation occurs.
 * This improves UX on smaller devices by preventing the sidebar from staying open
 * after the user navigates to a different page.
 */
export function useAutoCloseSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const previousPathname = useRef(pathname)
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Skip the initial mount to prevent immediate closing
    if (isInitialMount.current) {
      isInitialMount.current = false
      previousPathname.current = pathname
      return
    }

    // Only close sidebar on mobile devices when pathname actually changes
    if (isMobile && previousPathname.current !== pathname) {
      setOpenMobile(false)
    }
    
    previousPathname.current = pathname
  }, [pathname, isMobile, setOpenMobile])
}

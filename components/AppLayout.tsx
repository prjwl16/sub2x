"use client"

import * as React from "react"

interface AppLayoutProps {
  children: React.ReactNode
}

/**
 * Main application layout wrapper that provides global search functionality
 * and other app-wide features
 */
export function AppLayout({ children }: AppLayoutProps) {

  return (
    <>
      {children}
    </>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading, token, setToken } = useAuthStore()

  useEffect(() => {
    const urlToken = searchParams.get('token')
    const status = searchParams.get('status')

    if (urlToken && status === 'success') {
      // Set the token from URL params
      setToken(urlToken)
      
      // Clean up the URL by removing the token and status params
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('token')
      newUrl.searchParams.delete('status')
      window.history.replaceState({}, '', newUrl.toString())
      
      return
    }

    // If we require auth and user is not authenticated, redirect to auth page
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push('/auth')
      return
    }
  }, [isAuthenticated, isLoading, requireAuth, router, searchParams, setToken])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If auth is required and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}

'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function AuthInitializer() {
  const { token, isAuthenticated, fetchUserData } = useAuth()

  useEffect(() => {
    // If we have a token but no user data, fetch it
    if (token && isAuthenticated) {
      fetchUserData()
    }
  }, [token, isAuthenticated, fetchUserData])

  // This component doesn't render anything
  return null
}

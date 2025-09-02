import React from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useMe, useUsage } from '@/lib/api'

export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    token,
    user,
    usage,
    setToken,
    setUser,
    setUsage,
    setLoading,
    logout,
  } = useAuthStore()

  // Only make API calls if we have a token
  const { data: meData, isLoading: meLoading, error: meError } = useMe({
    enabled: !!token && isAuthenticated,
  })
  const { data: usageData, isLoading: usageLoading, error: usageError } = useUsage({
    enabled: !!token && isAuthenticated,
  })

  // Update store when API data changes
  React.useEffect(() => {
    if (meData) {
      setUser(meData.user)
    }
  }, [meData, setUser])

  React.useEffect(() => {
    if (usageData) {
      setUsage(usageData)
    }
  }, [usageData, setUsage])

  return {
    // State
    isAuthenticated,
    isLoading: isLoading || (!!token && (meLoading || usageLoading)),
    token,
    user: user || meData?.user,
    account: meData?.account && meData.account.username ? {
      id: meData.account.id,
      provider: meData.account.provider,
      providerAccountId: meData.account.providerAccountId,
      username: meData.account.username,
      displayName: meData.account.displayName || '',
      expiresAt: meData.account.expiresAt,
    } : null,
    usage: usage || usageData,
    
    // Actions
    setToken,
    setUser,
    setUsage,
    setLoading,
    logout,
    
    // Computed values
    isLoggedIn: isAuthenticated && !!token,
    remainingPosts: (usage || usageData) ? (usage || usageData)!.postsAllotted - (usage || usageData)!.postsPosted : 0,
    
    // API state
    meError,
    usageError,
  }
}

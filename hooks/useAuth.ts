import React from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useMe } from '@/lib/api/hooks'

export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    token,
    user,
    setToken,
    setUser,
    setLoading,
    logout,
  } = useAuthStore()

  // Only make API calls if we have a token
  const { data: meData, isLoading: meLoading, error: meError } = useMe({
    enabled: !!token && isAuthenticated,
  })

  // Update store when API data changes
  React.useEffect(() => {
    if (meData) {
      setUser(meData.user)
    }
  }, [meData, setUser])


  return {
    // State
    isAuthenticated,
    isLoading: isLoading || (!!token && (meLoading)),
    token,
    user: user || meData?.user,
    account: meData?.account && meData.account.username ? {
      id: meData.account.id,
      provider: meData.account.provider,
      providerAccountId: meData.account.providerAccountId,
      username: meData.account.username,
      displayName: meData.account.displayName || '',
      expiresAt: meData.account.expiresAt,
      isVoiceProfileCreated: meData.account.isVoiceProfileCreated || false,
    } : null,
    
    // Actions
    setToken,
    setUser,
    setLoading,
    logout,
    
    // Computed values
    isLoggedIn: isAuthenticated && !!token,
    
    // API state
    meError,
  }
} 

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
      setUser(meData)
    }
  }, [meData, setUser])

  // Get the first integration (X account) for backward compatibility
  const xIntegration = user?.integrations?.find(integration => integration.type === 'X') || meData?.integrations?.find(integration => integration.type === 'X')

  return {
    // State
    isAuthenticated,
    isLoading: isLoading || (!!token && (meLoading)),
    token,
    user: user || meData,
    account: xIntegration ? {
      id: xIntegration.id,
      provider: xIntegration.type,
      providerAccountId: xIntegration.accountId,
      username: xIntegration.accountName,
      displayName: xIntegration.accountName,
      expiresAt: null,
      isVoiceProfileCreated: false, // This would need to be determined from voice profile API
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

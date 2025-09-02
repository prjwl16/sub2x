import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  handle?: string | null
  createdAt: string
  updatedAt: string
}

export interface Usage {
  postsAllotted: number
  postsScheduled: number
  postsPosted: number
}

export interface AuthState {
  // Auth state
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  
  // User data
  user: User | null
  usage: Usage | null
  
  // Actions
  setToken: (token: string) => void
  setUser: (user: User) => void
  setUsage: (usage: Usage) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      isLoading: false,
      token: null,
      usage: null,

      // Actions
      setToken: (token: string) => {
        // Persist token for API client interceptor
        try {
          localStorage.setItem('auth_token', token)
        } catch (_) {}
        set({ token, isAuthenticated: true })
      },

      setUser: (user: User) => {
        set({ user })
      },

      setUsage: (usage: Usage) => {
        set({ usage })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      logout: () => {
        try {
          localStorage.removeItem('auth_token')
        } catch (_) {}
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          usage: null,
        })
      },

      // fetchUserData: async () => { // This function is removed
      //   const { token } = get()
      //   if (!token) return

      //   set({ isLoading: true })
        
      //   try {
      //     const response = await fetch('/api/me', {
      //       headers: {
      //         'Authorization': `Bearer ${token}`,
      //         'Content-Type': 'application/json',
      //       },
      //     })

      //     if (response.ok) {
      //       const data = await response.json()
      //       if (data.ok && data.data) {
      //         set({
      //           user: data.data.user,
      //           account: data.data.account,
      //           usage: data.data.usage,
      //           isAuthenticated: true,
      //         })
      //       }
      //     } else {
      //       // Token might be invalid, logout
      //       get().logout()
      //     }
      //   } catch (error) {
      //     console.error('Error fetching user data:', error)
      //     get().logout()
      //   } finally {
      //     set({ isLoading: false })
      //   }
      // },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

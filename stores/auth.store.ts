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

export interface AuthState {
  // Auth state
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  
  // User data
  user: User | null
  
  // Actions
  setToken: (token: string) => void
  setUser: (user: User) => void
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

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      logout: () => {
        try {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth-storage')
        } catch (_) {}
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        })
      },    
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

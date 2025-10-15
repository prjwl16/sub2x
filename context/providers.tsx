"use client"

import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

// Optimized query client configuration for performance
const createQueryClientConfig = () => ({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - longer stale time for better performance
      gcTime: 10 * 60 * 1000, // 10 minutes - longer cache time to reduce re-fetches
      retry: (failureCount: number, error: any) => {
        // Don't retry on 4xx errors, only on network/5xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false, // Disable for better UX - users don't expect data to change on focus
      refetchOnReconnect: true, // Keep this for when connection is restored
      refetchOnMount: true, // Ensure fresh data on component mount
    },
    mutations: {
      retry: 1, // Only retry mutations once
      networkMode: 'online' as const, // Only run mutations when online
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(createQueryClientConfig()))

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { VoiceProfileProvider } from '@/contexts/VoiceProfileContext'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <VoiceProfileProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </VoiceProfileProvider>
    </QueryClientProvider>
  )
}

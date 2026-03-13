'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 min before refetch
            gcTime: 5 * 60 * 1000, // 5 min in cache after unmount
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000), // 1s → 2s → cap 10s
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0, // mutations should not retry automatically
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

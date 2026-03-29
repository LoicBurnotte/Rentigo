'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export interface StripeStatus {
  connected: boolean
  charges_enabled?: boolean
  payouts_enabled?: boolean
  details_submitted?: boolean
}

/** Pass `enabled: false` when the hook is mounted but the user is not ready (e.g. auth loading). */
export function useStripeStatus(enabled = true) {
  return useQuery({
    queryKey: ['stripe', 'status'],
    queryFn: async (): Promise<StripeStatus> => {
      const { data } = await api.get('/api/stripe/status')
      return data
    },
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  })
}

export function useStripeConnect() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (locale: string): Promise<{ url?: string; error?: string }> => {
      const { data } = await api.post('/api/stripe/connect', { locale })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe', 'status'] })
    },
  })
}

export function useStripeDashboard() {
  return useMutation({
    mutationFn: async (locale: string): Promise<{ url?: string; error?: string }> => {
      const { data } = await api.post('/api/stripe/dashboard', { locale })
      return data
    },
  })
}

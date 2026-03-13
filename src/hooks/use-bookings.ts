'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { BookingWithDetails } from '@/types'

export function useBookings(userId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          '*, item:items(*, owner:users!owner_id(id, name, avatar_url), category:categories!category_id(*)), renter:users!renter_id(id, name, avatar_url)',
        )
        .or(`renter_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as unknown as BookingWithDetails[]
    },
    enabled: !!userId,
  })
}

export function useItemBookings(itemId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['bookings', 'item', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_date, end_date, status')
        .eq('item_id', itemId)
        .in('status', ['pending', 'confirmed'])

      if (error) throw error
      return data
    },
    enabled: !!itemId,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (booking: { item_id: string; start_date: string; end_date: string; total_price: number }) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create booking')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import api from '@/lib/api'
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

export function useItemUnavailabilities(itemId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['unavailabilities', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_unavailabilities')
        .select('*')
        .eq('item_id', itemId)
        .order('start_date', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!itemId,
  })
}

export function useAddUnavailability() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { item_id: string; start_date: string; end_date: string }) => {
      const { data, error } = await supabase
        .from('item_unavailabilities')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unavailabilities', data.item_id] })
    },
  })
}

export function useDeleteUnavailability() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, itemId }: { id: string; itemId: string }) => {
      const { error } = await supabase.from('item_unavailabilities').delete().eq('id', id)
      if (error) throw error
      return itemId
    },
    onSuccess: (itemId) => {
      queryClient.invalidateQueries({ queryKey: ['unavailabilities', itemId] })
    },
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (booking: {
      item_id: string
      start_date: string
      end_date: string
      total_price: number
      locale: string
    }) => {
      const { data } = await api.post('/api/bookings', booking)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

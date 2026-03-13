'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ItemWithOwner } from '@/types'

export function useFavorites(userId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('*, item:items(*, owner:users!owner_id(id, name, avatar_url), category:categories!category_id(*))')
        .eq('user_id', userId!)

      if (error) throw error
      return data.map((f) => f.item) as unknown as ItemWithOwner[]
    },
    enabled: !!userId,
  })
}

export function useFavoriteIds(userId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['favorite-ids', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('favorites').select('item_id').eq('user_id', userId!)

      if (error) throw error
      return new Set(data.map((f) => f.item_id))
    },
    enabled: !!userId,
  })
}

export function useToggleFavorite() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, userId, isFavorited }: { itemId: string; userId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('item_id', itemId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('favorites').insert({ user_id: userId, item_id: itemId })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] })
    },
  })
}

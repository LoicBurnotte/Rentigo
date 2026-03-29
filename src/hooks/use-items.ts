'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { SearchFilters, ItemWithOwner } from '@/types'

export function useItems(filters?: SearchFilters, options?: { showPaused?: boolean }) {
  const supabase = createClient()
  const showPaused = options?.showPaused ?? false

  return useQuery({
    queryKey: ['items', filters, showPaused],
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select('*, owner:users!owner_id(id, name, avatar_url, is_paused), category:categories!category_id(*)')

      if (!showPaused) {
        query = query.eq('is_paused', false)
      }

      if (filters?.query) {
        query = query.ilike('title', `%${filters.query}%`)
      }
      if (filters?.category) {
        query = query.eq('category_id', filters.category)
      }
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`)
      }
      if (filters?.minPrice) {
        query = query.gte('price_per_day', filters.minPrice)
      }
      if (filters?.maxPrice) {
        query = query.lte('price_per_day', filters.maxPrice)
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      })

      if (error) throw error

      let items = data as unknown as ItemWithOwner[]

      // Client-side filter: hide items where owner is paused (for marketplace)
      if (!showPaused) {
        items = items.filter((item) => !item.owner?.is_paused)
      }

      return items
    },
  })
}

export function useItem(slug: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['item', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, owner:users!owner_id(id, name, avatar_url, is_paused), category:categories!category_id(*)')
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data as unknown as ItemWithOwner
    },
    enabled: !!slug,
  })
}

export function useCreateItem() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: {
      title: string
      slug: string
      description: string
      category_id: string
      price_per_day: number
      city: string
      latitude: number
      longitude: number
      images: string[]
      owner_id: string
    }) => {
      const { data, error } = await supabase.from('items').insert(item).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useDeleteItem() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useUpdateItem() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string
      title: string
      description: string
      category_id: string
      price_per_day: number
      city: string
      latitude: number
      longitude: number
      images: string[]
    }) => {
      const { data, error } = await supabase.from('items').update(updates).eq('id', id).select().single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['item', data.slug] })
    },
  })
}

export function useToggleItemPause() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_paused }: { id: string; is_paused: boolean }) => {
      const { data, error } = await supabase
        .from('items')
        .update({ is_paused })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['item', data.slug] })
    },
  })
}

export function useToggleGlobalPause() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, is_paused }: { userId: string; is_paused: boolean }) => {
      const { error } = await supabase
        .from('users')
        .update({ is_paused })
        .eq('id', userId)

      if (error) throw error
      return { userId, is_paused }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

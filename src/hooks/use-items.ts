'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { SearchFilters, ItemWithOwner } from '@/types'

export function useItems(filters?: SearchFilters) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['items', filters],
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select('*, owner:users!owner_id(id, name, avatar_url), category:categories!category_id(*)')

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
      return data as unknown as ItemWithOwner[]
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
        .select('*, owner:users!owner_id(id, name, avatar_url), category:categories!category_id(*)')
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

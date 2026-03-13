'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message, ConversationWithDetails } from '@/types'

export function useConversations(userId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(
          '*, renter:users!conversations_renter_id_fkey(id, name, avatar_url), owner:users!conversations_owner_id_fkey(id, name, avatar_url), item:items!item_id(id, title, images)',
        )
        .or(`renter_id.eq.${userId},owner_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as unknown as ConversationWithDetails[]
    },
    enabled: !!userId,
  })
}

export function useMessages(conversationId: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as Message[]
    },
    enabled: !!conversationId,
  })

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.setQueryData<Message[]>(['messages', conversationId], (old) =>
            old ? [...old, payload.new as Message] : [payload.new as Message],
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase, queryClient])

  return query
}

export function useSendMessage() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      senderId,
      message,
    }: {
      conversationId: string
      senderId: string
      message: string
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          message,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      })
      // Messages are updated via realtime, but invalidate as fallback
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.conversationId],
      })
    },
  })
}

export function useCreateConversation() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ renterId, ownerId, itemId }: { renterId: string; ownerId: string; itemId: string }) => {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('renter_id', renterId)
        .eq('owner_id', ownerId)
        .eq('item_id', itemId)
        .single()

      if (existing) return existing

      const { data, error } = await supabase
        .from('conversations')
        .insert({ renter_id: renterId, owner_id: ownerId, item_id: itemId })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

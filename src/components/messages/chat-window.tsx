'use client'

import { useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import { useMessages, useSendMessage } from '@/hooks/use-messages'

interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useAuth()
  const { data: messages, isLoading } = useMessages(conversationId)
  const sendMessage = useSendMessage()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('messages')

  const { register, handleSubmit, reset } = useForm<{ message: string }>()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onSubmit = async (data: { message: string }) => {
    if (!user || !data.message.trim()) return

    await sendMessage.mutateAsync({
      conversationId,
      senderId: user.id,
      message: data.message.trim(),
    })
    reset()
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => {
          const isOwn = msg.sender_id === user?.id
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isOwn ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                <p className="text-sm">{msg.message}</p>
                <p className={`mt-1 text-xs ${isOwn ? 'text-emerald-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <input
            {...register('message')}
            placeholder={t('typePlaceholder')}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            autoComplete="off"
          />
          <Button type="submit" disabled={sendMessage.isPending}>
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  )
}

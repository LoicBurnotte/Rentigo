'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { useAuth } from '@/providers/auth-provider'
import { useConversations } from '@/hooks/use-messages'
import { PageLoading } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { MessageCircle, User } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

export default function MessagesPage() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const { data: conversations, isLoading } = useConversations(user?.id)
  const t = useTranslations('messages')
  const tc = useTranslations('common')

  if (loading) return <PageLoading />

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <MessageCircle size={48} className="mx-auto text-gray-300" />
          <h2 className="mt-4 text-xl font-bold text-text">{t('signInPrompt')}</h2>
          <Link href={`/auth/login?returnTo=${encodeURIComponent(pathname)}`}>
            <Button className="mt-4">{tc('signIn')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-text">{t('title')}</h1>
      <p className="mt-2 text-text-secondary">{t('subtitle')}</p>

      <div className="mt-8 space-y-2">
        {isLoading ? (
          <PageLoading />
        ) : !conversations?.length ? (
          <div className="py-12 text-center">
            <MessageCircle size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-text-secondary">{t('noConversations')}</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const otherUser = conv.renter.id === user.id ? conv.owner : conv.renter
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-alt">
                  {otherUser.avatar_url ? (
                    <Image
                      src={otherUser.avatar_url}
                      alt={otherUser.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <User size={24} className="text-text-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-text">{otherUser.name}</h3>
                    <span className="text-xs text-text-muted">{new Date(conv.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="truncate text-sm text-text-secondary">
                    {t('re')} {conv.item?.title}
                  </p>
                </div>
                {conv.item?.images?.[0] && (
                  <Image
                    src={getImageUrl(conv.item.images[0])}
                    alt={conv.item.title}
                    width={48}
                    height={48}
                    className="shrink-0 rounded-lg object-cover"
                  />
                )}
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

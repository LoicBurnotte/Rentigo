'use client'

import { useTranslations } from 'next-intl'
import { Link, useRouter, usePathname } from '@/i18n/navigation'
import { useAuth } from '@/providers/auth-provider'
import { useItems, useToggleGlobalPause } from '@/hooks/use-items'
import { OwnerItemCard } from '@/components/items/owner-item-card'
import { ItemCardSkeleton } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Package, Plus, PauseCircle } from 'lucide-react'
import { PageLoading } from '@/components/ui/loading'

export default function MyItemsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading } = useAuth()
  const { data: allItems, isLoading } = useItems(undefined, { showPaused: true })
  const toggleGlobalPause = useToggleGlobalPause()
  const t = useTranslations('myItems')

  if (loading) return <PageLoading />
  if (!user) {
    router.push(`/auth/login?returnTo=${encodeURIComponent(pathname)}`)
    return null
  }

  const myItems = allItems?.filter((item) => item.owner_id === user.id) ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">{t('title')}</h1>
          {!isLoading && myItems.length > 0 && (
            <p className="mt-1 text-sm text-text-secondary">
              {myItems.length === 1 ? t('count', { count: 1 }) : t('countPlural', { count: myItems.length })}
            </p>
          )}
        </div>
        <Link href="/items/new">
          <Button size="sm">
            <Plus size={16} className="mr-1.5" />
            {t('addListing')}
          </Button>
        </Link>
      </div>

      {/* Global pause toggle */}
      {!isLoading && myItems.length > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <PauseCircle size={20} className="text-text-muted" />
            <div>
              <p className="text-sm font-medium text-text">{t('pauseAllListings')}</p>
              <p className="text-xs text-text-secondary">{t('pauseAllDesc')}</p>
            </div>
          </div>
          <Toggle
            checked={profile?.is_paused ?? false}
            onChange={(checked) => toggleGlobalPause.mutate({ userId: user.id, is_paused: checked })}
            disabled={toggleGlobalPause.isPending}
          />
        </div>
      )}

      {profile?.is_paused && myItems.length > 0 && (
        <div className="mt-3 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          {t('allListingsPaused')}
        </div>
      )}

      {/* Content */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : myItems.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
              <Package size={28} className="text-orange-500" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-text">{t('noItems')}</h2>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">{t('noItemsHint')}</p>
            <Link href="/items/new" className="mt-6">
              <Button>
                <Plus size={16} className="mr-1.5" />
                {t('addListing')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myItems.map((item) => (
              <OwnerItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

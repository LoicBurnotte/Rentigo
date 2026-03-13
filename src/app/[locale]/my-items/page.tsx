'use client'

import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/providers/auth-provider'
import { useItems } from '@/hooks/use-items'
import { OwnerItemCard } from '@/components/items/owner-item-card'
import { ItemCardSkeleton } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'
import { PageLoading } from '@/components/ui/loading'

export default function MyItemsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { data: allItems, isLoading } = useItems()
  const t = useTranslations('myItems')

  if (loading) return <PageLoading />
  if (!user) {
    router.push('/auth/login')
    return null
  }

  const myItems = allItems?.filter((item) => item.owner_id === user.id) ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          {!isLoading && myItems.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
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
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <Package size={28} className="text-emerald-500" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{t('noItems')}</h2>
            <p className="mt-2 max-w-sm text-sm text-gray-500">{t('noItemsHint')}</p>
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

'use client'

import { useTranslations } from 'next-intl'
import { ItemCard } from './item-card'
import { ItemCardSkeleton } from '@/components/ui/loading'
import type { ItemWithOwner } from '@/types'

interface ItemGridProps {
  items?: ItemWithOwner[]
  isLoading?: boolean
}

export function ItemGrid({ items, isLoading }: ItemGridProps) {
  const t = useTranslations('marketplace')

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!items?.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-text-secondary">{t('noItems')}</p>
        <p className="mt-1 text-sm text-text-muted">{t('noItemsHint')}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}

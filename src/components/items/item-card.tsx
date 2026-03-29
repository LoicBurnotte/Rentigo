'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Heart, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency, getImageUrl, getCategoryTranslationKey } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { useFavoriteIds, useToggleFavorite } from '@/hooks/use-favorites'
import type { ItemWithOwner } from '@/types'

interface ItemCardProps {
  item: ItemWithOwner
}

export function ItemCard({ item }: ItemCardProps) {
  const { user } = useAuth()
  const { data: favoriteIds } = useFavoriteIds(user?.id)
  const toggleFavorite = useToggleFavorite()
  const isFavorited = favoriteIds?.has(item.id) ?? false
  const tc = useTranslations('common')
  const tCat = useTranslations('categories')

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    toggleFavorite.mutate({
      itemId: item.id,
      userId: user.id,
      isFavorited,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}>
      <Link
        href={`/items/${item.slug}`}
        className="group block overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-4/3 overflow-hidden bg-surface-alt">
          {item.images?.[0] ? (
            <Image
              src={getImageUrl(item.images[0])}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">No image</div>
          )}
          {user && (
            <button
              onClick={handleToggleFavorite}
              className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm transition-colors hover:bg-surface">
              <Heart size={16} className={isFavorited ? 'fill-red-500 text-red-500' : 'text-text-secondary'} />
            </button>
          )}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-surface/80 px-2.5 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
              {item.category?.slug
                ? tCat(getCategoryTranslationKey(item.category.slug) as Parameters<typeof tCat>[0])
                : item.category?.name}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-text line-clamp-1">{item.title}</h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
            <MapPin size={14} />
            <span>{item.city}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold text-orange-600">
              {formatCurrency(item.price_per_day)}
              <span className="text-sm font-normal text-text-secondary">{tc('perDay')}</span>
            </span>
            <span className="text-sm text-text-secondary">
              {tc('by')} {item.owner?.name}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

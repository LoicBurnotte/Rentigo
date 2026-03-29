'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Eye, Pencil, Trash2, MapPin, AlertTriangle, CalendarOff, PauseCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency, getImageUrl, getCategoryTranslationKey } from '@/lib/utils'
import { useDeleteItem, useToggleItemPause } from '@/hooks/use-items'
import { Toggle } from '@/components/ui/toggle'
import { Dialog } from '@/components/ui/dialog'
import { ItemAvailability } from '@/components/items/item-availability'
import type { ItemWithOwner } from '@/types'

interface OwnerItemCardProps {
  item: ItemWithOwner
}

export function OwnerItemCard({ item }: OwnerItemCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [availabilityOpen, setAvailabilityOpen] = useState(false)
  const deleteItem = useDeleteItem()
  const togglePause = useToggleItemPause()
  const t = useTranslations('myItems')
  const ta = useTranslations('availability')
  const tc = useTranslations('common')
  const tCat = useTranslations('categories')

  const handleDelete = () => {
    deleteItem.mutate(item.id, {
      onSuccess: () => setConfirming(false),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {/* Thumbnail */}
      <Link href={`/items/${item.slug}`} className="group relative aspect-4/3 overflow-hidden bg-surface-alt">
        {item.images?.[0] ? (
          <Image
            src={getImageUrl(item.images[0])}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted text-sm">No image</div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-surface/85 px-2.5 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
            {item.category?.slug
              ? tCat(getCategoryTranslationKey(item.category.slug) as Parameters<typeof tCat>[0])
              : item.category?.name}
          </span>
          {item.is_paused && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-1 text-xs font-medium text-amber-700 backdrop-blur-sm">
              <PauseCircle size={11} />
              {t('paused')}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-text line-clamp-1">{item.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
          <MapPin size={13} />
          <span>{item.city}</span>
        </div>
        <p className="mt-2 text-lg font-bold text-orange-600">
          {formatCurrency(item.price_per_day)}
          <span className="text-sm font-normal text-text-secondary"> {tc('perDay')}</span>
        </p>
      </div>

      {/* Pause toggle + availability */}
      <div className="flex items-center justify-between border-t border-border-light px-4 py-2">
        <Toggle
          checked={!item.is_paused}
          onChange={(active) => togglePause.mutate({ id: item.id, is_paused: !active })}
          disabled={togglePause.isPending}
          label={item.is_paused ? t('paused') : t('activateItem')}
        />
        <button
          onClick={() => setAvailabilityOpen(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-alt">
          <CalendarOff size={13} />
          {t('manageAvailability')}
        </button>
      </div>

      {/* Actions */}
      {!confirming ? (
        <div className="flex items-center gap-1 border-t border-border-light px-3 py-2.5">
          <Link
            href={`/items/${item.slug}`}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-alt">
            <Eye size={13} />
            {t('viewItem')}
          </Link>
          <Link
            href={`/items/${item.slug}/edit`}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-alt">
            <Pencil size={13} />
            {t('editItem')}
          </Link>
          <button
            onClick={() => setConfirming(true)}
            className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50">
            <Trash2 size={13} />
            {t('deleteItem')}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-red-100 bg-red-50 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-red-700">
            <AlertTriangle size={13} />
            <span>{t('deleteConfirm')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-surface">
              {t('cancelDelete')}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteItem.isPending}
              className="cursor-pointer rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60">
              {deleteItem.isPending ? t('deletingItem') : t('confirmDelete')}
            </button>
          </div>
        </div>
      )}
      {/* Availability dialog */}
      <Dialog open={availabilityOpen} onClose={() => setAvailabilityOpen(false)} title={ta('title')}>
        <ItemAvailability itemId={item.id} />
      </Dialog>
    </motion.div>
  )
}

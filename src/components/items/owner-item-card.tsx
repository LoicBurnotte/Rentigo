'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Eye, Pencil, Trash2, MapPin, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency, getImageUrl, getCategoryTranslationKey } from '@/lib/utils'
import { useDeleteItem } from '@/hooks/use-items'
import type { ItemWithOwner } from '@/types'

interface OwnerItemCardProps {
  item: ItemWithOwner
}

export function OwnerItemCard({ item }: OwnerItemCardProps) {
  const [confirming, setConfirming] = useState(false)
  const deleteItem = useDeleteItem()
  const t = useTranslations('myItems')
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
      className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Thumbnail */}
      <Link href={`/items/${item.slug}`} className="group relative aspect-4/3 overflow-hidden bg-gray-100">
        {item.images?.[0] ? (
          <Image
            src={getImageUrl(item.images[0])}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">No image</div>
        )}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
            {item.category?.slug
              ? tCat(getCategoryTranslationKey(item.category.slug) as Parameters<typeof tCat>[0])
              : item.category?.name}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={13} />
          <span>{item.city}</span>
        </div>
        <p className="mt-2 text-lg font-bold text-emerald-600">
          {formatCurrency(item.price_per_day)}
          <span className="text-sm font-normal text-gray-500"> {tc('perDay')}</span>
        </p>
      </div>

      {/* Actions */}
      {!confirming ? (
        <div className="flex items-center gap-1 border-t border-gray-100 px-3 py-2.5">
          <Link
            href={`/items/${item.slug}`}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100">
            <Eye size={13} />
            {t('viewItem')}
          </Link>
          <Link
            href={`/items/${item.slug}/edit`}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100">
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
              className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-white">
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
    </motion.div>
  )
}

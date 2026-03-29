'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Upload, X, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getImageUrl } from '@/lib/utils'
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/constants'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()
  const t = useTranslations('newItem')

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files?.length) return

      setUploading(true)
      const newImages: string[] = []

      for (const file of Array.from(files)) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) continue
        if (file.size > MAX_FILE_SIZE) continue
        if (images.length + newImages.length >= maxImages) break

        const fileExt = file.name.split('.').pop()
        const filePath = `${crypto.randomUUID()}.${fileExt}`

        const { error } = await supabase.storage.from('item-images').upload(filePath, file)

        if (!error) {
          newImages.push(filePath)
        }
      }

      onChange([...images, ...newImages])
      setUploading(false)
    },
    [images, maxImages, onChange, supabase.storage],
  )

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const setAsThumbnail = (index: number) => {
    const updated = [...images]
    const [img] = updated.splice(index, 1)
    updated.unshift(img)
    onChange(updated)
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-secondary">
        {t('photos')} (max {maxImages})
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {images.map((image, index) => (
          <div key={image} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
            <Image src={getImageUrl(image)} alt={`Upload ${index + 1}`} fill className="object-cover" />

            {/* Thumbnail badge */}
            {index === 0 && (
              <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                <Star size={10} className="fill-white" />
                {t('thumbnailBadge')}
              </div>
            )}

            {/* Set as thumbnail button (non-first images) */}
            {index > 0 && (
              <button
                type="button"
                onClick={() => setAsThumbnail(index)}
                title={t('setThumbnail')}
                className="absolute left-1 top-1 hidden cursor-pointer items-center gap-0.5 rounded-full bg-surface/90 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary shadow hover:bg-surface group-hover:flex">
                <Star size={10} />
                {t('setThumbnail')}
              </button>
            )}

            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-orange-500 hover:bg-orange-50/50">
            <Upload size={24} className="text-text-muted" />
            <span className="mt-1 text-xs text-text-secondary">{uploading ? t('uploading') : t('upload')}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  )
}

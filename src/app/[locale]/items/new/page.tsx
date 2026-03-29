'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createItemSchema, type ItemFormInput, type ItemInput } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { useCreateItem } from '@/hooks/use-items'
import { createSlug } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ImageUpload } from '@/components/items/image-upload'
import { PageLoading } from '@/components/ui/loading'
import { Plus } from 'lucide-react'
import type { Category } from '@/types'
import type { LocationValue } from '@/types/location'

const LocationPicker = dynamic(() => import('@/components/items/location-picker').then((mod) => mod.LocationPicker), {
  ssr: false,
  loading: () => <div className="h-10 animate-pulse rounded-lg bg-surface-alt" />,
})

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor').then((mod) => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-lg bg-surface-alt" />,
})

export default function NewItemPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const createItem = useCreateItem()
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [location, setLocation] = useState<LocationValue | undefined>()
  const [locationError, setLocationError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('newItem')
  const tv = useTranslations('validation')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormInput, unknown, ItemInput>({
    resolver: zodResolver(createItemSchema(tv)),
  })

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  if (loading) return <PageLoading />
  if (!user) {
    router.push(`/auth/login?returnTo=${encodeURIComponent(pathname)}`)
    return null
  }

  const handleLocationChange = (loc: LocationValue) => {
    setLocation(loc)
    setLocationError(null)
    setValue('city', loc.city, { shouldValidate: true })
    setValue('latitude', loc.latitude, { shouldValidate: true })
    setValue('longitude', loc.longitude, { shouldValidate: true })
  }

  const onSubmit = async (data: ItemInput) => {
    setError(null)

    if (images.length === 0) {
      setError(t('uploadAtLeastOne'))
      return
    }

    if (!location) {
      setLocationError(t('selectLocation'))
      return
    }

    try {
      const slug = createSlug(data.title)
      await createItem.mutateAsync({
        ...data,
        slug,
        images,
        owner_id: user.id,
      })
      router.push(`/items/${slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToCreate'))
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-text">{t('title')}</h1>
      <p className="mt-2 text-text-secondary">{t('subtitle')}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <Input
          id="title"
          label={t('itemTitle')}
          placeholder={t('titlePlaceholder')}
          error={errors.title?.message}
          {...register('title')}
        />

        <RichTextEditor
          label={t('descriptionLabel')}
          placeholder={t('descriptionPlaceholder')}
          error={errors.description?.message}
          onChange={(html) => setValue('description', html, { shouldValidate: true })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="category_id"
            label={t('category')}
            placeholder={t('selectCategory')}
            options={categories.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            error={errors.category_id?.message}
            {...register('category_id')}
          />

          <Input
            id="price_per_day"
            label={t('pricePerDay')}
            type="number"
            step="0.01"
            placeholder="25.00"
            error={errors.price_per_day?.message}
            {...register('price_per_day')}
          />
        </div>

        {/* Hidden fields populated by LocationPicker */}
        <input type="hidden" {...register('city')} />
        <input type="hidden" {...register('latitude')} />
        <input type="hidden" {...register('longitude')} />

        <LocationPicker value={location} onChange={handleLocationChange} error={locationError ?? undefined} />

        <ImageUpload images={images} onChange={setImages} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || createItem.isPending}>
          <Plus size={18} className="mr-2" />
          {isSubmitting ? t('creating') : t('createListing')}
        </Button>
      </form>
    </div>
  )
}

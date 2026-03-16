'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createItemSchema, type ItemFormInput, type ItemInput } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { useUpdateItem } from '@/hooks/use-items'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ImageUpload } from '@/components/items/image-upload'
import { PageLoading } from '@/components/ui/loading'
import { Save } from 'lucide-react'
import type { Category, ItemWithOwner } from '@/types'
import type { LocationValue } from '@/types/location'

const LocationPicker = dynamic(() => import('@/components/items/location-picker').then((mod) => mod.LocationPicker), {
  ssr: false,
  loading: () => <div className="h-10 animate-pulse rounded-lg bg-gray-100" />,
})

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor').then((mod) => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-lg bg-gray-100" />,
})

export default function EditItemPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { user, loading } = useAuth()
  const updateItem = useUpdateItem()
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [item, setItem] = useState<ItemWithOwner | null>(null)
  const [location, setLocation] = useState<LocationValue | undefined>()
  const [locationError, setLocationError] = useState<string | null>(null)
  const [descriptionHtml, setDescriptionHtml] = useState<string>('')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('editItem')
  const tv = useTranslations('validation')
  const tn = useTranslations('newItem')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormInput, unknown, ItemInput>({
    resolver: zodResolver(createItemSchema(tv)),
  })

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [itemRes, catRes] = await Promise.all([
        supabase
          .from('items')
          .select('*, owner:users!owner_id(id, name, avatar_url), category:categories!category_id(*)')
          .eq('slug', slug)
          .single(),
        supabase.from('categories').select('*'),
      ])

      if (catRes.data) setCategories(catRes.data)

      if (itemRes.data) {
        const itemData = itemRes.data as unknown as ItemWithOwner
        setItem(itemData)
        setImages(itemData.images ?? [])
        setDescriptionHtml(itemData.description ?? '')

        const loc: LocationValue = {
          latitude: itemData.latitude,
          longitude: itemData.longitude,
          city: itemData.city,
        }
        setLocation(loc)

        reset({
          title: itemData.title,
          description: itemData.description,
          category_id: itemData.category_id,
          price_per_day: itemData.price_per_day,
          city: itemData.city,
          latitude: itemData.latitude,
          longitude: itemData.longitude,
        })
      }

      setFetchLoading(false)
    }

    if (slug) fetchData()
  }, [slug, reset])

  if (loading || fetchLoading) return <PageLoading />
  if (!user) {
    router.push('/auth/login')
    return null
  }
  if (item && item.owner_id !== user.id) {
    router.push(`/items/${slug}`)
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
      setError(tn('uploadAtLeastOne'))
      return
    }

    if (!location) {
      setLocationError(tn('selectLocation'))
      return
    }

    try {
      await updateItem.mutateAsync({
        id: item!.id,
        ...data,
        images,
      })
      router.push(`/items/${slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToUpdate'))
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-gray-500">{t('subtitle')}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <Input
          id="title"
          label={tn('itemTitle')}
          placeholder={tn('titlePlaceholder')}
          error={errors.title?.message}
          {...register('title')}
        />

        <RichTextEditor
          label={tn('descriptionLabel')}
          placeholder={tn('descriptionPlaceholder')}
          error={errors.description?.message}
          value={descriptionHtml}
          onChange={(html) => {
            setDescriptionHtml(html)
            setValue('description', html, { shouldValidate: true })
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="category_id"
            label={tn('category')}
            placeholder={tn('selectCategory')}
            options={categories.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            error={errors.category_id?.message}
            {...register('category_id')}
          />

          <Input
            id="price_per_day"
            label={tn('pricePerDay')}
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

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || updateItem.isPending}>
          <Save size={18} className="mr-2" />
          {isSubmitting || updateItem.isPending ? t('saving') : t('saveChanges')}
        </Button>
      </form>
    </div>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SearchLocation } from './search-location'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'
import type { SelectedLocation } from '@/types/location'

const CATEGORY_NAME_KEYS: Record<string, string> = {
  tools: 'tools',
  cameras: 'cameras',
  'outdoor-gear': 'outdoorGear',
  'event-equipment': 'eventEquipment',
  electronics: 'electronics',
  'sports-equipment': 'sportsEquipment',
}

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('marketplace')
  const tc = useTranslations('categories')
  const tCommon = useTranslations('common')

  const [showFilters, setShowFilters] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [locationSelected, setLocationSelected] = useState<SelectedLocation | null>(() => {
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const city = searchParams.get('city')
    return lat && lng && city ? { display: city, lat, lng } : null
  })
  const [radius, setRadius] = useState(searchParams.get('radius') || '50')

  const clearLocation = () => {
    setLocationSelected(null)
    setRadius('50')
  }

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (locationSelected) {
      params.set('city', locationSelected?.display)
      params.set('lat', locationSelected?.lat || '')
      params.set('lng', locationSelected?.lng || '')
      params.set('radius', radius)
    }
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    router.push('/marketplace?' + params.toString())
  }, [query, category, locationSelected, radius, minPrice, maxPrice, router])

  const clearFilters = () => {
    setQuery('')
    setCategory('')
    clearLocation()
    setMinPrice('')
    setMaxPrice('')
    router.push('/marketplace')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters()
  }

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <Button onClick={applyFilters} size="lg">
          {tCommon('search')}
        </Button>
        <Button variant="outline" size="lg" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={18} />
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{t('filters')}</h3>
            <button onClick={clearFilters} className="text-sm text-emerald-600 hover:text-emerald-700">
              {t('clearAll')}
            </button>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option value="">{t('allCategories')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {tc(CATEGORY_NAME_KEYS[cat.slug] || cat.slug)}
                </option>
              ))}
            </select>
          </div>

          {/* Location picker */}
          <div className="mb-4">
            <SearchLocation label={t('locationSearch')} value={locationSelected} onChange={setLocationSelected} />
          </div>

          {/* Radius slider — visible only when location is selected */}
          {locationSelected && (
            <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{t('radius')}</span>
                <span className="font-semibold text-emerald-600">{radius} km</span>
              </div>
              <input
                type="range"
                min={5}
                max={150}
                step={5}
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-emerald-600"
              />
              <div className="mt-1.5 flex justify-between text-xs text-gray-400">
                <span>5 km</span>
                <span>150 km</span>
              </div>
            </div>
          )}

          {/* Price range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('minPrice')}
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Input
              label={t('maxPrice')}
              type="number"
              placeholder="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={applyFilters}>{t('applyFilters')}</Button>
          </div>
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => {
              const next = cat.slug === category ? '' : cat.slug
              setCategory(next)
              const params = new URLSearchParams(searchParams.toString())
              if (cat.slug === category) params.delete('category')
              else params.set('category', cat.slug)
              router.push('/marketplace?' + params.toString())
            }}
            className={
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ' +
              (cat.slug === category ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
            }>
            {tc(CATEGORY_NAME_KEYS[cat.slug] || cat.slug)}
            {cat.slug === category && <X size={14} />}
          </button>
        ))}
      </div>
    </div>
  )
}

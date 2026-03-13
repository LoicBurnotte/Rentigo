'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { SearchFilters } from '@/components/search/search-filters'
import { ItemGrid } from '@/components/items/item-grid'
import { useItems } from '@/hooks/use-items'
import { getDistanceKm } from '@/lib/utils'
import { MapPin } from 'lucide-react'
import type { SearchFilters as SearchFiltersType, ItemWithOwner } from '@/types'

function MarketplaceContent() {
  const searchParams = useSearchParams()
  const t = useTranslations('marketplace')

  const filters: SearchFiltersType = {
    query: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
  }

  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const cityParam = searchParams.get('city') || ''
  const radiusKm = searchParams.get('radius') ? Number(searchParams.get('radius')) : 50

  // Coords come directly from the URL — set when user picks a location from autocomplete
  const cityCoords = latParam && lngParam ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) } : null

  const { data: items, isLoading } = useItems(filters)

  // Client-side radius filter using haversine distance
  const filteredItems: ItemWithOwner[] | undefined =
    cityCoords && items
      ? items.filter(
          (item) =>
            item.latitude &&
            item.longitude &&
            getDistanceKm(item.latitude, item.longitude, cityCoords.lat, cityCoords.lng) <= radiusKm,
        )
      : items

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-gray-500">{t('subtitle')}</p>
      </div>

      <SearchFilters />

      {cityCoords && cityParam && (
        <div className="mt-4 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <MapPin size={14} className="shrink-0" />
          <span>{t('radiusActive', { radius: radiusKm, city: cityParam })}</span>
        </div>
      )}

      <div className="mt-8">
        <ItemGrid items={filteredItems} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceContent />
    </Suspense>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, SlidersHorizontal, X, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORIES } from '@/lib/constants'

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

type SelectedLocation = {
  display: string
  lat: string
  lng: string
}

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
  const [showFilters, setShowFilters] = useState(false)
  const t = useTranslations('marketplace')
  const tc = useTranslations('categories')
  const tCommon = useTranslations('common')

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  // Location state — initialise from URL if lat/lng already present
  const [locationInput, setLocationInput] = useState('')
  const [locationSelected, setLocationSelected] = useState<SelectedLocation | null>(() => {
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const city = searchParams.get('city')
    return lat && lng && city ? { display: city, lat, lng } : null
  })
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [radius, setRadius] = useState(searchParams.get('radius') || '50')

  const locationWrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Close suggestions dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationWrapRef.current && !locationWrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced Nominatim autocomplete
  useEffect(() => {
    if (locationSelected || locationInput.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      clearTimeout(debounceRef.current)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=${encodeURIComponent(locationInput)}`,
          { headers: { 'Accept-Language': 'en' } },
        )
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch {
        // ignore
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [locationInput, locationSelected])

  const selectSuggestion = (result: NominatimResult) => {
    const parts = result.display_name.split(',')
    const displayName = parts.slice(0, 3).join(',').trim()
    setLocationSelected({ display: displayName, lat: result.lat, lng: result.lon })
    setLocationInput('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const clearLocation = () => {
    setLocationSelected(null)
    setLocationInput('')
    setSuggestions([])
    setRadius('50')
  }

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (locationSelected) {
      params.set('city', locationSelected.display)
      params.set('lat', locationSelected.lat)
      params.set('lng', locationSelected.lng)
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('locationLabel')}</label>
            <div ref={locationWrapRef} className="relative">
              {locationSelected ? (
                /* Selected location chip */
                <div className="flex h-10 items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3">
                  <MapPin size={15} className="shrink-0 text-emerald-600" />
                  <span className="flex-1 truncate text-sm text-gray-800">{locationSelected.display}</span>
                  <button
                    onClick={clearLocation}
                    className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-emerald-100 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                /* Autocomplete input */
                <>
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  {searching && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                  )}
                  <input
                    type="text"
                    placeholder={t('locationSearch')}
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onKeyDown={(e) => e.key === 'Escape' && setShowSuggestions(false)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-8 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />

                  {/* Suggestions dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                      {suggestions.map((s) => {
                        const nameParts = s.display_name.split(',')
                        return (
                          <button
                            key={s.place_id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              selectSuggestion(s)
                            }}
                            className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50">
                            <MapPin size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                            <div className="min-w-0">
                              <span className="font-medium text-gray-900">{nameParts[0]}</span>
                              {nameParts.length > 1 && (
                                <span className="ml-1 truncate text-xs text-gray-400">
                                  {nameParts.slice(1, 3).join(',')}
                                </span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
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

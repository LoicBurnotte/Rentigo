'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NominatimResult, LocationValue } from '@/types/location'

interface LocationPickerProps {
  value?: LocationValue
  onChange: (location: LocationValue) => void
  error?: string
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 13)
  }, [lat, lng, map])
  return null
}

export function LocationPicker({ value, onChange, error }: LocationPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('newItem')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchAddress = useCallback(async (q: string) => {
    if (!q || q.length < 3) {
      setResults([])
      setShowResults(false)
      return
    }
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } },
      )
      const data: NominatimResult[] = await res.json()
      setResults(data)
      setShowResults(true)
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchAddress(val), 500)
  }

  const handleSelect = (result: NominatimResult) => {
    const city =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.address?.municipality ||
      result.address?.county ||
      result.address?.country ||
      ''

    // Show a concise label (street, city, country)
    const parts = result.display_name.split(',').slice(0, 3).join(',').trim()
    setQuery(parts)
    setShowResults(false)
    setResults([])

    onChange({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      city,
    })
  }

  const hasLocation = value && value.latitude !== 0 && value.longitude !== 0

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-secondary">{t('searchAddress')}</label>

      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder={t('addressPlaceholder')}
            autoComplete="off"
            className={`h-10 w-full rounded-lg border pl-9 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 ${
              error ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-orange-500'
            }`}
          />
          {searching && (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-muted" />
          )}
        </div>

        {showResults && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            {results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelect(result)}
                className="flex w-full cursor-pointer items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-page-alt dark:hover:bg-surface-alt">
                <MapPin size={14} className="mt-0.5 shrink-0 text-orange-500" />
                <span className="text-text-secondary">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {showResults && !searching && query.length >= 3 && results.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-secondary shadow-lg">
            {t('noAddressFound')}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {hasLocation && (
        <>
          <div className="overflow-hidden rounded-lg border border-border" style={{ height: '200px' }}>
            <MapContainer
              center={[value.latitude, value.longitude]}
              zoom={13}
              className="h-full w-full"
              scrollWheelZoom={false}
              zoomControl={false}
              attributionControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Circle
                center={[value.latitude, value.longitude]}
                radius={500}
                pathOptions={{
                  color: '#059669',
                  fillColor: '#d1fae5',
                  fillOpacity: 0.4,
                  weight: 2,
                }}
              />
              <MapRecenter lat={value.latitude} lng={value.longitude} />
            </MapContainer>
          </div>
          <p className="flex items-start gap-1.5 text-xs text-text-secondary">
            <MapPin size={12} className="mt-0.5 shrink-0 text-orange-500" />
            {t('approxLocationNote')}
          </p>
        </>
      )}
    </div>
  )
}

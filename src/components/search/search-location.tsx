import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MapPin, X, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { NominatimResult, SelectedLocation } from '@/types/location'

interface Props {
  label?: string
  value?: SelectedLocation | null
  placeholder?: string
  onChange: (value: SelectedLocation | null) => void
}

export function SearchLocation({ label, value, placeholder, onChange }: Props) {
  const searchParams = useSearchParams()
  const t = useTranslations('marketplace')
  const [locationInput, setLocationInput] = useState('')
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const locationWrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Sync from URL into parent state only when URL has location and parent state is empty (e.g. initial load or back navigation)
  useEffect(() => {
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const city = searchParams.get('city')
    if (lat && lng && city && !value) {
      onChange({ display: city, lat, lng })
    }
  }, [searchParams, value, onChange])

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
    if (value || locationInput.length < 2) {
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
  }, [locationInput, value])

  const selectSuggestion = (result: NominatimResult) => {
    const parts = result.display_name.split(',')
    const displayName = parts.slice(0, 3).join(',').trim()
    onChange({ display: displayName, lat: result.lat, lng: result.lon })
    setLocationInput('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const clearLocation = () => {
    onChange(null)
    setLocationInput('')
    setSuggestions([])
  }

  return (
    <>
      {label && <label className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</label>}
      <div ref={locationWrapRef} className="relative">
        {value ? (
          /* Selected location chip — click chip to change, X to clear */
          <div className="flex h-10 items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3">
            <MapPin size={15} className="shrink-0 text-orange-600" />
            <button
              type="button"
              onClick={clearLocation}
              className="min-w-0 flex-1 truncate text-left text-sm text-gray-800 hover:text-text-secondary">
              {value.display}
            </button>
            <button
              type="button"
              onClick={clearLocation}
              className="shrink-0 rounded p-0.5 text-text-muted hover:bg-orange-100 hover:text-text-secondary"
              aria-label="Clear">
              <X size={14} />
            </button>
          </div>
        ) : (
          /* Autocomplete input */
          <>
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            {searching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-muted" />
            )}
            <input
              type="text"
              placeholder={placeholder || t('locationPlaceholder')}
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={(e) => e.key === 'Escape' && setShowSuggestions(false)}
              className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-8 text-sm placeholder:text-text-muted focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
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
                      className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-page-alt dark:hover:bg-surface-alt">
                      <MapPin size={13} className="mt-0.5 shrink-0 text-orange-500" />
                      <div className="min-w-0">
                        <span className="font-medium text-text">{nameParts[0]}</span>
                        {nameParts.length > 1 && (
                          <span className="ml-1 truncate text-xs text-text-muted">{nameParts.slice(1, 3).join(',')}</span>
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
    </>
  )
}

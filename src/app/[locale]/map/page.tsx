'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useItems } from '@/hooks/use-items'
import { PageLoading } from '@/components/ui/loading'
import { DEFAULT_CENTER } from '@/lib/constants'
import { LocateFixed } from 'lucide-react'

const MapView = dynamic(() => import('@/components/map/map-view').then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <PageLoading />,
})

export default function MapPage() {
  const { data: items, isLoading } = useItems()
  const t = useTranslations('map')
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [locating, setLocating] = useState(false)

  // Try to center on user's location automatically on mount
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}, // silently fall back to DEFAULT_CENTER
      { timeout: 5000 },
    )
  }, [])

  const handleLocate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 },
    )
  }

  if (isLoading) return <PageLoading />

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500">{t('itemsAvailable', { count: items?.length || 0 })}</p>
        </div>
        {navigator?.geolocation && (
          <button
            onClick={handleLocate}
            disabled={locating}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60">
            <LocateFixed size={16} className={locating ? 'animate-pulse text-emerald-500' : ''} />
            {t('myLocation')}
          </button>
        )}
      </div>
      <div className="flex-1">
        <MapView items={items || []} center={center} />
      </div>
    </div>
  )
}

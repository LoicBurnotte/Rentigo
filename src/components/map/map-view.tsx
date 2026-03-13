'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet'
import Link from 'next/link'
import { formatCurrency, getImageUrl, getFuzzyCoordinates } from '@/lib/utils'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/constants'
import type { ItemWithOwner } from '@/types'

interface MapViewProps {
  items: ItemWithOwner[]
  center?: { lat: number; lng: number }
  zoom?: number
}

function SetCenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng])
  }, [center.lat, center.lng, map])
  return null
}

export function MapView({ items, center = DEFAULT_CENTER, zoom = DEFAULT_ZOOM }: MapViewProps) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} className="h-full w-full rounded-xl" scrollWheelZoom>
      <SetCenter center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items
        .filter((item) => item.latitude && item.longitude && !isNaN(item.latitude) && !isNaN(item.longitude))
        .map((item) => {
          const fuzzy = getFuzzyCoordinates(item.latitude, item.longitude, item.id)
          return (
            <Circle
              key={item.id}
              center={[fuzzy.lat, fuzzy.lng]}
              radius={500}
              pathOptions={{
                color: '#059669',
                fillColor: '#d1fae5',
                fillOpacity: 0.35,
                weight: 2,
              }}>
              <Popup>
                <div className="w-48">
                  {item.images?.[0] && (
                    <img
                      src={getImageUrl(item.images[0])}
                      alt={item.title}
                      className="mb-2 h-24 w-full rounded object-cover"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-emerald-600">{formatCurrency(item.price_per_day)}/day</p>
                  <p className="text-xs text-gray-500">{item.city}</p>
                  <Link
                    href={`/items/${item.slug}`}
                    className="mt-2 inline-block cursor-pointer text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    View details &rarr;
                  </Link>
                </div>
              </Popup>
            </Circle>
          )
        })}
    </MapContainer>
  )
}

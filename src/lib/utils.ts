import { clsx, type ClassValue } from 'clsx'
import slugify from 'slugify'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function createSlug(title: string): string {
  const base = slugify(title, {
    lower: true,
    strict: true, // removes special characters
    trim: true,
  })

  const suffix = Math.random().toString(36).substring(2, 7)
  return `${base}-${suffix}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateTotalPrice(pricePerDay: number, startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return days * pricePerDay
}

export function getImageUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${path}`
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Returns a deterministic fuzzy offset for a coordinate pair based on the item ID.
 * Used to show approximate location on public maps without revealing the exact address.
 * The offset is up to ~400m in any direction.
 */
export function getFuzzyCoordinates(lat: number, lng: number, itemId: string): { lat: number; lng: number } {
  const seed = parseInt(itemId.replace(/-/g, '').slice(0, 8), 16)
  const maxOffset = 0.004 // ~400m
  const latOffset = ((seed % 10000) / 10000 - 0.5) * maxOffset
  const lngOffset = (((seed >> 14) % 10000) / 10000 - 0.5) * maxOffset
  return { lat: lat + latOffset, lng: lng + lngOffset }
}

/**
 * Maps a category slug to its i18n translation key for use with useTranslations('categories').
 */
export function getCategoryTranslationKey(slug: string): string {
  const map: Record<string, string> = {
    tools: 'tools',
    cameras: 'cameras',
    'outdoor-gear': 'outdoorGear',
    'event-equipment': 'eventEquipment',
    electronics: 'electronics',
    'sports-equipment': 'sportsEquipment',
    other: 'other',
  }
  return map[slug] ?? slug
}

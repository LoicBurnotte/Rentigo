export type SelectedLocation = {
  display: string
  lat?: string
  lng?: string
}

export interface LocationValue {
  latitude: number
  longitude: number
  city: string
}

export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    country?: string
  }
}

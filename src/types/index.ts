import type { Tables } from './database'

export type User = Tables<'users'>
export type Item = Tables<'items'>
export type Booking = Tables<'bookings'>
export type Favorite = Tables<'favorites'>
export type Conversation = Tables<'conversations'>
export type Message = Tables<'messages'>
export type Category = Tables<'categories'>
export type ItemUnavailability = Tables<'item_unavailabilities'>

export type ItemWithOwner = Item & {
  owner: Pick<User, 'id' | 'name' | 'avatar_url' | 'is_paused'>
  category: Category
}

export type ConversationWithDetails = Conversation & {
  renter: Pick<User, 'id' | 'name' | 'avatar_url'>
  owner: Pick<User, 'id' | 'name' | 'avatar_url'>
  item: Pick<Item, 'id' | 'title' | 'images'>
  last_message?: Message
}

export type BookingWithDetails = Booking & {
  item: ItemWithOwner
  renter: Pick<User, 'id' | 'name' | 'avatar_url'>
}

export interface SearchFilters {
  query?: string
  category?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  startDate?: string
  endDate?: string
  latitude?: number
  longitude?: number
  radius?: number
}

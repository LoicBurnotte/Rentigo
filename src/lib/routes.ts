/**
 * Central route pathnames for the app.
 * Use these with next-intl's Link and useRouter so paths stay consistent and locale is handled.
 * For dynamic segments, use the builder functions.
 */

export const routes = {
  home: '/',
  marketplace: '/marketplace',
  map: '/map',
  profile: '/profile',
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
  },
  myItems: '/my-items',
  favorites: '/favorites',
  messages: '/messages',
  itemNew: '/items/new',
  item: (slug: string) => `/items/${slug}` as const,
  itemEdit: (slug: string) => `/items/${slug}/edit` as const,
  checkout: (bookingId: string) => `/checkout/${bookingId}` as const,
  conversation: (id: string) => `/messages/${id}` as const,
} as const

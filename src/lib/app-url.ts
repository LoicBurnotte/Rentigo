import { routing } from '@/i18n/routing'

export type AppLocale = (typeof routing.locales)[number]

export function getAppUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

/** Validates locale from client/API body; falls back to default. */
export function resolveAppLocale(raw: unknown): AppLocale {
  if (typeof raw === 'string' && (routing.locales as readonly string[]).includes(raw)) {
    return raw as AppLocale
  }
  return routing.defaultLocale
}

/** Absolute URL including `[locale]` prefix (matches `src/app/[locale]/...`). */
export function localeAbsoluteUrl(locale: AppLocale, path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${getAppUrl()}/${locale}${normalized}`
}

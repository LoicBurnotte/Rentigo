'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Leaf } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-sm font-bold text-white">
                R
              </div>
              <span className="text-lg font-bold text-text">Rentigo</span>
            </Link>
            <p className="mt-3 text-sm text-text-secondary">{t('tagline')}</p>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-orange-600">
              <Leaf size={14} />
              <span>{t('circularEconomy')}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">{t('marketplace')}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/marketplace" className="text-sm text-text-secondary hover:text-text">
                  {t('browseItems')}
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-sm text-text-secondary hover:text-text">
                  {t('mapView')}
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=tools" className="text-sm text-text-secondary hover:text-text">
                  {t('tools')}
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=electronics" className="text-sm text-text-secondary hover:text-text">
                  {t('electronics')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">{t('forOwners')}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/items/new" className="text-sm text-text-secondary hover:text-text">
                  {t('listAnItem')}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-text-secondary hover:text-text">
                  {t('yourProfile')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">{t('sustainability')}</h3>
            <p className="mt-3 text-sm text-text-secondary">{t('sustainabilityText')}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}

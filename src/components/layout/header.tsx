'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from './language-switcher'
import { Search, Heart, MessageCircle, Package, Map, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('header')
  const tc = useTranslations('common')

  useEffect(() => setMounted(true), [])

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-lg font-bold text-white">
            R
          </div>
          <span className="text-xl font-bold text-text">Rentigo</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt hover:text-text">
            <Search size={16} />
            {t('browse')}
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt hover:text-text">
            <Map size={16} />
            {t('map')}
          </Link>
          {user && (
            <>
              <Link
                href="/my-items"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt hover:text-text">
                <Package size={16} />
                {t('myListings')}
              </Link>
              <Link
                href="/favorites"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt hover:text-text">
                <Heart size={16} />
                {t('favorites')}
              </Link>
              <Link
                href="/messages"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt hover:text-text">
                <MessageCircle size={16} />
                {t('messages')}
              </Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-alt"
              aria-label="Toggle theme">
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          <LanguageSwitcher />
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt">
                <User size={16} />
                {profile?.name || tc('profile')}
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  {tc('logIn')}
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">{tc('signUp')}</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-alt"
              aria-label="Toggle theme">
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          <LanguageSwitcher />
          <button className="cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt"
              onClick={() => setMobileMenuOpen(false)}>
              <Search size={16} /> {t('browse')}
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt"
              onClick={() => setMobileMenuOpen(false)}>
              <Map size={16} /> {t('map')}
            </Link>
            {user ? (
              <>
                <Link
                  href="/my-items"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt"
                  onClick={() => setMobileMenuOpen(false)}>
                  <Package size={16} /> {t('myListings')}
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt"
                  onClick={() => setMobileMenuOpen(false)}>
                  <Heart size={16} /> {t('favorites')}
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt"
                  onClick={() => setMobileMenuOpen(false)}>
                  <MessageCircle size={16} /> {t('messages')}
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt"
                  onClick={() => setMobileMenuOpen(false)}>
                  <User size={16} /> {tc('profile')}
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                  <LogOut size={16} /> {tc('signOut')}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      {tc('logIn')}
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <Button className="w-full">{tc('signUp')}</Button>
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

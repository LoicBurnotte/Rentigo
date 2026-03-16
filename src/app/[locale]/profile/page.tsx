'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProfileSchema, type ProfileInput } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { useBookings } from '@/hooks/use-bookings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageLoading } from '@/components/ui/loading'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, Package, Calendar, ChevronRight, Plus, ExternalLink } from 'lucide-react'
import { SearchLocation } from '@/components/search/search-location'
import type { SelectedLocation } from '@/types/location'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const { data: bookings } = useBookings(user?.id)
  const [editing, setEditing] = useState(false)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeDashboardLoading, setStripeDashboardLoading] = useState(false)
  const [location, setLocation] = useState<SelectedLocation | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const t = useTranslations('profile')

  // Sync location from profile when profile loads or when leaving edit mode (so chip shows current value)
  useEffect(() => {
    if (!profile) return
    if (profile.city && profile.latitude != null && profile.longitude != null) {
      setLocation({
        display: profile.city,
        lat: String(profile.latitude),
        lng: String(profile.longitude),
      })
    } else {
      setLocation(null)
    }
  }, [profile])

  const tv = useTranslations('validation')
  const ts = useTranslations('bookingStatus')
  const tc = useTranslations('common')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(createProfileSchema(tv)),
    defaultValues: {
      name: profile?.name || '',
    },
  })

  if (loading) return <PageLoading />
  if (!user) {
    router.push('/auth/login')
    return null
  }

  const onSubmit = async (data: ProfileInput) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({
        name: data.name,
        city: location?.display || null,
        latitude: location?.lat ? parseFloat(location.lat) : null,
        longitude: location?.lng ? parseFloat(location.lng) : null,
      })
      .eq('id', user.id)

    if (!error) {
      setEditing(false)
      setSuccessMsg(t('profileUpdated'))
      setTimeout(() => setSuccessMsg(null), 3000)
    }
  }

  const openStripeDashboard = async () => {
    setStripeDashboardLoading(true)
    try {
      const res = await fetch('/api/stripe/dashboard', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.open(data.url, '_blank')
    } catch {
      // handle error
    } finally {
      setStripeDashboardLoading(false)
    }
  }

  const connectStripe = async () => {
    setStripeLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // handle error
    } finally {
      setStripeLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <LanguageSwitcher />
      </div>

      {/* Profile Info */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <AvatarUpload
              userId={user.id}
              avatarUrl={avatarUrl}
              name={profile?.name || 'User'}
              onUpload={setAvatarUrl}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              {profile?.city && <p className="text-sm text-gray-500">{profile.city}</p>}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            {editing ? tc('cancel') : tc('edit')}
          </Button>
        </div>

        {editing && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input id="name" label={t('name')} error={errors.name?.message} {...register('name')} />
            <SearchLocation
              label={t('location')}
              value={location}
              onChange={setLocation}
              placeholder={t('locationPlaceholder')}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('saving') : t('saveChanges')}
            </Button>
          </form>
        )}

        {successMsg && <p className="mt-4 text-sm text-emerald-600">{successMsg}</p>}
      </div>

      {/* Stripe Connect */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CreditCard size={20} />
          {t('paymentSetup')}
        </h3>
        {profile?.stripe_account_id ? (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">{t('stripeConnected')}</p>
            </div>
            <p className="mt-1 text-sm text-gray-500">{t('stripeConnectedDesc')}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={openStripeDashboard}
              disabled={stripeDashboardLoading}>
              <ExternalLink size={14} className="mr-2" />
              {stripeDashboardLoading ? t('connecting') : t('managePayoutAccount')}
            </Button>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-gray-500">{t('stripeSetupText')}</p>
            <Button className="mt-4" onClick={connectStripe} disabled={stripeLoading}>
              {stripeLoading ? t('connecting') : t('connectStripe')}
            </Button>
          </div>
        )}
      </div>

      {/* Your Listings — link to /my-items + quick add */}
      <div className="mt-8 flex items-stretch gap-3">
        <Link href="/my-items" className="group min-w-0 flex-1">
          <div className="flex h-full items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <Package size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t('yourListings')}</p>
                <p className="text-sm text-gray-500">{t('yourListingsHint')}</p>
              </div>
            </div>
            <ChevronRight
              size={18}
              className="ml-3 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5"
            />
          </div>
        </Link>
        <Link href="/items/new" className="shrink-0">
          <Button className="h-full px-4">
            <Plus size={18} />
          </Button>
        </Link>
      </div>

      {/* Bookings */}
      <div className="mt-8">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Calendar size={20} />
          {t('yourBookings')}
        </h3>
        <div className="mt-4 space-y-3">
          {bookings?.length ? (
            bookings.map((booking) => {
              const statusKey = booking.status as 'pending' | 'confirmed' | 'cancelled' | 'completed'
              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div>
                    <Link
                      href={`/items/${booking.item?.slug}`}
                      className="font-medium text-gray-900 hover:text-emerald-600">
                      {booking.item?.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(booking.total_price)}</p>
                    <Badge>{ts(statusKey)}</Badge>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="py-8 text-center text-gray-500">{t('noBookings')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

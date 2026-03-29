'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProfileSchema, type ProfileInput } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { useBookings } from '@/hooks/use-bookings'
import { useStripeStatus, useStripeConnect, useStripeDashboard } from '@/hooks/use-stripe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageLoading } from '@/components/ui/loading'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Wallet, Package, Calendar, ChevronRight, Plus, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { SearchLocation } from '@/components/search/search-location'
import type { SelectedLocation } from '@/types/location'

export default function ProfilePage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { user, profile, loading } = useAuth()
  const { data: bookings } = useBookings(user?.id)
  const { data: stripeStatus, isPending: stripeStatusPending } = useStripeStatus(!loading && !!user)
  const stripeConnect = useStripeConnect()
  const stripeDashboard = useStripeDashboard()
  const [editing, setEditing] = useState(false)
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
    router.push(`/auth/login?returnTo=${encodeURIComponent(pathname)}`)
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

  const paymentError = stripeConnect.error || stripeDashboard.error ? t('paymentSetupError') : null

  const openStripeDashboard = () => {
    stripeDashboard.mutate(locale, {
      onSuccess: (data) => {
        if (data.url) window.open(data.url, '_blank')
      },
    })
  }

  const connectStripe = () => {
    stripeConnect.mutate(locale, {
      onSuccess: (data) => {
        if (data.url) window.location.href = data.url
      },
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">{t('title')}</h1>
      </div>

      {/* Profile Info */}
      <div className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <AvatarUpload
              userId={user.id}
              avatarUrl={avatarUrl}
              name={profile?.name || 'User'}
              onUpload={setAvatarUrl}
            />
            <div>
              <h2 className="text-xl font-bold text-text">{profile?.name}</h2>
              <p className="text-sm text-text-secondary">{profile?.email}</p>
              {profile?.city && <p className="text-sm text-text-secondary">{profile.city}</p>}
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

        {successMsg && <p className="mt-4 text-sm text-orange-600">{successMsg}</p>}
      </div>

      {/* Stripe Connect */}
      <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-text">
          <Wallet size={20} />
          {t('paymentSetup')}
        </h3>

        {paymentError && <p className="mt-2 text-sm text-red-600">{paymentError}</p>}

        {!profile?.stripe_account_id ? (
          /* State A: No Stripe account */
          <div className="mt-4">
            <p className="text-sm font-medium text-text-secondary">{t('stripeGuideTitle')}</p>
            <ol className="mt-3 space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                  1
                </span>
                {t('stripeGuideStep1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                  2
                </span>
                {t('stripeGuideStep2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                  3
                </span>
                {t('stripeGuideStep3')}
              </li>
            </ol>
            <Button className="mt-5" onClick={connectStripe} disabled={stripeConnect.isPending}>
              {stripeConnect.isPending ? t('connecting') : t('connectStripe')}
            </Button>
          </div>
        ) : stripeStatusPending ? (
          <p className="mt-4 text-sm text-text-secondary">{tc('loading')}</p>
        ) : stripeStatus && !stripeStatus.charges_enabled ? (
          /* State B: Account exists but onboarding incomplete */
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              <p className="text-sm font-medium text-amber-700">{t('stripeOnboardingIncomplete')}</p>
            </div>
            <p className="mt-1 text-sm text-text-secondary">{t('stripeOnboardingIncompleteDesc')}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={connectStripe} disabled={stripeConnect.isPending}>
                {stripeConnect.isPending ? t('connecting') : t('completeSetup')}
              </Button>
              <Button variant="outline" size="sm" onClick={openStripeDashboard} disabled={stripeDashboard.isPending}>
                <ExternalLink size={14} className="mr-2" />
                {stripeDashboard.isPending ? t('connecting') : t('managePayoutAccount')}
              </Button>
            </div>
          </div>
        ) : (
          /* State C: Fully connected */
          <div className="mt-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-orange-500" />
                <p className="text-sm font-medium text-orange-700">{t('paymentsEnabled')}</p>
              </div>
              {stripeStatus?.payouts_enabled && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-orange-500" />
                  <p className="text-sm font-medium text-orange-700">{t('payoutsEnabled')}</p>
                </div>
              )}
            </div>
            <p className="mt-3 text-sm text-text-secondary">{t('stripeDashboardHint')}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={openStripeDashboard}
              disabled={stripeDashboard.isPending}>
              <ExternalLink size={14} className="mr-2" />
              {stripeDashboard.isPending ? t('connecting') : t('managePayoutAccount')}
            </Button>
          </div>
        )}
      </div>

      {/* Your Listings — link to /my-items + quick add */}
      <div className="mt-8 flex items-stretch gap-3">
        <Link href="/my-items" className="group min-w-0 flex-1">
          <div className="flex h-full items-center justify-between rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
                <Package size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-text">{t('yourListings')}</p>
                <p className="text-sm text-text-secondary">{t('yourListingsHint')}</p>
              </div>
            </div>
            <ChevronRight
              size={18}
              className="ml-3 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
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
        <h3 className="flex items-center gap-2 text-lg font-semibold text-text">
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
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm">
                  <div>
                    <Link href={`/items/${booking.item?.slug}`} className="font-medium text-text hover:text-orange-600">
                      {booking.item?.title}
                    </Link>
                    <p className="text-sm text-text-secondary">
                      {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text">{formatCurrency(booking.total_price)}</p>
                    <Badge>{ts(statusKey)}</Badge>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="py-8 text-center text-text-secondary">{t('noBookings')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useAuth } from '@/providers/auth-provider'
import { useCreateBooking, useItemBookings, useItemUnavailabilities } from '@/hooks/use-bookings'
import { calculateTotalPrice, formatCurrency } from '@/lib/utils'
import { Calendar, CreditCard, PauseCircle } from 'lucide-react'
import type { ItemWithOwner } from '@/types'

const bookingFormSchema = z
  .object({
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: 'End date must be after start date',
    path: ['end_date'],
  })

type BookingFormValues = z.infer<typeof bookingFormSchema>

interface BookingFormProps {
  item: ItemWithOwner
}

export function BookingForm({ item }: BookingFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const createBooking = useCreateBooking()
  const { data: existingBookings } = useItemBookings(item.id)
  const { data: unavailabilities } = useItemUnavailabilities(item.id)
  const [error, setError] = useState<string | null>(null)
  const locale = useLocale()
  const t = useTranslations('booking')
  const tc = useTranslations('common')

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { start_date: '', end_date: '' },
  })

  const startDate = watch('start_date')
  const endDate = watch('end_date')

  const totalPrice = startDate && endDate ? calculateTotalPrice(item.price_per_day, startDate, endDate) : 0

  const isDateConflict = (start: string, end: string) => {
    const allBlocked = [
      ...(existingBookings ?? []),
      ...(unavailabilities ?? []),
    ]
    return allBlocked.some((range) => {
      const bStart = new Date(range.start_date)
      const bEnd = new Date(range.end_date)
      const rStart = new Date(start)
      const rEnd = new Date(end)
      return rStart < bEnd && rEnd > bStart
    })
  }

  const onSubmit = async (data: BookingFormValues) => {
    if (!user) {
      router.push(`/auth/login?returnTo=${encodeURIComponent(pathname)}`)
      return
    }

    if (user.id === item.owner_id) {
      setError(t('cannotBookOwn'))
      return
    }

    if (isDateConflict(data.start_date, data.end_date)) {
      setError(t('datesNotAvailable'))
      return
    }

    setError(null)

    try {
      const result = await createBooking.mutateAsync({
        item_id: item.id,
        start_date: data.start_date,
        end_date: data.end_date,
        total_price: totalPrice,
        locale,
      })

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        router.push(`/checkout/${result.booking.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('somethingWentWrong'))
    }
  }

  const bookedRanges = [
    ...(existingBookings ?? []).map((b) => ({ start: b.start_date, end: b.end_date })),
    ...(unavailabilities ?? []).map((u) => ({ start: u.start_date, end: u.end_date })),
  ]

  const isPaused = item.is_paused || item.owner?.is_paused

  const dayCount =
    startDate && endDate
      ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0

  if (isPaused) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col items-center py-6 text-center">
          <PauseCircle size={40} className="text-gray-300" />
          <p className="mt-3 font-medium text-text-secondary">{t('itemUnavailable')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold text-text">{formatCurrency(item.price_per_day)}</span>
          <span className="text-text-secondary"> {tc('perDay')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Calendar */}
        <div className="rounded-xl border border-border p-3">
          <DateRangePicker
            startDate={startDate || null}
            endDate={endDate || null}
            onChange={(start, end) => {
              setValue('start_date', start ?? '', { shouldValidate: true })
              setValue('end_date', end ?? '', { shouldValidate: true })
            }}
            bookedRanges={bookedRanges}
          />
        </div>

        {/* Validation errors */}
        {(errors.start_date || errors.end_date) && (
          <p className="text-sm text-red-600">{errors.start_date?.message || errors.end_date?.message}</p>
        )}

        {/* Price breakdown */}
        {totalPrice > 0 && (
          <div className="rounded-lg bg-page-alt p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {formatCurrency(item.price_per_day)} × {dayCount} {tc('days')}
              </span>
              <span className="font-medium">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-semibold text-text">{tc('total')}</span>
              <span className="text-lg font-bold text-orange-600">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={createBooking.isPending}>
          {createBooking.isPending ? (
            t('processing')
          ) : (
            <>
              <CreditCard size={18} className="mr-2" />
              {t('bookAndPay')}
            </>
          )}
        </Button>

        <p className="text-center text-xs text-text-secondary">{t('securePayment')}</p>
      </form>

      {existingBookings && existingBookings.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
            <Calendar size={14} />
            {t('unavailableDates')}
          </h4>
          <div className="space-y-1">
            {existingBookings.map((booking, i) => (
              <p key={i} className="text-xs text-text-secondary">
                {new Date(booking.start_date).toLocaleDateString()} – {new Date(booking.end_date).toLocaleDateString()}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

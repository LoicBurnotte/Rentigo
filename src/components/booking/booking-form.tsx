'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useAuth } from '@/providers/auth-provider'
import { useCreateBooking, useItemBookings } from '@/hooks/use-bookings'
import { calculateTotalPrice, formatCurrency } from '@/lib/utils'
import { Calendar, CreditCard } from 'lucide-react'
import type { Item } from '@/types'

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
  item: Item
}

export function BookingForm({ item }: BookingFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const createBooking = useCreateBooking()
  const { data: existingBookings } = useItemBookings(item.id)
  const [error, setError] = useState<string | null>(null)
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
    if (!existingBookings) return false
    return existingBookings.some((booking) => {
      const bStart = new Date(booking.start_date)
      const bEnd = new Date(booking.end_date)
      const rStart = new Date(start)
      const rEnd = new Date(end)
      return rStart < bEnd && rEnd > bStart
    })
  }

  const onSubmit = async (data: BookingFormValues) => {
    if (!user) {
      router.push('/auth/login')
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

  const bookedRanges = (existingBookings ?? []).map((b) => ({
    start: b.start_date,
    end: b.end_date,
  }))

  const dayCount =
    startDate && endDate
      ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(item.price_per_day)}</span>
          <span className="text-gray-500"> {tc('perDay')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Calendar */}
        <div className="rounded-xl border border-gray-200 p-3">
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
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {formatCurrency(item.price_per_day)} × {dayCount} {tc('days')}
              </span>
              <span className="font-medium">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
              <span className="font-semibold text-gray-900">{tc('total')}</span>
              <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalPrice)}</span>
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

        <p className="text-center text-xs text-gray-500">{t('securePayment')}</p>
      </form>

      {existingBookings && existingBookings.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Calendar size={14} />
            {t('unavailableDates')}
          </h4>
          <div className="space-y-1">
            {existingBookings.map((booking, i) => (
              <p key={i} className="text-xs text-gray-500">
                {new Date(booking.start_date).toLocaleDateString()} – {new Date(booking.end_date).toLocaleDateString()}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

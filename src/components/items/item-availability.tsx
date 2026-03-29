'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Button } from '@/components/ui/button'
import { useItemBookings, useItemUnavailabilities, useAddUnavailability, useDeleteUnavailability } from '@/hooks/use-bookings'
import { CalendarOff, Trash2 } from 'lucide-react'

interface ItemAvailabilityProps {
  itemId: string
}

export function ItemAvailability({ itemId }: ItemAvailabilityProps) {
  const { data: bookings } = useItemBookings(itemId)
  const { data: unavailabilities } = useItemUnavailabilities(itemId)
  const addUnavailability = useAddUnavailability()
  const deleteUnavailability = useDeleteUnavailability()
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const t = useTranslations('availability')

  const bookedRanges = [
    ...(bookings ?? []).map((b) => ({ start: b.start_date, end: b.end_date })),
    ...(unavailabilities ?? []).map((u) => ({ start: u.start_date, end: u.end_date })),
  ]

  const handleAdd = async () => {
    if (!startDate || !endDate) return
    await addUnavailability.mutateAsync({
      item_id: itemId,
      start_date: startDate,
      end_date: endDate,
    })
    setStartDate(null)
    setEndDate(null)
  }

  const handleDelete = (id: string) => {
    deleteUnavailability.mutate({ id, itemId })
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-text-secondary">{t('subtitle')}</p>

      {/* Calendar */}
      <div className="rounded-xl border border-border p-3">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
          bookedRanges={bookedRanges}
        />
      </div>

      {/* Add button */}
      {startDate && endDate && (
        <Button
          onClick={handleAdd}
          disabled={addUnavailability.isPending}
          className="w-full">
          <CalendarOff size={16} className="mr-2" />
          {addUnavailability.isPending ? '...' : t('addBlockedDates')}
        </Button>
      )}

      {!startDate && !endDate && (
        <p className="text-center text-xs text-text-muted">{t('selectDates')}</p>
      )}

      {/* Existing blocked dates */}
      {unavailabilities && unavailabilities.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-text-secondary">{t('blockedDates')}</h4>
          <div className="space-y-2">
            {unavailabilities.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-border-light bg-page-alt px-3 py-2">
                <span className="text-sm text-text-secondary">
                  {new Date(u.start_date).toLocaleDateString()} – {new Date(u.end_date).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={deleteUnavailability.isPending}
                  className="cursor-pointer text-red-400 transition-colors hover:text-red-600 disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {unavailabilities && unavailabilities.length === 0 && (
        <p className="text-center text-xs text-text-muted">{t('noBlockedDates')}</p>
      )}
    </div>
  )
}

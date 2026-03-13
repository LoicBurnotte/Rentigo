'use client'

import { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  parseISO,
  isAfter,
  startOfDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BookedRange {
  start: string
  end: string
}

interface DateRangePickerProps {
  startDate: string | null
  endDate: string | null
  onChange: (start: string | null, end: string | null) => void
  bookedRanges?: BookedRange[]
  minDate?: Date
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  bookedRanges = [],
  minDate = startOfDay(new Date()),
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const start = startDate ? parseISO(startDate) : null
  const end = endDate ? parseISO(endDate) : null

  // Build calendar grid (Mon–Sun, 6 rows max)
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const isBooked = (date: Date) =>
    bookedRanges.some((r) =>
      isWithinInterval(date, { start: parseISO(r.start), end: parseISO(r.end) }),
    )

  const isDisabled = (date: Date) => isBefore(date, minDate) || isBooked(date)

  // Determine the active preview end for range highlight
  const previewEnd = end ?? (start && hoverDate ? hoverDate : null)

  const getRangeState = (date: Date) => {
    if (!start) return { inRange: false, isStart: false, isEnd: false }
    const isStart = isSameDay(date, start)
    const isEnd = !!end && isSameDay(date, end)

    let inRange = false
    if (previewEnd) {
      const [s, e] = isAfter(start, previewEnd) ? [previewEnd, start] : [start, previewEnd]
      inRange = isWithinInterval(date, { start: s, end: e })
    }

    return { inRange, isStart, isEnd }
  }

  const handleDayClick = (date: Date) => {
    if (isDisabled(date)) return

    if (!start || (start && end)) {
      onChange(format(date, 'yyyy-MM-dd'), null)
    } else {
      if (isBefore(date, start)) {
        onChange(format(date, 'yyyy-MM-dd'), format(start, 'yyyy-MM-dd'))
      } else {
        onChange(format(start, 'yyyy-MM-dd'), format(date, 'yyyy-MM-dd'))
      }
    }
  }

  const canGoPrev = isAfter(startOfMonth(currentMonth), startOfMonth(new Date()))

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          disabled={!canGoPrev}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-default disabled:opacity-30">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 text-center text-xs font-medium text-gray-400">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const { inRange, isStart, isEnd } = getRangeState(day)
          const disabled = isDisabled(day)
          const otherMonth = !isSameMonth(day, currentMonth)
          const today = isToday(day)
          const isRangeEdge = isStart || isEnd
          const isOnlyStart = isStart && !end && !hoverDate

          // Range fill: half-width on edges, full on middle days
          let fillClass = ''
          if (inRange && !isOnlyStart) {
            if (isStart) fillClass = 'left-1/2 right-0'
            else if (isEnd) fillClass = 'left-0 right-1/2'
            else fillClass = 'left-0 right-0'
          }

          return (
            <div key={day.toISOString()} className="relative flex h-10 items-center justify-center">
              {/* Range background */}
              {fillClass && (
                <div className={`absolute inset-y-0.5 bg-emerald-100 ${fillClass}`} />
              )}

              {/* Day button */}
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => {
                  if (start && !end) setHoverDate(day)
                }}
                onMouseLeave={() => setHoverDate(null)}
                disabled={disabled}
                className={[
                  'relative z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm transition-colors',
                  disabled
                    ? 'cursor-not-allowed text-gray-300'
                    : isRangeEdge
                      ? 'bg-emerald-600 font-semibold text-white hover:bg-emerald-700'
                      : today
                        ? 'font-bold text-emerald-600 hover:bg-emerald-100'
                        : otherMonth
                          ? 'text-gray-300 hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-emerald-100',
                ]
                  .filter(Boolean)
                  .join(' ')}>
                {format(day, 'd')}
              </button>
            </div>
          )
        })}
      </div>

      {/* Selection hint */}
      <p className="mt-2 text-center text-xs text-gray-400">
        {!start
          ? 'Select a start date'
          : !end
            ? 'Now select an end date'
            : `${format(start, 'MMM d')} → ${format(end, 'MMM d, yyyy')}`}
      </p>
    </div>
  )
}

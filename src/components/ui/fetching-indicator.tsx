'use client'

import { useEffect, useState, useRef } from 'react'
import { useIsFetching } from '@tanstack/react-query'

type Phase = 'idle' | 'loading' | 'completing'

export function GlobalFetchingIndicator() {
  const isFetching = useIsFetching()
  const [phase, setPhase] = useState<Phase>('idle')
  const safetyRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (isFetching > 0) {
      setPhase('loading')
      // Safety: force complete after 15s to prevent stuck bar
      clearTimeout(safetyRef.current)
      safetyRef.current = setTimeout(() => setPhase('completing'), 15000)
    } else {
      clearTimeout(safetyRef.current)
      setPhase((prev) => (prev === 'loading' ? 'completing' : prev))
    }
    return () => clearTimeout(safetyRef.current)
  }, [isFetching])

  useEffect(() => {
    if (phase !== 'completing') return
    const t = setTimeout(() => setPhase('idle'), 650)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === 'idle') return null

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-16 z-40 h-0.5"
      style={
        phase === 'completing'
          ? { opacity: 0, transition: 'opacity 0.4s ease 0.25s' }
          : { opacity: 1 }
      }>
      <div
        className="h-full bg-orange-500"
        style={
          phase === 'loading'
            ? { width: '75%', transition: 'width 8s cubic-bezier(0.1, 0.5, 0.5, 1)' }
            : { width: '100%', transition: 'width 0.25s ease' }
        }
      />
    </div>
  )
}

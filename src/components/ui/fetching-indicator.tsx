'use client'

import { useEffect, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'

type Phase = 'idle' | 'loading' | 'completing'

export function GlobalFetchingIndicator() {
  const isFetching = useIsFetching()
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    if (isFetching > 0) {
      setPhase('loading')
    } else if (phase === 'loading') {
      setPhase('completing')
      const t = setTimeout(() => setPhase('idle'), 650)
      return () => clearTimeout(t)
    }
  }, [isFetching]) // eslint-disable-line react-hooks/exhaustive-deps

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
        className="h-full bg-emerald-500"
        style={
          phase === 'loading'
            ? { width: '75%', transition: 'width 8s cubic-bezier(0.1, 0.5, 0.5, 1)' }
            : { width: '100%', transition: 'width 0.25s ease' }
        }
      />
    </div>
  )
}

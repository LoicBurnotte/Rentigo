'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageLightboxProps {
  images: string[]
  currentIndex: number
  getUrl: (image: string) => string
  onClose: () => void
  onNavigate: (index: number) => void
  title?: string
}

export function ImageLightbox({ images, currentIndex, getUrl, onClose, onNavigate, title }: ImageLightboxProps) {
  const prev = () => onNavigate(currentIndex > 0 ? currentIndex - 1 : images.length - 1)
  const next = () => onNavigate(currentIndex < images.length - 1 ? currentIndex + 1 : 0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/96"
        onClick={onClose}>
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            {title && <span className="text-sm font-medium text-white/80">{title}</span>}
            <span className="rounded-full bg-surface/10 px-2.5 py-0.5 text-xs text-white/60">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/60 transition-colors hover:bg-surface/10 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Main image area */}
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-16"
          onClick={(e) => e.stopPropagation()}>
          {images.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-white transition-colors hover:bg-surface/20">
              <ChevronLeft size={22} />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="relative h-full w-full">
              <Image
                src={getUrl(images[currentIndex])}
                alt={title ? `${title} — ${currentIndex + 1}` : `Image ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <button
              onClick={next}
              className="absolute right-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-white transition-colors hover:bg-surface/20">
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div
            className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 py-4"
            onClick={(e) => e.stopPropagation()}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onNavigate(i)}
                className={[
                  'relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all',
                  i === currentIndex
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-black/50 opacity-100'
                    : 'opacity-40 hover:opacity-70',
                ].join(' ')}>
                <Image src={getUrl(img)} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

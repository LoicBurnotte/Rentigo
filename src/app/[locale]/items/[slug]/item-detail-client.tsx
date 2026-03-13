'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Heart, MessageCircle, ChevronLeft, ChevronRight, User, Share2, Pencil, Expand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookingForm } from '@/components/booking/booking-form'
import { ImageLightbox } from '@/components/items/image-lightbox'
import { useAuth } from '@/providers/auth-provider'
import { useFavoriteIds, useToggleFavorite } from '@/hooks/use-favorites'
import { useCreateConversation } from '@/hooks/use-messages'
import { formatCurrency, getImageUrl, getCategoryTranslationKey } from '@/lib/utils'
import type { ItemWithOwner } from '@/types'

interface ItemDetailClientProps {
  item: ItemWithOwner
}

export function ItemDetailClient({ item }: ItemDetailClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { data: favoriteIds } = useFavoriteIds(user?.id)
  const toggleFavorite = useToggleFavorite()
  const createConversation = useCreateConversation()
  const [currentImage, setCurrentImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const t = useTranslations('itemDetail')
  const tc = useTranslations('common')
  const tCat = useTranslations('categories')

  const isFavorited = favoriteIds?.has(item.id) ?? false

  const handleToggleFavorite = () => {
    if (!user) return router.push('/auth/login')
    toggleFavorite.mutate({
      itemId: item.id,
      userId: user.id,
      isFavorited,
    })
  }

  const handleContact = async () => {
    if (!user) return router.push('/auth/login')
    const conversation = await createConversation.mutateAsync({
      renterId: user.id,
      ownerId: item.owner.id,
      itemId: item.id,
    })
    router.push(`/messages/${conversation.id}`)
  }

  const images = item.images?.length ? item.images : []
  const hasPrev = currentImage > 0
  const hasNext = currentImage < images.length - 1

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: Images + Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image Gallery */}
          {images.length > 0 ? (
            <div className="relative overflow-hidden rounded-xl bg-gray-100">
              {/* Main image — clickable to open lightbox */}
              <div className="group relative aspect-16/10 cursor-pointer" onClick={() => setLightboxOpen(true)}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0">
                    <Image
                      src={getImageUrl(images[currentImage])}
                      alt={`${item.title} - Image ${currentImage + 1}`}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Expand hint on hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <Expand size={13} />
                    View all photos
                  </div>
                </div>
              </div>

              {/* Prev / Next — no wrapping (hide at boundaries) */}
              {images.length > 1 && (
                <>
                  {hasPrev && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImage((p) => p - 1)
                      }}
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm hover:bg-white">
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  {hasNext && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImage((p) => p + 1)
                      }}
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm hover:bg-white">
                      <ChevronRight size={20} />
                    </button>
                  )}

                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentImage(i)
                        }}
                        className={`h-2 w-2 cursor-pointer rounded-full transition-colors ${
                          i === currentImage ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex aspect-16/10 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              {t('noImages')}
            </div>
          )}

          {/* Lightbox */}
          {lightboxOpen && (
            <ImageLightbox
              images={images}
              currentIndex={currentImage}
              getUrl={getImageUrl}
              title={item.title}
              onClose={() => setLightboxOpen(false)}
              onNavigate={setCurrentImage}
            />
          )}

          {/* Item Info */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                  {item.category?.slug
                    ? tCat(getCategoryTranslationKey(item.category.slug) as Parameters<typeof tCat>[0])
                    : item.category?.name}
                </span>
                <h1 className="mt-3 text-3xl font-bold text-gray-900">{item.title}</h1>
                <div className="mt-2 flex items-center gap-1.5 text-gray-500">
                  <MapPin size={16} />
                  <span>{item.city}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {user && user.id === item.owner?.id && (
                  <Link href={`/items/${item.slug}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil size={16} className="mr-1.5" />
                      {t('editListing')}
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleToggleFavorite}>
                  <Heart size={16} className={isFavorited ? 'mr-1.5 fill-red-500 text-red-500' : 'mr-1.5'} />
                  {isFavorited ? t('saved') : tc('save')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigator.share?.({
                      title: item.title,
                      url: window.location.href,
                    })
                  }>
                  <Share2 size={16} />
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">{t('description')}</h2>
              <p className="mt-2 whitespace-pre-wrap text-gray-600">{item.description}</p>
            </div>
          </div>

          {/* Owner */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{t('listedBy')}</h2>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  {item.owner?.avatar_url ? (
                    <Image
                      src={item.owner.avatar_url}
                      alt={item.owner.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.owner?.name}</p>
                </div>
              </div>
              {user && user.id !== item.owner?.id && (
                <Button variant="outline" onClick={handleContact}>
                  <MessageCircle size={16} className="mr-1.5" />
                  {t('contact')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Booking form */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingForm item={item} />
        </div>
      </div>
    </div>
  )
}

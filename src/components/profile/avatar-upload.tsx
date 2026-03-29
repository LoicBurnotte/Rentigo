'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function getDefaultAvatarUrl(name: string) {
  const seed = encodeURIComponent(name || 'User')
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=059669&fontColor=ffffff`
}

interface AvatarUploadProps {
  userId: string
  avatarUrl: string | null
  name: string
  onUpload: (url: string) => void
}

export function AvatarUpload({ userId, avatarUrl, name, onUpload }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('profile')

  const displayUrl = avatarUrl || getDefaultAvatarUrl(name)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError(t('avatarTooLarge'))
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path)

      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', userId)
      onUpload(publicUrl)
    } catch {
      setError(t('avatarUploadFailed'))
    } finally {
      setUploading(false)
      // reset so same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-page-alt">
          <img
            src={displayUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = getDefaultAvatarUrl(name)
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-600 text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
          title={t('changeAvatar')}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-text-muted">{t('avatarHint')}</p>
    </div>
  )
}

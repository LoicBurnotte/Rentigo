'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLoginSchema, type LoginInput } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center px-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
        </div>
      }>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const rawReturnTo = searchParams.get('returnTo')
  const returnTo = rawReturnTo && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//') ? rawReturnTo : '/'

  useEffect(() => {
    if (!loading && user) {
      router.replace(returnTo)
    }
  }, [user, loading, router, returnTo])

  const t = useTranslations('auth')
  const tv = useTranslations('validation')
  const tc = useTranslations('common')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(createLoginSchema(tv)),
  })

  const onSubmit = async (data: LoginInput) => {
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setError(error.message)
      return
    }

    router.push(returnTo)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-xl font-bold text-white">
            R
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text">{t('welcomeBack')}</h1>
          <p className="mt-2 text-sm text-text-secondary">{t('signInToAccount')}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <Input
            id="email"
            label={t('email')}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="password"
            label={t('password')}
            type="password"
            placeholder={t('password')}
            error={errors.password?.message}
            {...register('password')}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            <LogIn size={18} className="mr-2" />
            {isSubmitting ? t('signingIn') : tc('signIn')}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          {t('noAccount')}{' '}
          <Link href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-700">
            {tc('signUp')}
          </Link>
        </p>
      </div>
    </div>
  )
}

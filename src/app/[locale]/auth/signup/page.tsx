'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSignUpSchema, type SignUpInput } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      router.replace('/')
    }
  }, [user, loading, router])

  const [success, setSuccess] = useState(false)
  const t = useTranslations('auth')
  const tv = useTranslations('validation')
  const tc = useTranslations('common')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(createSignUpSchema(tv)),
  })

  const onSubmit = async (data: SignUpInput) => {
    setError(null)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    setSuccess(true)
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

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-xl font-bold text-white">
            R
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text">{t('checkEmail')}</h1>
          <p className="mt-2 text-text-secondary">{t('confirmationSent')}</p>
          <Link href="/auth/login">
            <Button variant="outline" className="mt-6">
              {t('backToLogin')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-xl font-bold text-white">
            R
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text">{t('createAccount')}</h1>
          <p className="mt-2 text-sm text-text-secondary">{t('joinRentigo')}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <Input
            id="name"
            label={t('fullName')}
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
          />

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
            placeholder={t('minChars')}
            error={errors.password?.message}
            {...register('password')}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            <UserPlus size={18} className="mr-2" />
            {isSubmitting ? t('creatingAccount') : t('createAccount')}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-700">
            {tc('signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}

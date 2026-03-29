import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { localeAbsoluteUrl, resolveAppLocale } from '@/lib/app-url'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    let locale = resolveAppLocale(undefined)
    try {
      const body = (await request.json()) as { locale?: string }
      locale = resolveAppLocale(body?.locale)
    } catch {
      // optional body
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_account_id) {
      return NextResponse.json({ error: 'No connected payment method' }, { status: 400 })
    }

    try {
      const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id)
      return NextResponse.json({ url: loginLink.url })
    } catch {
      const profilePath = localeAbsoluteUrl(locale, '/profile')
      const accountLink = await stripe.accountLinks.create({
        account: profile.stripe_account_id,
        refresh_url: `${profilePath}?stripe=refresh`,
        return_url: `${profilePath}?stripe=success`,
        type: 'account_onboarding',
      })
      return NextResponse.json({ url: accountLink.url })
    }
  } catch (error) {
    console.error('Stripe dashboard error:', error)
    return NextResponse.json({ error: 'Failed to open payment settings' }, { status: 500 })
  }
}

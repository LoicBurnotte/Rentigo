import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { localeAbsoluteUrl, resolveAppLocale } from '@/lib/app-url'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    let locale = resolveAppLocale(undefined)
    try {
      const body = (await request.json()) as { locale?: string }
      locale = resolveAppLocale(body?.locale)
    } catch {
      // No JSON body — use default locale
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase.from('users').select('stripe_account_id').eq('id', user.id).single()

    let accountId = profile?.stripe_account_id

    if (accountId) {
      try {
        await stripe.accounts.retrieve(accountId)
      } catch {
        accountId = null
        await supabase.from('users').update({ stripe_account_id: null }).eq('id', user.id)
      }
    }

    if (!accountId) {
      try {
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          metadata: { supabase_user_id: user.id },
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        })
        accountId = account.id
        await supabase.from('users').update({ stripe_account_id: accountId }).eq('id', user.id)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        const isConnectDisabled =
          message.includes('signed up for Connect') ||
          (err instanceof Stripe.errors.StripeInvalidRequestError && message.includes('Connect'))
        if (isConnectDisabled) {
          console.error('Stripe Connect is not enabled. Visit https://dashboard.stripe.com/connect to activate it.')
          return NextResponse.json(
            { error: 'Payment service is not configured yet. Please contact support.' },
            { status: 503 },
          )
        }
        throw err
      }
    }

    const profilePath = localeAbsoluteUrl(locale, '/profile')

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${profilePath}?stripe=refresh`,
      return_url: `${profilePath}?stripe=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe connect error:', error)
    return NextResponse.json({ error: 'Failed to set up payment method' }, { status: 500 })
  }
}

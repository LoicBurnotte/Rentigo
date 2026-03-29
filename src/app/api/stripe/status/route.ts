import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
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
      return NextResponse.json({ connected: false })
    }

    try {
      const account = await stripe.accounts.retrieve(profile.stripe_account_id)
      return NextResponse.json({
        connected: true,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      })
    } catch {
      // Account no longer exists in Stripe — clear it
      await supabase.from('users').update({ stripe_account_id: null }).eq('id', user.id)
      return NextResponse.json({ connected: false })
    }
  } catch (error) {
    console.error('Payment status error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment status' }, { status: 500 })
  }
}

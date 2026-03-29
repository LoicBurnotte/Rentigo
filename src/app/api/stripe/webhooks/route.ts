import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceRoleClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.booking_id

      if (bookingId) {
        const { data: row } = await supabase.from('bookings').select('status').eq('id', bookingId).maybeSingle()
        if (row?.status === 'pending') {
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              stripe_payment_intent: session.payment_intent as string,
            })
            .eq('id', bookingId)
        }
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.booking_id

      if (bookingId) {
        const { data: row } = await supabase.from('bookings').select('status').eq('id', bookingId).maybeSingle()
        if (row?.status === 'pending') {
          await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
        }
      }
      break
    }

    case 'account.application.deauthorized': {
      const accountId = event.account
      if (accountId) {
        await supabase.from('users').update({ stripe_account_id: null }).eq('stripe_account_id', accountId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

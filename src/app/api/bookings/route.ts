import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'
import { localeAbsoluteUrl, resolveAppLocale } from '@/lib/app-url'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { item_id, start_date, end_date, total_price, locale: localeRaw } = body
    const locale = resolveAppLocale(localeRaw)

    // Get item and owner info
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*, owner:users!owner_id(*)')
      .eq('id', item_id)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    if (item.owner_id === user.id) {
      return NextResponse.json({ message: 'You cannot book your own item' }, { status: 400 })
    }

    // Check if item or owner is paused
    const owner = item.owner as { stripe_account_id: string | null; name: string; is_paused: boolean } | null
    if (item.is_paused || owner?.is_paused) {
      return NextResponse.json({ message: 'This item is currently unavailable' }, { status: 400 })
    }

    // Check availability
    const { data: conflicting } = await supabase
      .from('bookings')
      .select('id')
      .eq('item_id', item_id)
      .in('status', ['pending', 'confirmed'])
      .lt('start_date', end_date)
      .gt('end_date', start_date)

    if (conflicting && conflicting.length > 0) {
      return NextResponse.json({ message: 'These dates are not available' }, { status: 409 })
    }

    // Check owner-blocked date ranges
    const { data: unavailConflicts } = await supabase
      .from('item_unavailabilities')
      .select('id')
      .eq('item_id', item_id)
      .lt('start_date', end_date)
      .gt('end_date', start_date)

    if (unavailConflicts && unavailConflicts.length > 0) {
      return NextResponse.json({ message: 'These dates are blocked by the owner' }, { status: 409 })
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        item_id,
        renter_id: user.id,
        start_date,
        end_date,
        total_price,
        status: 'pending',
      })
      .select()
      .single()

    if (bookingError) {
      return NextResponse.json({ message: 'Failed to create booking' }, { status: 500 })
    }

    // Create Stripe Checkout session
    const ownerStripeAccountId = owner?.stripe_account_id

    if (!ownerStripeAccountId) {
      // If owner hasn't connected Stripe, still create the booking but skip payment
      return NextResponse.json({
        booking,
        message: 'Booking created. Owner has not set up payments yet.',
      })
    }

    const platformFee = Math.round(total_price * 100 * (PLATFORM_FEE_PERCENT / 100))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.title,
              description: `Rental from ${start_date} to ${end_date}`,
            },
            unit_amount: Math.round(total_price * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: ownerStripeAccountId,
        },
      },
      mode: 'payment',
      success_url: `${localeAbsoluteUrl(locale, `/checkout/${booking.id}`)}?success=true`,
      cancel_url: `${localeAbsoluteUrl(locale, `/items/${item.slug}`)}?cancelled=true`,
      metadata: {
        booking_id: booking.id,
      },
    })

    // Store the payment intent
    await supabase
      .from('bookings')
      .update({ stripe_payment_intent: session.payment_intent as string })
      .eq('id', booking.id)

    return NextResponse.json({
      booking,
      checkoutUrl: session.url,
    })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

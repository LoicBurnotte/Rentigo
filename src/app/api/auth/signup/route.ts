import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This webhook is triggered by Supabase after a user confirms their email.
// It creates the user's profile in the users table.
export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { type, record } = payload

    if (type === 'INSERT' && record) {
      const supabase = await createServiceRoleClient()
      const name = record.raw_user_meta_data?.name || 'User'
      const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=059669&fontColor=ffffff`
      const { error } = await supabase.from('users').insert({
        id: record.id,
        email: record.email,
        name,
        avatar_url: avatarUrl,
      })

      if (error) {
        console.error('Error creating user profile:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

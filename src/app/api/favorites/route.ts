import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List user's favorites
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: favorites, error } = await supabase
      .from('favorite_providers')
      .select(`
        id,
        created_at,
        provider:provider_profiles (
          id,
          business_name,
          avatar_url,
          rating,
          total_reviews,
          bio,
          profiles!provider_profiles_id_fkey (first_name, last_name, avatar_url)
        )
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Favorites fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { providerId } = await request.json()

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 })
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorite_providers')
      .select('id')
      .eq('customer_id', user.id)
      .eq('provider_id', providerId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('favorite_providers')
      .insert({
        customer_id: user.id,
        provider_id: providerId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ favorite: data }, { status: 201 })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { providerId } = await request.json()

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('favorite_providers')
      .delete()
      .eq('customer_id', user.id)
      .eq('provider_id', providerId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
  }
}


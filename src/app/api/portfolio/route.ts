import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get provider portfolio
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const providerId = searchParams.get('providerId')

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Use provided ID or current user's profile
    let profileId = providerId

    if (!profileId && user) {
      const { data: profile } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      profileId = profile?.id
    }

    if (!profileId) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const { data: portfolio, error } = await supabase
      .from('portfolio_items')
      .select(`
        id,
        image_url,
        title,
        description,
        service_category,
        created_at
      `)
      .eq('provider_id', profileId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ portfolio })
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}

// POST - Add portfolio item
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 })
    }

    const { imageUrl, title, description, serviceCategory } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    const { data: item, error } = await supabase
      .from('portfolio_items')
      .insert({
        provider_id: profile.id,
        image_url: imageUrl,
        title,
        description,
        service_category: serviceCategory,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Add portfolio item error:', error)
    return NextResponse.json({ error: 'Failed to add portfolio item' }, { status: 500 })
  }
}

// DELETE - Remove portfolio item
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: profile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', itemId)
      .eq('provider_id', profile?.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete portfolio item error:', error)
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 })
  }
}


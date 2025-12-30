import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Get search parameters
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const minRating = searchParams.get('minRating')
  const maxDistance = searchParams.get('maxDistance')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const sortBy = searchParams.get('sortBy') || 'rating' // rating, price, distance
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  try {
    const supabase = await createClient()

    // Build provider query
    let providerQuery = supabase
      .from('provider_profiles')
      .select(`
        *,
        profiles!provider_profiles_id_fkey (first_name, last_name, avatar_url),
        provider_services (
          id,
          base_price,
          duration_minutes,
          services (name, category, description)
        )
      `, { count: 'exact' })
      .eq('is_verified', true)

    // Text search on business name or bio
    if (query) {
      providerQuery = providerQuery.or(`business_name.ilike.%${query}%,bio.ilike.%${query}%`)
    }

    // Filter by category (through services)
    // Note: Complex filter through nested relation needs different approach

    // Filter by minimum rating
    if (minRating) {
      providerQuery = providerQuery.gte('rating', parseFloat(minRating))
    }

    // Filter by service radius (max distance they serve)
    if (maxDistance) {
      providerQuery = providerQuery.lte('service_radius_miles', parseFloat(maxDistance))
    }

    // Sorting
    if (sortBy === 'rating') {
      providerQuery = providerQuery.order('rating', { ascending: false, nullsFirst: false })
    } else if (sortBy === 'reviews') {
      providerQuery = providerQuery.order('total_reviews', { ascending: false })
    }

    // Pagination
    providerQuery = providerQuery.range(offset, offset + limit - 1)

    const { data: providers, error, count } = await providerQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by price range (post-query filtering for nested data)
    let filteredProviders = providers || []
    
    if (minPrice || maxPrice || category) {
      filteredProviders = filteredProviders.filter(provider => {
        const services = provider.provider_services || []
        
        // Check if any service matches the filters
        return services.some((service: { base_price: number; services?: { category?: string } }) => {
          const matchesMinPrice = !minPrice || service.base_price >= parseFloat(minPrice)
          const matchesMaxPrice = !maxPrice || service.base_price <= parseFloat(maxPrice)
          const matchesCategory = !category || service.services?.category === category
          return matchesMinPrice && matchesMaxPrice && matchesCategory
        })
      })
    }

    // Calculate distance if location provided (simplified Haversine)
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      
      filteredProviders = filteredProviders.map(provider => ({
        ...provider,
        distance: provider.business_lat && provider.business_lng
          ? calculateDistance(userLat, userLng, provider.business_lat, provider.business_lng)
          : null
      }))
      
      // Sort by distance if requested
      if (sortBy === 'distance') {
        filteredProviders.sort((a, b) => (a.distance || 999) - (b.distance || 999))
      }
    }

    return NextResponse.json({
      providers: filteredProviders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal
}


// Image utility functions and constants for Eve Beauty

// UI Avatars - generates initials-based placeholder avatars
export function getAvatarUrl(name: string | undefined, size: number = 128): string {
  const initials = name ? encodeURIComponent(name.slice(0, 2).toUpperCase()) : '?'
  return `https://ui-avatars.com/api/?name=${initials}&size=${size}&background=FCE5DF&color=D97A5F&bold=true&format=svg`
}

// Picsum Photos - beautiful placeholder images
export function getPlaceholderImage(
  seed: string | number,
  width: number = 400,
  height: number = 300
): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

// Service category images - using Unsplash for high quality
export const CATEGORY_IMAGES: Record<string, string> = {
  nails: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
  hair: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
  makeup: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop',
  skincare: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop',
  massage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
  waxing: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop',
}

// Hero images for landing page
export const HERO_IMAGES = {
  main: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop',
  secondary: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
  accent: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop',
}

// Portfolio placeholder images (beauty related)
export const PORTFOLIO_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop', // nails
  'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop', // beauty
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', // makeup
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop', // glamour
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop', // salon
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop', // skincare
]

// Before/After placeholder pairs
export const BEFORE_AFTER_PLACEHOLDERS = [
  {
    before: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=400&fit=crop',
  },
  {
    before: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=300&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=300&h=400&fit=crop',
  },
]

// Service icons (emoji fallbacks with image alternatives)
export const SERVICE_ICONS: Record<string, { emoji: string; image: string }> = {
  nails: { emoji: '💅', image: CATEGORY_IMAGES.nails },
  hair: { emoji: '💇', image: CATEGORY_IMAGES.hair },
  makeup: { emoji: '💄', image: CATEGORY_IMAGES.makeup },
  skincare: { emoji: '✨', image: CATEGORY_IMAGES.skincare },
  massage: { emoji: '💆', image: CATEGORY_IMAGES.massage },
  waxing: { emoji: '🌸', image: CATEGORY_IMAGES.waxing },
}

// Default placeholder for missing images
export const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop'

// Empty state illustrations (using placeholder patterns)
export const EMPTY_STATE_IMAGES = {
  noBookings: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
  noFavorites: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=200&fit=crop',
  noMessages: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=300&h=200&fit=crop',
  noReviews: 'https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?w=300&h=200&fit=crop',
  noResults: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop',
}

// Provider profile banner gradients (CSS fallbacks)
export const PROFILE_GRADIENTS = [
  'linear-gradient(135deg, #F4B5A4 0%, #E89580 100%)',
  'linear-gradient(135deg, #FCE5DF 0%, #F8CFC3 100%)',
  'linear-gradient(135deg, #FEF5F2 0%, #FCE5DF 100%)',
  'linear-gradient(135deg, #CCFBF1 0%, #D1FAE5 100%)',
]

// Get gradient by index (for consistent assignment)
export function getProfileGradient(index: number): string {
  return PROFILE_GRADIENTS[index % PROFILE_GRADIENTS.length]
}

// Generate seeded placeholder for provider portfolio
export function getPortfolioImage(providerId: string, index: number): string {
  const seed = `${providerId}-${index}`
  return `https://picsum.photos/seed/${seed}/400/400`
}

// Get random portfolio placeholder
export function getRandomPortfolioImage(): string {
  const index = Math.floor(Math.random() * PORTFOLIO_PLACEHOLDERS.length)
  return PORTFOLIO_PLACEHOLDERS[index]
}


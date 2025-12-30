import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evebeauty.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    '/browse',
    '/search',
    '/login',
    '/signup',
    '/forgot-password',
  ]

  const staticRoutes = staticPages.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Customer pages (require auth but still indexable for SEO)
  const customerPages = [
    '/customer/dashboard',
    '/customer/bookings',
    '/customer/favorites',
    '/customer/profile',
    '/customer/discover',
    '/customer/loyalty',
    '/customer/help',
  ]

  const customerRoutes = customerPages.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  // Provider pages
  const providerPages = [
    '/provider/dashboard',
    '/provider/bookings',
    '/provider/services',
    '/provider/portfolio',
    '/provider/analytics',
    '/provider/onboarding',
  ]

  const providerRoutes = providerPages.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...customerRoutes, ...providerRoutes]
}


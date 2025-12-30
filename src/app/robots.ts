import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evebeauty.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/customer/settings/',
          '/provider/settings/',
          '/customer/payment-methods',
          '/customer/payment-history',
          '/provider/earnings',
          '/provider/kyc',
          '/reset-password',
          '/verify',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}


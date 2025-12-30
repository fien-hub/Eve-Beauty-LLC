import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Providers',
  description: 'Search for beauty and wellness providers by service, location, price, and rating. Find the perfect provider for your needs.',
  openGraph: {
    title: 'Search Beauty Providers | Eve Beauty',
    description: 'Search for beauty and wellness providers by service, location, price, and rating.',
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


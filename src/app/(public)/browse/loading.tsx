'use client'

import { SkeletonProviderCard, Skeleton } from '@/components/ui/skeleton'

export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-8 w-28 bg-[#F0F0F0] rounded-lg animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-6 w-16 bg-[#F0F0F0] rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-[#F0F0F0] rounded-xl animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-96 mx-auto mb-4 rounded-lg" />
          <Skeleton className="h-6 w-80 mx-auto rounded-lg" />
        </div>

        {/* Search Skeleton */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-12 rounded-xl" />
            <Skeleton className="h-12 w-28 rounded-xl" />
          </div>
        </div>

        {/* Categories Skeleton */}
        <section className="mb-12">
          <Skeleton className="h-8 w-56 mb-6 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </section>

        {/* Featured Providers Skeleton */}
        <section>
          <Skeleton className="h-8 w-48 mb-6 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonProviderCard key={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}


'use client'

import { Skeleton, SkeletonBookingCard } from '@/components/ui/skeleton'

export default function ProviderBookingsLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6 rounded-lg" />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        {/* Booking Cards */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBookingCard key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}


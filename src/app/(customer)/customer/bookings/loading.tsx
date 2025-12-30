'use client'

import { SkeletonBookingCard } from '@/components/ui/skeleton'

export default function BookingsLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-8 w-28 bg-[#F0F0F0] rounded-lg animate-pulse" />
          <div className="h-6 w-24 bg-[#F0F0F0] rounded-lg animate-pulse" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title Skeleton */}
        <div className="h-8 w-48 bg-[#F0F0F0] rounded-lg animate-pulse mb-6" />

        {/* Tabs Skeleton */}
        <div className="flex gap-4 mb-6">
          <div className="h-10 w-32 bg-[#F0F0F0] rounded-xl animate-pulse" />
          <div className="h-10 w-32 bg-[#F0F0F0] rounded-xl animate-pulse" />
        </div>

        {/* Booking Cards Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBookingCard key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}


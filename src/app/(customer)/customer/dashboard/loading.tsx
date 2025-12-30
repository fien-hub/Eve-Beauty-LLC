'use client'

import { Skeleton, SkeletonBookingCard, SkeletonAvatar } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-8 w-28 bg-[#F0F0F0] rounded-lg animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-6 w-16 bg-[#F0F0F0] rounded-lg animate-pulse" />
            <SkeletonAvatar size="md" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section Skeleton */}
        <div className="bg-gradient-to-r from-[#FEF5F2] to-[#FCE5DF] rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <SkeletonAvatar size="xl" />
            <div>
              <Skeleton className="h-8 w-48 mb-2 rounded-lg" />
              <Skeleton className="h-5 w-64 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Bookings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <Skeleton className="h-7 w-48 mb-4 rounded-lg" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBookingCard key={i} />
              ))}
            </div>
          </div>

          {/* Favorite Providers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <Skeleton className="h-7 w-48 mb-4 rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#F7F7F7] rounded-xl">
                  <SkeletonAvatar size="lg" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-2 rounded-lg" />
                    <Skeleton className="h-4 w-16 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


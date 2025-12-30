'use client'

import { Skeleton, SkeletonBookingCard, SkeletonAvatar } from '@/components/ui/skeleton'

export default function ProviderDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-8 w-28 bg-[#F0F0F0] rounded-lg animate-pulse" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20 rounded-lg" />
            <SkeletonAvatar size="md" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Provider Welcome Section */}
        <div className="bg-gradient-to-r from-[#FEF5F2] to-[#FCE5DF] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SkeletonAvatar size="xl" />
              <div>
                <Skeleton className="h-8 w-56 mb-2 rounded-lg" />
                <Skeleton className="h-5 w-40 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
              <Skeleton className="h-6 w-24 mb-2 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Bookings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBookingCard key={i} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <Skeleton className="h-6 w-40 mb-4 rounded-lg" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1 rounded-lg" />
                      <Skeleton className="h-3 w-32 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <Skeleton className="h-6 w-32 mb-4 rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


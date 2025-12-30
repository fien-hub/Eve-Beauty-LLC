'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Period Tabs */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
              <Skeleton className="h-4 w-20 mb-2 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <Skeleton className="h-6 w-40 mb-4 rounded-lg" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <Skeleton className="h-6 w-40 mb-4 rounded-lg" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-8">
          <Skeleton className="h-6 w-32 mb-4 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#F7F7F7] rounded-xl">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-32 rounded-lg" />
                </div>
                <Skeleton className="h-5 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}


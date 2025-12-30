'use client'

import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'

export default function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Title and filters */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}


'use client'

import { Skeleton, SkeletonServiceCard } from '@/components/ui/skeleton'

export default function ServicesLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonServiceCard key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}


'use client'

import { Skeleton, SkeletonAvatar, SkeletonServiceCard, SkeletonText } from '@/components/ui/skeleton'

export default function ProviderProfileLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Provider Header */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
          {/* Cover Image */}
          <Skeleton className="h-48 w-full" />
          
          {/* Profile Info */}
          <div className="p-6 -mt-12">
            <div className="flex items-end gap-4">
              <div className="bg-white rounded-full p-1">
                <SkeletonAvatar size="xl" />
              </div>
              <div className="flex-1 pb-2">
                <Skeleton className="h-7 w-48 mb-2 rounded-lg" />
                <Skeleton className="h-5 w-32 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
            
            <div className="mt-4">
              <SkeletonText lines={2} />
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-6 pt-6 border-t border-[#E5E5E5]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-7 w-12 mx-auto mb-1 rounded-lg" />
                  <Skeleton className="h-4 w-16 mx-auto rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonServiceCard key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}


'use client'

import { Skeleton, SkeletonAvatar } from '@/components/ui/skeleton'

export default function MessagesLoading() {
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
        <Skeleton className="h-8 w-36 mb-6 rounded-lg" />

        {/* Conversation List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-[#E5E5E5] last:border-b-0">
              <SkeletonAvatar size="lg" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-5 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-16 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-48 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}


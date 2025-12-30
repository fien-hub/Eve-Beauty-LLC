import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-[#FEF5F2] rounded-full flex items-center justify-center">
            <span className="text-6xl">💅</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">
          Page Not Found
        </h1>
        <p className="text-[#9E9E9E] mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#F4B5A4] text-black font-semibold rounded-xl hover:bg-[#E89580] transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>

          <Link
            href="/browse"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-[#F4B5A4] text-[#D97A5F] font-semibold rounded-xl hover:bg-[#FEF5F2] transition-colors"
          >
            <Search className="w-5 h-5" />
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  )
}


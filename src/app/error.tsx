'use client'

import { useEffect } from 'react'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">
          Something Went Wrong
        </h1>
        <p className="text-[#9E9E9E] mb-2">
          We&apos;re sorry, but something unexpected happened.
          Please try again or contact support if the problem persists.
        </p>
        
        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl text-left">
            <p className="text-sm font-mono text-red-600 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mt-8">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#F4B5A4] text-black font-semibold rounded-xl hover:bg-[#E89580] transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-[#F4B5A4] text-[#D97A5F] font-semibold rounded-xl hover:bg-[#FEF5F2] transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </a>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-sm text-[#9E9E9E]">
          Need help?{' '}
          <a href="/customer/help" className="text-[#D97A5F] hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}


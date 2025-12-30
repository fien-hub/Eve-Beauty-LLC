'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F7F7F7',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
            {/* Error Icon */}
            <div style={{
              width: '8rem',
              height: '8rem',
              margin: '0 auto 2rem',
              backgroundColor: '#FEE2E2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
            }}>
              ⚠️
            </div>

            {/* Error Message */}
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1A1A1A',
              marginBottom: '1rem',
            }}>
              Critical Error
            </h1>
            <p style={{
              color: '#9E9E9E',
              marginBottom: '2rem',
            }}>
              A critical error occurred. Please refresh the page or try again later.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={reset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#F4B5A4',
                  color: 'black',
                  fontWeight: '600',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                🔄 Try Again
              </button>
              
              <a
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #F4B5A4',
                  color: '#D97A5F',
                  fontWeight: '600',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
                }}
              >
                🏠 Go to Homepage
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}


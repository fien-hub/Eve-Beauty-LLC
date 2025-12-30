import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// Mock next/link - use createElement to avoid JSX in .ts file
vi.mock('next/link', () => {
  const React = require('react')
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => {
      return React.createElement('a', { href }, children)
    },
  }
})

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(() => ({ data: { user: null }, error: null })),
      getSession: vi.fn(() => ({ data: { session: null }, error: null })),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  }),
}))


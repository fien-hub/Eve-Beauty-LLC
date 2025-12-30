import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/(auth)/login/page'

// Mock the Supabase client
const mockSignInWithPassword = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(<LoginPage />)

    expect(screen.getByText('Eve Beauty')).toBeInTheDocument()
    expect(screen.getByText('Welcome back! Sign in to continue')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })

    render(<LoginPage />)
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error message on failed login', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' }
    })

    render(<LoginPage />)
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
  })

  it('has link to signup page', () => {
    render(<LoginPage />)

    const signupLink = screen.getByRole('link', { name: /sign up/i })
    expect(signupLink).toHaveAttribute('href', '/signup')
  })

  it('has link to forgot password page', () => {
    render(<LoginPage />)

    const forgotLink = screen.getByRole('link', { name: /forgot password/i })
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })

  it('disables submit button while loading', async () => {
    // Make the sign in take a while
    mockSignInWithPassword.mockImplementation(() => new Promise(() => {}))

    render(<LoginPage />)
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })
})


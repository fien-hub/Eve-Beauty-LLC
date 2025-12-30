import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '@/app/(auth)/signup/page'

const mockSignUp = vi.fn()
const mockInsert = vi.fn()
const mockPush = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
    from: () => ({
      insert: mockInsert,
    }),
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
  })

  it('renders signup form correctly', () => {
    render(<SignupPage />)

    expect(screen.getByText('Eve Beauty')).toBeInTheDocument()
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByText('Customer')).toBeInTheDocument()
    expect(screen.getByText('Provider')).toBeInTheDocument()
  })

  it('shows role selection buttons', () => {
    render(<SignupPage />)

    expect(screen.getByText('Customer')).toBeInTheDocument()
    expect(screen.getByText('Book services')).toBeInTheDocument()
    expect(screen.getByText('Provider')).toBeInTheDocument()
    expect(screen.getByText('Offer services')).toBeInTheDocument()
  })

  it('displays error message on failed signup', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Email already registered' }
    })

    render(<SignupPage />)
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Jane Doe'), 'Test User')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'existing@example.com')

    const passwordInputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(passwordInputs[0], 'password123')
    await user.type(passwordInputs[1], 'password123')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })
  })

  it('has link to login page', () => {
    render(<SignupPage />)

    const loginLink = screen.getByRole('link', { name: /sign in/i })
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('allows switching between customer and provider roles', async () => {
    render(<SignupPage />)
    const user = userEvent.setup()

    const providerButton = screen.getByText('Provider').closest('button')
    expect(providerButton).toBeTruthy()

    await user.click(providerButton!)

    // Provider button should now be selected (has the active class)
    expect(providerButton).toHaveClass('border-[#F4B5A4]')
  })
})


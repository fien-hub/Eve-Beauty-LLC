import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page'

const mockResetPasswordForEmail = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders forgot password form correctly', () => {
    render(<ForgotPasswordPage />)
    
    expect(screen.getByText('Forgot password?')).toBeInTheDocument()
    expect(screen.getByText("No worries, we'll send you reset instructions.")).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('has link back to login', () => {
    render(<ForgotPasswordPage />)
    
    const loginLinks = screen.getAllByRole('link', { name: /login|sign in/i })
    expect(loginLinks.length).toBeGreaterThan(0)
    expect(loginLinks[0]).toHaveAttribute('href', '/login')
  })

  it('handles successful password reset request', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    
    render(<ForgotPasswordPage />)
    const user = userEvent.setup()
    
    await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', expect.any(Object))
    })
    
    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument()
    })
    
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
  })

  it('displays error message on failed reset request', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ 
      error: { message: 'Email not found' } 
    })
    
    render(<ForgotPasswordPage />)
    const user = userEvent.setup()
    
    await user.type(screen.getByPlaceholderText('Enter your email'), 'unknown@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Email not found')).toBeInTheDocument()
    })
  })

  it('allows trying another email after success', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    
    render(<ForgotPasswordPage />)
    const user = userEvent.setup()
    
    await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /try another email/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Forgot password?')).toBeInTheDocument()
    })
  })

  it('validates email field is required', async () => {
    render(<ForgotPasswordPage />)
    const user = userEvent.setup()
    
    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    await user.click(submitButton)
    
    // HTML5 validation should prevent submission
    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toBeRequired()
  })
})


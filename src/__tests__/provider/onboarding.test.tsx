import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProviderOnboarding from '@/app/(provider)/provider/onboarding/page'

const mockGetUser = vi.fn()
const mockInsert = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: () => ({
      insert: mockInsert,
    }),
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

describe('ProviderOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockInsert.mockResolvedValue({ error: null })
  })

  it('renders onboarding page with welcome message', () => {
    render(<ProviderOnboarding />)
    
    expect(screen.getByText(/welcome to eve beauty pro/i)).toBeInTheDocument()
    expect(screen.getByText(/set up your provider profile/i)).toBeInTheDocument()
  })

  it('shows step 1 - business information', () => {
    render(<ProviderOnboarding />)
    
    expect(screen.getByText('Business Information')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/jane's nail studio/i)).toBeInTheDocument()
  })

  it('shows progress indicators', () => {
    render(<ProviderOnboarding />)
    
    // Should have 3 progress dots
    const progressDots = document.querySelectorAll('.rounded-full')
    expect(progressDots.length).toBe(3)
  })

  it('allows entering business name', async () => {
    render(<ProviderOnboarding />)
    const user = userEvent.setup()
    
    const businessNameInput = screen.getByPlaceholderText(/jane's nail studio/i)
    await user.type(businessNameInput, 'My Beauty Business')
    
    expect(businessNameInput).toHaveValue('My Beauty Business')
  })

  it('allows entering bio', async () => {
    render(<ProviderOnboarding />)
    const user = userEvent.setup()
    
    const bioInput = screen.getByPlaceholderText(/tell customers about yourself/i)
    await user.type(bioInput, 'Professional makeup artist with 5 years experience')
    
    expect(bioInput).toHaveValue('Professional makeup artist with 5 years experience')
  })

  it('navigates to step 2 when continue is clicked', async () => {
    render(<ProviderOnboarding />)
    const user = userEvent.setup()

    // Fill required field first
    await user.type(screen.getByPlaceholderText(/jane's nail studio/i), 'Test Business')

    const continueButton = screen.getByRole('button', { name: /continue/i })
    await user.click(continueButton)

    // Step 2 should show Service Area
    await waitFor(() => {
      expect(screen.getByText('Service Area')).toBeInTheDocument()
    })
  })

  it('shows error on failed submission', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'Database error' } })

    render(<ProviderOnboarding />)
    const user = userEvent.setup()

    // Fill step 1 and continue
    await user.type(screen.getByPlaceholderText(/jane's nail studio/i), 'Test Business')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText('Service Area')).toBeInTheDocument()
    })

    // Step 2 has two buttons - Back and Continue. Get Continue (second one)
    const buttons = screen.getAllByRole('button')
    const continueBtn = buttons.find(b => b.textContent === 'Continue')
    await user.click(continueBtn!)

    await waitFor(() => {
      expect(screen.getByText('Review & Submit')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /complete setup/i }))

    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument()
    })
  })

  it('redirects to login if user not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    render(<ProviderOnboarding />)
    const user = userEvent.setup()

    // Fill step 1 and continue
    await user.type(screen.getByPlaceholderText(/jane's nail studio/i), 'Test Business')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText('Service Area')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const continueBtn = buttons.find(b => b.textContent === 'Continue')
    await user.click(continueBtn!)

    await waitFor(() => {
      expect(screen.getByText('Review & Submit')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /complete setup/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('redirects to dashboard on successful completion', async () => {
    render(<ProviderOnboarding />)
    const user = userEvent.setup()

    // Fill step 1
    await user.type(screen.getByPlaceholderText(/jane's nail studio/i), 'Test Business')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Go to step 2
    await waitFor(() => {
      expect(screen.getByText('Service Area')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const continueBtn = buttons.find(b => b.textContent === 'Continue')
    await user.click(continueBtn!)

    // Step 3 - complete
    await waitFor(() => {
      expect(screen.getByText('Review & Submit')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /complete setup/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/provider/dashboard')
    })
  })
})


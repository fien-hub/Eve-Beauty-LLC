import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, ProviderProfile } from '@/types'

interface AuthState {
  user: User | null
  providerProfile: ProviderProfile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProviderProfile: (profile: ProviderProfile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      providerProfile: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setProviderProfile: (providerProfile) => set({ providerProfile }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, providerProfile: null }),
    }),
    {
      name: 'evebeauty-auth',
      partialize: (state) => ({ user: state.user, providerProfile: state.providerProfile }),
    }
  )
)


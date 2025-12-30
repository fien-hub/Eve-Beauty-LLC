'use client'

import { useState, useCallback } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'

type AuthAction = 'like' | 'save' | 'book' | 'message' | 'favorite' | 'general'

export function useAuthGuard() {
  const { user } = useAuthStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authAction, setAuthAction] = useState<AuthAction>('general')

  const requireAuth = useCallback((action: AuthAction, callback?: () => void) => {
    if (!user) {
      setAuthAction(action)
      setShowAuthModal(true)
      return false
    }
    
    if (callback) {
      callback()
    }
    return true
  }, [user])

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false)
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    showAuthModal,
    authAction,
    requireAuth,
    closeAuthModal,
  }
}

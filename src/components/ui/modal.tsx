'use client'

import { cn } from '@/lib/utils'
import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
  closeOnOverlay?: boolean
  className?: string
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  className,
}: ModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full mx-4 bg-white rounded-2xl shadow-xl animate-scale-in',
          sizeStyles[size],
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-[#1A1A1A]">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-[#6B6B6B] mt-1">{description}</p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 -mt-2 rounded-full hover:bg-[#F7F7F7] transition-colors"
              >
                <X className="w-5 h-5 text-[#6B6B6B]" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-[#F0F0F0]',
        className
      )}
    >
      {children}
    </div>
  )
}

// Confirmation modal preset
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  const confirmStyles = {
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white',
    warning: 'bg-[#F59E0B] hover:bg-[#D97706] text-white',
    default: 'bg-[#F4B5A4] hover:bg-[#E89580] text-[#1A1A1A]',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-[#6B6B6B]">{message}</p>
      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors"
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={cn('px-4 py-2 rounded-xl font-semibold transition-colors', confirmStyles[variant])}
          disabled={loading}
        >
          {loading ? 'Loading...' : confirmText}
        </button>
      </ModalFooter>
    </Modal>
  )
}


'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-6 bg-red-50 rounded-xl text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-[#9E9E9E] mb-4">
            This section failed to load. Please try again.
          </p>
          <Button onClick={this.handleReset} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Inline error display for smaller components
interface InlineErrorProps {
  message?: string
  onRetry?: () => void
}

export function InlineError({ 
  message = 'Failed to load', 
  onRetry 
}: InlineErrorProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-600 flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Retry
        </button>
      )}
    </div>
  )
}

// Empty state with error styling
interface ErrorStateProps {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function ErrorState({
  title = 'Error',
  description = 'Something went wrong. Please try again.',
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-sm text-[#9E9E9E] max-w-sm mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}


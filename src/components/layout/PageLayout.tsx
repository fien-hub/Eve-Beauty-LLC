'use client'

import { ReactNode } from 'react'
import { Header } from './Header'
import { MobileBottomNav } from './MobileBottomNav'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: ReactNode
  user?: {
    id: string
    email?: string
    first_name?: string
    last_name?: string
    avatar_url?: string | null
    role?: 'customer' | 'provider' | 'admin'
  } | null
  variant?: 'customer' | 'provider' | 'public'
  showBottomNav?: boolean
  className?: string
  containerClassName?: string
  fullWidth?: boolean
}

export function PageLayout({
  children,
  user,
  variant = 'customer',
  showBottomNav = true,
  className,
  containerClassName,
  fullWidth = false,
}: PageLayoutProps) {
  const isProvider = variant === 'provider'
  const showMobileNav = showBottomNav && user && variant !== 'public'

  return (
    <div className={cn('min-h-screen bg-[#F7F7F7]', className)}>
      <Header user={user} variant={isProvider ? 'provider' : 'default'} />
      
      <main
        className={cn(
          'animate-page-enter',
          showMobileNav && 'mobile-nav-padding',
          containerClassName
        )}
      >
        {fullWidth ? (
          children
        ) : (
          <div className="container-responsive py-6 md:py-8">
            {children}
          </div>
        )}
      </main>
      
      {showMobileNav && (
        <MobileBottomNav variant={isProvider ? 'provider' : 'customer'} />
      )}
    </div>
  )
}

// Simple page header component for consistent page titles
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  backLink?: {
    href: string
    label?: string
  }
}

export function PageHeader({ title, subtitle, action, backLink }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
      <div>
        {backLink && (
          <a
            href={backLink.href}
            className="text-sm text-[#6B6B6B] hover:text-[#D97A5F] mb-2 inline-flex items-center gap-1 transition-colors"
          >
            ← {backLink.label || 'Back'}
          </a>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{title}</h1>
        {subtitle && (
          <p className="text-[#6B6B6B] mt-1 text-sm md:text-base">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// Content section wrapper
interface ContentSectionProps {
  children: ReactNode
  title?: string
  action?: ReactNode
  className?: string
}

export function ContentSection({ children, title, action, className }: ContentSectionProps) {
  return (
    <section className={cn('mb-6 md:mb-8', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg md:text-xl font-semibold text-[#1A1A1A]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

// Two-column responsive layout
interface TwoColumnLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  sidebarPosition?: 'left' | 'right'
  className?: string
}

export function TwoColumnLayout({ children, sidebar, sidebarPosition = 'right', className }: TwoColumnLayoutProps) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8', className)}>
      {sidebarPosition === 'left' && (
        <aside className="lg:col-span-1 order-2 lg:order-1">{sidebar}</aside>
      )}
      <div className={cn('lg:col-span-2', sidebarPosition === 'left' && 'order-1 lg:order-2')}>
        {children}
      </div>
      {sidebarPosition === 'right' && (
        <aside className="lg:col-span-1">{sidebar}</aside>
      )}
    </div>
  )
}


'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings, Calendar, Heart } from 'lucide-react'

interface HeaderProps {
  user?: {
    id: string
    email?: string
    first_name?: string
    last_name?: string
    avatar_url?: string | null
    role?: 'customer' | 'provider' | 'admin'
  } | null
  variant?: 'default' | 'provider'
}

export function Header({ user, variant = 'default' }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isProvider = variant === 'provider' || user?.role === 'provider'
  const brandText = isProvider ? 'Eve Beauty Pro' : 'Eve Beauty'

  // Customer nav: Search, Bookings, Messages
  const customerLinks = [
    { href: '/search', label: 'Search' },
    { href: '/customer/bookings', label: 'Bookings' },
    { href: '/customer/messages', label: 'Messages' },
  ]

  // Provider nav: Appointments, Services, Portfolio, Messages
  const providerLinks = [
    { href: '/provider/bookings', label: 'Appointments' },
    { href: '/provider/services', label: 'Services' },
    { href: '/provider/portfolio', label: 'Portfolio' },
    { href: '/provider/messages', label: 'Messages' },
  ]

  const navLinks = isProvider ? providerLinks : customerLinks

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F0F0F0]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - links to feed/home */}
          <Link href={user ? (isProvider ? '/provider/home' : '/customer/discover') : '/'} className="flex items-center">
            <span className="text-2xl font-bold text-[#D97A5F]">{brandText}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {user ? (
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-[#FEF5F2] text-[#D97A5F]'
                      : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F7F7F7]'
                  )}
                >
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <Link href="/browse" className="px-4 py-2 text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">
                  Browse
                </Link>
                <Link href="/login" className="px-4 py-2 text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="ml-2 px-5 py-2.5 bg-[#F4B5A4] text-[#1A1A1A] rounded-xl font-semibold hover:bg-[#E89580] transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Right side - User menu or Auth buttons */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                {/* Notifications */}
                <Link
                  href={isProvider ? '/provider/notifications' : '/customer/notifications'}
                  className="relative p-2 text-[#6B6B6B] hover:text-[#D97A5F] hover:bg-[#FEF5F2] rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {/* Notification badge */}
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
                </Link>

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#F7F7F7] transition-colors"
                  >
                    <Avatar src={user.avatar_url} name={user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : undefined} size="sm" />
                    <ChevronDown className={cn('w-4 h-4 text-[#6B6B6B] hidden md:block transition-transform', userMenuOpen && 'rotate-180')} />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#F0F0F0] py-2 animate-scale-in origin-top-right">
                      <div className="px-4 py-2 border-b border-[#F0F0F0]">
                        <p className="font-semibold text-[#1A1A1A] truncate">{user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User'}</p>
                        <p className="text-sm text-[#6B6B6B] truncate">{user.email}</p>
                      </div>
                      <UserMenuLinks isProvider={isProvider} />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#6B6B6B] hover:text-[#1A1A1A] rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu isOpen={mobileMenuOpen} user={user} navLinks={navLinks} isProvider={isProvider} onClose={() => setMobileMenuOpen(false)} />
    </header>
  )
}

// User menu links
function UserMenuLinks({ isProvider }: { isProvider: boolean }) {
  const links = isProvider
    ? [
        { href: '/provider/profile', icon: User, label: 'Profile' },
        { href: '/provider/bookings', icon: Calendar, label: 'Bookings' },
        { href: '/provider/settings', icon: Settings, label: 'Settings' },
      ]
    : [
        { href: '/customer/profile', icon: User, label: 'Profile' },
        { href: '/customer/bookings', icon: Calendar, label: 'Bookings' },
        { href: '/customer/favorites', icon: Heart, label: 'Favorites' },
        { href: '/customer/settings', icon: Settings, label: 'Settings' },
      ]

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center gap-3 px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F7F7F7]"
        >
          <link.icon className="w-4 h-4" />
          {link.label}
        </Link>
      ))}
      <div className="border-t border-[#F0F0F0] mt-2 pt-2">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2 w-full text-sm text-[#EF4444] hover:bg-[#FEE2E2]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  )
}

// Mobile menu
interface MobileMenuProps {
  isOpen: boolean
  user: HeaderProps['user']
  navLinks: Array<{ href: string; label: string }>
  isProvider: boolean
  onClose: () => void
}

function MobileMenu({ isOpen, user, navLinks, isProvider, onClose }: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="md:hidden border-t border-[#F0F0F0] bg-white animate-slide-down">
      <div className="px-4 py-3 space-y-1">
        {user ? (
          <>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="block px-3 py-2 rounded-lg text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F7F7F7] font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#F0F0F0] mt-2 pt-2">
              <Link
                href={isProvider ? '/provider/profile' : '/customer/profile'}
                onClick={onClose}
                className="block px-3 py-2 rounded-lg text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F7F7F7] font-medium"
              >
                Profile
              </Link>
              <Link
                href={isProvider ? '/provider/settings' : '/customer/settings'}
                onClick={onClose}
                className="block px-3 py-2 rounded-lg text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F7F7F7] font-medium"
              >
                Settings
              </Link>
              <form action="/api/auth/signout" method="POST" className="mt-2">
                <button
                  type="submit"
                  className="block w-full text-left px-3 py-2 rounded-lg text-[#EF4444] hover:bg-[#FEE2E2] font-medium"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/browse"
              onClick={onClose}
              className="block px-3 py-2 rounded-lg text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F7F7F7] font-medium"
            >
              Browse
            </Link>
            <Link
              href="/login"
              onClick={onClose}
              className="block px-3 py-2 rounded-lg text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F7F7F7] font-medium"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={onClose}
              className="block px-3 py-2 mt-2 bg-[#F4B5A4] text-center text-[#1A1A1A] rounded-xl font-semibold"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  )
}


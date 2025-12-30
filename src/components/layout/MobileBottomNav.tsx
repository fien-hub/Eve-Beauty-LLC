'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Calendar, MessageCircle, User, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  variant?: 'customer' | 'provider'
}

export function MobileBottomNav({ variant = 'customer' }: MobileBottomNavProps) {
  const pathname = usePathname()

  // Customer tabs: Home (Feed), Search, Bookings, Messages, Profile
  const customerLinks = [
    { href: '/customer/discover', icon: Home, label: 'Discover' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/customer/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/customer/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/customer/profile', icon: User, label: 'Profile' },
  ]

  // Provider tabs: Home (Feed), Appointments, Services, Messages, Profile
  const providerLinks = [
    { href: '/provider/home', icon: Home, label: 'Home' },
    { href: '/provider/bookings', icon: Calendar, label: 'Appointments' },
    { href: '/provider/services', icon: Briefcase, label: 'Services' },
    { href: '/provider/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/provider/profile', icon: User, label: 'Profile' },
  ]

  const links = variant === 'provider' ? providerLinks : customerLinks

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E5E5E5] safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]',
                isActive
                  ? 'text-[#D97A5F]'
                  : 'text-[#9E9E9E] hover:text-[#6B6B6B]'
              )}
            >
              <link.icon className={cn('w-5 h-5', isActive && 'animate-bounce-in')} />
              <span className="text-xs font-medium">{link.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-[#D97A5F] rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


'use client'

import { cn } from '@/lib/utils'
import { ReactNode, createContext, useContext, useState } from 'react'

// Context for tabs
interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab components must be used within Tabs')
  return context
}

// Tabs container
interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
  onChange?: (value: string) => void
}

export function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  const handleChange = (tab: string) => {
    setActiveTab(tab)
    onChange?.(tab)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

// Tab list (container for triggers)
interface TabsListProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'pills' | 'underline'
}

const listVariants = {
  default: 'bg-[#F7F7F7] p-1 rounded-xl',
  pills: 'gap-2',
  underline: 'border-b border-[#E5E5E5] gap-4',
}

export function TabsList({ children, className, variant = 'default' }: TabsListProps) {
  return (
    <div className={cn('flex', listVariants[variant], className)}>
      {children}
    </div>
  )
}

// Tab trigger (button)
interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
  variant?: 'default' | 'pills' | 'underline'
  disabled?: boolean
}

export function TabsTrigger({
  value,
  children,
  className,
  variant = 'default',
  disabled = false,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  const baseStyles = 'font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    default: cn(
      'px-4 py-2 rounded-lg text-sm',
      isActive
        ? 'bg-white text-[#1A1A1A] shadow-sm'
        : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
    ),
    pills: cn(
      'px-4 py-2 rounded-full text-sm',
      isActive
        ? 'bg-[#F4B5A4] text-[#1A1A1A]'
        : 'bg-[#F7F7F7] text-[#6B6B6B] hover:bg-[#E5E5E5]'
    ),
    underline: cn(
      'pb-3 text-sm border-b-2 -mb-px',
      isActive
        ? 'border-[#D97A5F] text-[#D97A5F]'
        : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
    ),
  }

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(baseStyles, variantStyles[variant], className)}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// Tab content
interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabsContext()
  
  if (activeTab !== value) return null

  return (
    <div className={cn('animate-fade-in', className)}>
      {children}
    </div>
  )
}

// Pill tabs (simplified version matching mobile app)
interface PillTabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function PillTabs({ tabs, activeTab, onTabChange, className }: PillTabsProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            activeTab === tab
              ? 'bg-[#F4B5A4] text-[#1A1A1A]'
              : 'bg-[#F7F7F7] text-[#6B6B6B] hover:bg-[#E5E5E5]'
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}


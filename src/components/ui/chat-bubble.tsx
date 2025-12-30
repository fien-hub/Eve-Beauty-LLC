import { cn } from '@/lib/utils'
import { Avatar } from './avatar'
import { Check, CheckCheck } from 'lucide-react'
import Image from 'next/image'

interface ChatBubbleProps {
  message: {
    id: string
    content: string
    created_at: string
    is_read?: boolean
    sender: {
      id: string
      name: string
      avatar_url?: string | null
    }
    image_url?: string | null
  }
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  className?: string
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function ChatBubble({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  className,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        'flex gap-2 max-w-[85%]',
        isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto',
        className
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar
          src={message.sender.avatar_url}
          name={message.sender.name}
          size="sm"
          className="flex-shrink-0 mt-auto"
        />
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      {/* Bubble */}
      <div className="flex flex-col">
        {/* Image if present */}
        {message.image_url && (
          <div
            className={cn(
              'relative w-48 h-48 rounded-2xl overflow-hidden mb-1',
              isOwn ? 'rounded-br-md' : 'rounded-bl-md'
            )}
          >
            <Image
              src={message.image_url}
              alt="Shared image"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl',
              isOwn
                ? 'bg-[#F4B5A4] text-[#1A1A1A] rounded-br-md'
                : 'bg-[#F7F7F7] text-[#1A1A1A] rounded-bl-md'
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}

        {/* Timestamp & read status */}
        {showTimestamp && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1',
              isOwn ? 'justify-end' : 'justify-start'
            )}
          >
            <span className="text-xs text-[#9E9E9E]">
              {formatMessageTime(message.created_at)}
            </span>
            {isOwn && (
              message.is_read ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#D97A5F]" />
              ) : (
                <Check className="w-3.5 h-3.5 text-[#9E9E9E]" />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Date separator
export function ChatDateSeparator({ date }: { date: string }) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex items-center justify-center my-4">
      <div className="px-3 py-1 bg-[#F7F7F7] rounded-full">
        <span className="text-xs text-[#9E9E9E]">{formattedDate}</span>
      </div>
    </div>
  )
}

// Typing indicator
export function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-2 max-w-[85%] mr-auto">
      <div className="px-4 py-3 bg-[#F7F7F7] rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[#9E9E9E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#9E9E9E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#9E9E9E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      {name && (
        <span className="text-xs text-[#9E9E9E]">{name} is typing...</span>
      )}
    </div>
  )
}

// Chat input component
interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ChatInput({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  className,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) onSend()
    }
  }

  return (
    <div className={cn('flex items-end gap-2 p-4 bg-white border-t border-[#F0F0F0]', className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 px-4 py-2.5 bg-[#F7F7F7] rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#F4B5A4] text-sm max-h-32"
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="p-2.5 bg-[#F4B5A4] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E89580] transition-colors"
      >
        <svg className="w-5 h-5 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  )
}


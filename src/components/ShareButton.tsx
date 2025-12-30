'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Link2, Twitter, Facebook, Copy, Check, X } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
  iconOnly?: boolean;
}

export default function ShareButton({ 
  url, 
  title, 
  description = '', 
  imageUrl,
  className = '',
  iconOnly = false 
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = async () => {
    // Use native share on mobile if available
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        return;
      } catch (e) {
        // User cancelled or error, fall through to show menu
      }
    }
    // Show share menu on desktop
    setShowMenu(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 2000);
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=450');
    setShowMenu(false);
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank', 'width=550,height=450');
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 transition-colors ${className}`}
      >
        <Share2 className="w-5 h-5" />
        {!iconOnly && <span>Share</span>}
      </button>

      {/* Share Menu */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-[#E5E5E5] py-2 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-[#F0F0F0] flex items-center justify-between">
            <span className="font-semibold text-[#1A1A1A] text-sm">Share</span>
            <button onClick={() => setShowMenu(false)} className="text-[#9E9E9E] hover:text-[#1A1A1A]">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#1A1A1A] hover:bg-[#F7F7F7] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-[#10B981]" />
                <span className="text-[#10B981] font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5 text-[#6B6B6B]" />
                <span>Copy link</span>
              </>
            )}
          </button>
          
          <button
            onClick={shareToTwitter}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#1A1A1A] hover:bg-[#F7F7F7] transition-colors"
          >
            <Twitter className="w-5 h-5 text-[#1DA1F2]" />
            <span>Twitter / X</span>
          </button>
          
          <button
            onClick={shareToFacebook}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#1A1A1A] hover:bg-[#F7F7F7] transition-colors"
          >
            <Facebook className="w-5 h-5 text-[#1877F2]" />
            <span>Facebook</span>
          </button>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import Image from 'next/image';

export default function AppBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile and banner not dismissed
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      // Check if banner was dismissed
      const dismissed = localStorage.getItem('app-banner-dismissed');
      if (mobile && !dismissed) {
        setIsVisible(true);
      }
    };
    
    checkMobile();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('app-banner-dismissed', 'true');
  };

  const handleOpenApp = () => {
    // Deep link to app or app store
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const appStoreUrl = isIOS
      ? 'https://apps.apple.com/app/evebeauty/id123456789' // Replace with real ID
      : 'https://play.google.com/store/apps/details?id=com.evebeauty.app'; // Replace with real ID

    // Try to open app first via deep link
    const deepLink = `evebeauty://`;
    
    // Attempt to open app
    const now = Date.now();
    window.location.href = deepLink;
    
    // If app doesn't open in 2 seconds, redirect to app store
    setTimeout(() => {
      if (Date.now() - now < 2500) {
        window.location.href = appStoreUrl;
      }
    }, 2000);
  };

  if (!isVisible || !isMobile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1A1A1A] to-[#333] px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        {/* App Icon */}
        <Image
          src="/logo.svg"
          alt="Eve Beauty Logo"
          width={48}
          height={48}
          className="rounded-xl shadow-md flex-shrink-0"
        />
        
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">Eve Beauty</p>
          <p className="text-xs text-gray-300 truncate">Get the best experience in our app</p>
        </div>
        
        {/* Open Button */}
        <button
          onClick={handleOpenApp}
          className="flex items-center gap-1.5 bg-white text-[#1A1A1A] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#F7F7F7] transition-colors"
        >
          <Download className="w-4 h-4" />
          Open
        </button>
        
        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}


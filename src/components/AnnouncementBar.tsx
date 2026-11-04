'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Tag, ShieldCheck, ChevronRight } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function AnnouncementBar() {
  const { settings } = useShop();
  const [currentIdx, setCurrentIdx] = useState(0);

  const defaultMessages = [
    { icon: Truck, text: settings?.announcementText || "FREE EXPRESS SHIPPING ON ALL ORDERS ABOVE ₹999" },
    { icon: Tag, text: "GET EXTRA 10% OFF ON YOUR FIRST ORDER | USE CODE: LUXEE10" },
    { icon: ShieldCheck, text: "HASSLE-FREE 7-DAY RETURNS & EXCHANGES ACROSS INDIA" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % defaultMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [defaultMessages.length]);

  const CurrentIcon = defaultMessages[currentIdx].icon;

  return (
    <div className="bg-black text-white text-[11px] sm:text-xs font-semibold tracking-wider py-2 px-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <CurrentIcon className="w-3.5 h-3.5 text-red-500 animate-pulse" />
        <span className="text-center font-medium uppercase tracking-widest">
          {defaultMessages[currentIdx].text}
        </span>
        <ChevronRight className="w-3.5 h-3.5 opacity-60 hidden sm:inline" />
      </div>
    </div>
  );
}

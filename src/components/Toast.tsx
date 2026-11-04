'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { CheckCircle, Bell } from 'lucide-react';

export default function Toast() {
  const { toast } = useShop();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded shadow-2xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider animate-bounce">
      <CheckCircle className="w-4 h-4 text-green-400" />
      <span>{toast}</span>
    </div>
  );
}

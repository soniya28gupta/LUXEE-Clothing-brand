'use client';

import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Award, Sparkles } from 'lucide-react';

const highlights = [
  {
    icon: Truck,
    title: "FREE EXPRESS SHIPPING",
    description: "On all prepaid & COD orders above ₹999 across India"
  },
  {
    icon: RotateCcw,
    title: "EASY 7-DAY RETURNS",
    description: "Doorstep pickup & instant store credit/bank refund"
  },
  {
    icon: Award,
    title: "PREMIUM STREETWEAR",
    description: "Engineered heavyweight 280+ GSM cotton & bespoke denim"
  },
  {
    icon: ShieldCheck,
    title: "100% SECURE CHECKOUT",
    description: "Encrypted transactions via UPI, Cards, NetBanking & COD"
  }
];

export default function BrandHighlights() {
  return (
    <section className="py-12 bg-neutral-50 border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-black mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black font-heading mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

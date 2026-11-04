'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { Sparkles, ArrowRight, MessageSquareCode } from 'lucide-react';

const starterIdeas = [
  "Find oversized tees under ₹1,500",
  "Recommend a streetwear party fit",
  "Show me baggy jeans in size 32",
  "Formal pleated trousers for office"
];

export default function AiStylistBanner() {
  const { openAiShopper } = useShop();

  return (
    <section className="py-12 bg-neutral-950 text-white border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI Personal Shopper
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-heading">
            Personalized Streetwear Styling In Seconds
          </h2>

          <p className="mt-2.5 text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Tell our AI Personal Stylist your vibe, occasion, budget, or preferred fit. We'll search our live LUXEE catalog and assemble coordinated outfit pairings tailored to you.
          </p>

          {/* Quick Prompt Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {starterIdeas.map((idea) => (
              <button
                key={idea}
                onClick={() => openAiShopper(idea)}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-white text-gray-300 hover:text-white transition flex items-center gap-1.5"
              >
                <span>{idea}</span>
                <ArrowRight className="w-3 h-3 text-red-500" />
              </button>
            ))}
          </div>

          {/* Primary CTA */}
          <div className="mt-7">
            <button
              onClick={() => openAiShopper()}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black hover:bg-neutral-200 text-xs font-black uppercase tracking-wider rounded-xs transition shadow-xl"
            >
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>Launch AI Personal Stylist</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


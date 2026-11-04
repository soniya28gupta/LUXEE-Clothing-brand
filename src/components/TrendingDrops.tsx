'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { ArrowRight, Flame } from 'lucide-react';

interface TrendingDropsProps {
  initialProducts: Product[];
}

const tabs = [
  { label: 'ALL DROPS', value: 'All' },
  { label: 'BESTSELLERS', value: 'Bestseller' },
  { label: 'SHIRTS', value: 'Shirts' },
  { label: 'JEANS', value: 'Jeans' },
  { label: 'OVERSIZED', value: 'Oversized T-Shirts' },
  { label: 'TROUSERS', value: 'Trousers' },
];

export default function TrendingDrops({ initialProducts }: TrendingDropsProps) {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = initialProducts.filter((p) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Bestseller') return p.is_bestseller;
    return p.category.toLowerCase() === activeTab.toLowerCase();
  });

  const displayProducts = filtered.slice(0, 12);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-red-600 text-xs font-black tracking-widest uppercase mb-1">
              <Flame className="w-4 h-4 fill-red-600" />
              <span>FRESH RELEASES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tighter uppercase font-heading">
              TRENDING DROPS
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid: 4 columns desktop, 3 columns tablet, 2 columns mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <a
            href="/collections/all"
            className="inline-flex items-center gap-2 border-2 border-black px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all transform hover:-translate-y-0.5"
          >
            <span>VIEW COMPLETE CATALOG ({initialProducts.length}+ ITEMS)</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

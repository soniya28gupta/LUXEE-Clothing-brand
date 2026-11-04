'use client';

import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  selectedFit: string;
  setSelectedFit: (fit: string) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  onReset: () => void;
  totalCount: number;
}

const fits = ['All', 'Baggy Fit', 'Straight Fit', 'Slim Fit', 'Oversized Fit', 'Relaxed Fit'];
const sizes = ['All', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];
const sorts = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Customer Rating', value: 'rating' },
  { label: 'New Arrivals', value: 'newest' },
];

export default function FilterSidebar({
  selectedFit,
  setSelectedFit,
  selectedSize,
  setSelectedSize,
  selectedSort,
  setSelectedSort,
  priceRange,
  setPriceRange,
  onReset,
  totalCount
}: FilterSidebarProps) {
  return (
    <aside className="w-full lg:w-64 bg-white p-5 rounded border border-gray-200 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-black" />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            Filters ({totalCount})
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 font-medium transition"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className="w-full text-xs p-2.5 border border-gray-300 rounded focus:border-black focus:outline-none bg-white font-medium"
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Fit Selector */}
      <div>
        <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
          Fit Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {fits.map((fit) => (
            <button
              key={fit}
              onClick={() => setSelectedFit(fit)}
              className={`text-xs px-2.5 py-1.5 rounded border uppercase transition ${
                selectedFit === fit
                  ? 'border-black bg-black text-white font-bold'
                  : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-gray-50'
              }`}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div>
        <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
          Size
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`text-xs py-1.5 border rounded uppercase transition text-center font-bold ${
                selectedSize === size
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 text-gray-700 hover:border-black bg-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-black uppercase tracking-wider">
            Max Price
          </label>
          <span className="text-xs font-bold text-black">
            ₹{priceRange[1].toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min={500}
          max={3000}
          step={100}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-black cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
          <span>₹500</span>
          <span>₹3,000</span>
        </div>
      </div>

    </aside>
  );
}

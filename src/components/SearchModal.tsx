'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { Product } from '@/lib/types';
import { Search, X, TrendingUp, ArrowRight, Sparkles, Filter } from 'lucide-react';

const trendingKeywords = [
  "Baggy Jeans",
  "Oversized Tees",
  "Linen Shirts",
  "Pleated Trousers",
  "Corduroy",
  "Streetwear Sweaters",
  "Black Denim",
  "Black Pants",
  "Red Shirt"
];

const categorySuggestions = [
  { label: "Shirts", slug: "shirts" },
  { label: "Oversized Tees", slug: "oversized-t-shirts" },
  { label: "Jeans", slug: "jeans" },
  { label: "Trousers", slug: "trousers" },
  { label: "Sweaters", slug: "sweaters" },
  { label: "Jackets", slug: "jackets" },
  { label: "Bestsellers", slug: "bestsellers" }
];

export default function SearchModal() {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen, setSelectedProduct, openAiShopper } = useShop();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.products.slice(0, 8));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleProductClick = (product: Product) => {
    setIsSearchOpen(false);
    router.push(`/products/${product.handle || product.id}`);
  };

  const handleAskAi = () => {
    setIsSearchOpen(false);
    openAiShopper(query ? `Help me find the best outfits for: ${query}` : undefined);
  };

  const handleViewAllResults = () => {
    setIsSearchOpen(false);
    router.push(`/collections?category=all&search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative min-h-screen max-w-4xl mx-auto px-4 py-8 z-10 flex flex-col">
        {/* Top Search Input Bar */}
        <div className="bg-white rounded-sm shadow-2xl p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 border-b-2 border-black pb-3">
            <Search className="w-6 h-6 text-black" />
            <input
              type="text"
              autoFocus
              placeholder="Search by Product Name, Category, Color, SKU, or Fit..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  e.preventDefault();
                  handleViewAllResults();
                }
              }}
              className="flex-1 text-base sm:text-lg font-bold text-black placeholder-gray-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-black p-1"
                aria-label="Clear query"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 rounded-full text-gray-500 hover:text-black ml-2"
              aria-label="Close search"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Ask AI Stylist Banner inside Search */}
          <div className="mt-3 flex items-center justify-between p-2.5 bg-neutral-900 text-white rounded-xs">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Looking for outfit advice or occasion styling?</span>
            </div>
            <button
              onClick={handleAskAi}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xs transition"
            >
              Ask AI Stylist
            </button>
          </div>

          {/* Quick Categories Bar */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Categories:
            </span>
            {categorySuggestions.map(cat => (
              <button
                key={cat.slug}
                onClick={() => {
                  setIsSearchOpen(false);
                  router.push(`/collections/${cat.slug}`);
                }}
                className="text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white text-gray-800 px-3 py-1 rounded-full whitespace-nowrap transition"
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Trending Searches */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Trending:
            </span>
            {trendingKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => setQuery(kw)}
                className="text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white text-gray-700 px-3 py-1 rounded-full transition"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        {loading && (
          <div className="bg-white p-8 rounded shadow text-center text-xs font-bold uppercase tracking-wider text-gray-500">
            Searching LUXEE Catalog...
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="bg-white p-12 rounded shadow text-center">
            <p className="text-sm font-bold text-black uppercase">No Products Found for "{query}"</p>
            <p className="text-xs text-gray-500 mt-1">Try searching by category ("Jeans", "Shirts"), fit ("Baggy", "Relaxed"), or color ("Black").</p>
            <button
              onClick={handleAskAi}
              className="mt-4 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded"
            >
              Ask AI Stylist to find matching items
            </button>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="bg-white p-6 rounded shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Found {results.length} Matching Products
              </span>
              <button
                type="button"
                onClick={handleViewAllResults}
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                View All Results <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {results.map((product) => {
                const img = product.preview_image || product.images[0] || '';
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div className="w-full aspect-[3/4] bg-gray-100 rounded-xs overflow-hidden relative">
                      <img
                        src={img}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {product.sku && (
                        <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {product.sku}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-bold text-black line-clamp-1 group-hover:text-red-600 transition">
                        {product.title}
                      </h4>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-extrabold text-black">
                          ₹{product.selling_price.toLocaleString('en-IN')}
                        </span>
                        {product.fit && (
                          <span className="text-[10px] text-gray-400 uppercase font-medium">
                            {product.fit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

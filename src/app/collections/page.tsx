'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AnnouncementBar from '@/components/AnnouncementBar';
import CategoryPills from '@/components/CategoryPills';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import ProductDetailModal from '@/components/ProductDetailModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import SearchModal from '@/components/SearchModal';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import { Product } from '@/lib/types';
import { SlidersHorizontal } from 'lucide-react';

const categoryTitles: Record<string, { title: string; desc: string }> = {
  'all': { title: 'ALL COLLECTIONS', desc: 'Explore all drops, streetwear essentials, and contemporary denim.' },
  'shirts': { title: 'CASUAL & LUXE SHIRTS', desc: 'Crafted with premium cotton, corduroy, and breathable textures.' },
  'oversized-t-shirts': { title: 'OVERSIZED T-SHIRTS', desc: 'Heavyweight 280+ GSM combed cotton with statement silhouettes.' },
  'jeans': { title: 'DENIM & JEANS', desc: 'Baggy, straight, bootcut, and carpenter fits washed to perfection.' },
  'trousers': { title: 'TROUSERS & CARGOS', desc: 'Tailored pleats and utilitarian cargos for modern streetwear.' },
  'sweaters': { title: 'SWEATERS & WINTERWEAR', desc: 'Seoul archive boxy fits, knitwear, and fleece hoodies.' },
  'jackets': { title: 'JACKETS & OVERSHIRTS', desc: 'Layering essentials engineered for urban transitions.' },
  'sale': { title: 'END OF SEASON SALE', desc: 'Special discounts on iconic LUXEE styles with verified savings.' },
  'new-drops': { title: 'NEW RELEASES & FRESH DROPS', desc: 'The freshest arrivals straight from the LUXEE design studio.' },
  'bestsellers': { title: 'LUXEE BESTSELLERS', desc: 'Our most loved streetwear pieces as voted by you.' }
};

function CollectionContent() {
  const searchParams = useSearchParams();
  const rawCat = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search')?.trim() || '';

  const categoryInfo = categoryTitles[rawCat.toLowerCase()] || {
    title: rawCat.replace(/[-_]/g, ' ').toUpperCase(),
    desc: 'Browse our signature LUXEE collection'
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters
  const [selectedFit, setSelectedFit] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3500]);

  useEffect(() => {
    fetchProducts();
  }, [rawCat, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products';
      const cleanCat = rawCat.toLowerCase();
      const params = new URLSearchParams();
      if (cleanCat !== 'all') params.set('category', cleanCat);
      if (searchQuery) params.set('search', searchQuery);
      if (params.size) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error('Error fetching collection products:', e);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredProducts = products.filter((p) => {
    if (selectedFit !== 'All' && p.fit !== selectedFit) return false;
    if (selectedSize !== 'All' && !p.sizes.includes(selectedSize)) return false;
    if (p.selling_price > priceRange[1]) return false;
    return true;
  });

  // Client-side sorting
  if (selectedSort === 'price_asc') {
    filteredProducts.sort((a, b) => a.selling_price - b.selling_price);
  } else if (selectedSort === 'price_desc') {
    filteredProducts.sort((a, b) => b.selling_price - a.selling_price);
  } else if (selectedSort === 'rating') {
    filteredProducts.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
  } else if (selectedSort === 'newest') {
    filteredProducts.sort((a, b) => (b.is_new_drop ? 1 : 0) - (a.is_new_drop ? 1 : 0));
  }

  const handleResetFilters = () => {
    setSelectedFit('All');
    setSelectedSize('All');
    setSelectedSort('featured');
    setPriceRange([0, 3500]);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1">
        {/* Category Header Banner */}
        <div className="bg-neutral-50 border-b border-gray-200 py-10 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
              LUXEE COLLECTION
            </span>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-black font-heading mt-1">
              {categoryInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {searchQuery ? `Search results for "${searchQuery}"` : categoryInfo.desc}
            </p>
          </div>
        </div>

        {/* Quick Category Navigation Pills (Interactive Category Switcher) */}
        <CategoryPills activeCategory={rawCat} />

        {/* Catalog Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
            <span className="text-xs font-bold uppercase text-gray-500">
              {filteredProducts.length} Items Available
            </span>
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="flex items-center gap-1.5 px-4 py-2 border border-black text-xs font-bold uppercase tracking-wider rounded"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters & Sort</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block flex-shrink-0">
              <FilterSidebar
                selectedFit={selectedFit}
                setSelectedFit={setSelectedFit}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedSort={selectedSort}
                setSelectedSort={setSelectedSort}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                onReset={handleResetFilters}
                totalCount={filteredProducts.length}
              />
            </div>

            {/* Mobile Filter Sheet */}
            {mobileFilterOpen && (
              <div className="lg:hidden mb-6">
                <FilterSidebar
                  selectedFit={selectedFit}
                  setSelectedFit={setSelectedFit}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                  selectedSort={selectedSort}
                  setSelectedSort={setSelectedSort}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  onReset={handleResetFilters}
                  totalCount={filteredProducts.length}
                />
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded border border-gray-100">
                  <h3 className="text-sm font-bold text-black uppercase">No Products in this Collection</h3>
                  <p className="text-xs text-gray-500 mt-1">Try adjusting the filter criteria or explore all collections.</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                  {filteredProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* Global Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <SearchModal />
      <AuthModal />
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-12 text-center text-xs font-bold">Loading Collection...</div>}>
      <CollectionContent />
    </Suspense>
  );
}

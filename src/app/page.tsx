'use client';

import React, { useState, useEffect } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import HeroSlider from '@/components/HeroSlider';
import CategoryPills from '@/components/CategoryPills';
import TrendingDrops from '@/components/TrendingDrops';
import BrandHighlights from '@/components/BrandHighlights';
import UgcReviewWall from '@/components/UgcReviewWall';
import Footer from '@/components/Footer';
import ProductDetailModal from '@/components/ProductDetailModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import SearchModal from '@/components/SearchModal';
import AuthModal from '@/components/AuthModal';
import { Product } from '@/lib/types';
import initialProductsData from '@/data/initialProducts.json';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(initialProductsData as Product[]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    // Optionally re-fetch from API to ensure live updates from admin edits
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(err => console.error('Failed to sync products:', err));
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Banner Announcement */}
      <AnnouncementBar />

      {/* Sticky Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Full-width Hero Banner Slider */}
        <HeroSlider />

        {/* Quick Category Thumbnails */}
        <CategoryPills />

        {/* Bestsellers & Trending Drops */}
        <TrendingDrops initialProducts={products} />

        {/* Brand USPs & Trust Badges */}
        <BrandHighlights />

        {/* Customer Reviews & UGC Wall */}
        <UgcReviewWall />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Interactive Overlays */}
      <ProductDetailModal />
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <SearchModal />
      <AuthModal />
    </div>
  );
}

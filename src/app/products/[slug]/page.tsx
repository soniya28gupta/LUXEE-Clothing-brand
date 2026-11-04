'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import SearchModal from '@/components/SearchModal';
import AuthModal from '@/components/AuthModal';
import ProductCard from '@/components/ProductCard';
import { useShop } from '@/context/ShopContext';
import { Product, Review } from '@/lib/types';
import {
  Heart,
  Star,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  Ruler,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Layers,
  Info
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart, isInWishlist, toggleWishlist, setIsCartOpen, showToast, openAiShopper } = useShop();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [complementaryProduct, setComplementaryProduct] = useState<Product | null>(null);
  const [compSelectedSize, setCompSelectedSize] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<'offers' | 'specs' | 'wash' | null>('offers');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewFit, setNewReviewFit] = useState<'Runs Small' | 'True to Size' | 'Runs Large'>('True to Size');
  const [submittingReview, setSubmittingReview] = useState(false);

  // AI Fit Assistant
  const [showAiFitModal, setShowAiFitModal] = useState(false);
  const [fitHeight, setFitHeight] = useState('175');
  const [fitWeight, setFitWeight] = useState('72');
  const [fitPreference, setFitPreference] = useState('regular');
  const [fitResult, setFitResult] = useState<any>(null);
  const [calculatingFit, setCalculatingFit] = useState(false);

  // AI Review Summary
  const [reviewSummary, setReviewSummary] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      fetchProductDetails(slug);
    }
  }, [slug]);

  const fetchProductDetails = async (targetSlug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?slug=${encodeURIComponent(targetSlug)}`);
      const data = await res.json();

      if (data.success && data.product) {
        const prod = data.product as Product;
        setProduct(prod);

        // Auto select first available size
        const firstAvailable = prod.sizes.find(
          s => (prod.stock?.[s] ?? 1) > 0
        ) || prod.sizes[0];
        setSelectedSize(firstAvailable || '');

        // Fetch reviews
        fetchReviews(prod.id);

        // Fetch complementary product for Complete-the-Look
        fetchComplementaryProduct(prod);

        // Fetch related products in same category
        fetchRelated(prod.category, prod.id);

        // Fetch AI Review summary
        fetchReviewSummary(prod.id);
      } else {
        setProduct(null);
      }
    } catch (e) {
      console.error('Failed to load product:', e);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    }
  };

  const fetchReviewSummary = async (productId: string) => {
    try {
      const res = await fetch(`/api/ai/reviews-summary?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviewSummary(data.summary);
      }
    } catch (e) {}
  };

  const fetchComplementaryProduct = async (currentProd: Product) => {
    try {
      const targetCat =
        currentProd.category === 'Jeans' ? 'Shirts' :
        currentProd.category === 'Shirts' ? 'Trousers' :
        currentProd.category === 'Oversized T-Shirts' ? 'Jeans' :
        currentProd.category === 'Trousers' ? 'Shirts' :
        currentProd.category === 'Jackets' ? 'Jeans' : 'Shirts';

      const res = await fetch(`/api/products?category=${encodeURIComponent(targetCat)}`);
      const data = await res.json();
      if (data.success && data.products.length > 0) {
        const comp = data.products.find((p: Product) => p.id !== currentProd.id) || data.products[0];
        setComplementaryProduct(comp);
        setCompSelectedSize(comp.sizes[0] || '');
      }
    } catch (e) {}
  };

  const fetchRelated = async (category: string, currentId: string) => {
    try {
      const res = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
      const data = await res.json();
      if (data.success) {
        const filtered = data.products.filter((p: Product) => p.id !== currentId).slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (e) {}
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newReviewAuthor || !newReviewComment) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: newReviewAuthor,
          rating: newReviewRating,
          comment: newReviewComment,
          fitFeedback: newReviewFit,
          title: 'Verified Buyer Review'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Review submitted successfully! Thank you.');
        setReviews(prev => [data.review, ...prev]);
        setNewReviewAuthor('');
        setNewReviewComment('');
        setShowReviewForm(false);
      }
    } catch (err) {
      showToast('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCalculateFit = async () => {
    if (!product) return;
    setCalculatingFit(true);
    try {
      const res = await fetch('/api/ai/size-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          height: fitHeight,
          weight: fitWeight,
          usualSize: selectedSize,
          fitPreference
        })
      });
      const data = await res.json();
      if (data.success) {
        setFitResult(data);
        if (data.recommendedSize) {
          setSelectedSize(data.recommendedSize);
        }
      }
    } catch (e) {
      showToast('Fit Assistant unavailable');
    } finally {
      setCalculatingFit(false);
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    const days = Math.floor(Math.random() * 2) + 2;
    setPincodeStatus(`Standard Express Delivery available in ${days} Business Days.`);
  };

  const handleAddCompleteLook = () => {
    if (!product || !complementaryProduct) return;
    addToCart(product, selectedSize || product.sizes[0], 1);
    addToCart(complementaryProduct, compSelectedSize || complementaryProduct.sizes[0], 1);
    showToast(`Added Complete Outfit (${product.title} + ${complementaryProduct.title}) to Bag!`);
    setIsCartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Loading LUXEE Product Details...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-3xl font-black text-black uppercase font-heading">Product Not Found</h1>
          <p className="text-sm text-gray-500 mt-2">The requested style may have been archived or is temporarily unavailable.</p>
          <button
            onClick={() => router.push('/collections/all')}
            className="mt-6 px-8 py-3.5 bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition"
          >
            Explore Catalog Drops
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const currentImages = product.images.length > 0 ? product.images : [product.preview_image];
  const stockForSelected = product.stock?.[selectedSize] ?? 0;
  const isOutOfStock = stockForSelected === 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
          <a href="/" className="hover:text-black transition">Home</a>
          <span>/</span>
          <a href={`/collections/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-black transition">
            {product.category}
          </a>
          <span>/</span>
          <span className="text-black">{product.title}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails strip */}
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[650px] no-scrollbar">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-26 flex-shrink-0 rounded-xs overflow-hidden border-2 transition ${
                    activeImageIdx === idx ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Active Image Display */}
            <div className="flex-1 relative aspect-[3/4] bg-neutral-100 rounded-sm overflow-hidden group">
              <img
                src={currentImages[activeImageIdx] || product.preview_image}
                alt={product.title}
                className="w-full h-full object-cover transition duration-300"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.is_bestseller && (
                  <span className="bg-black text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xs">
                    BESTSELLER
                  </span>
                )}
                {product.is_new_drop && (
                  <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xs">
                    NEW DROP
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label="Save to Wishlist"
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center transition shadow-md"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-600 text-red-600' : 'text-gray-800'}`} />
              </button>

              {/* Mobile Prev / Next Arrows */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIdx(prev => (prev === 0 ? currentImages.length - 1 : prev - 1))}
                    aria-label="Previous Image"
                    className="sm:hidden absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center shadow-md font-bold text-lg select-none"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveImageIdx(prev => (prev === currentImages.length - 1 ? 0 : prev + 1))}
                    aria-label="Next Image"
                    className="sm:hidden absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center shadow-md font-bold text-lg select-none"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Product Purchasing Details (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col">
            {/* SKU & Category */}
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
              <span>{product.category}</span>
              <span>SKU: {product.sku || `LX-${product.id.slice(0, 8).toUpperCase()}`}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight font-heading">
              {product.title}
            </h1>

            {/* Ratings & Verified Count */}
            <div className="flex items-center gap-3 mt-2 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded text-xs font-bold text-black">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.average_rating || 4.5}</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                ({product.total_ratings_count || reviews.length || 24} Verified Buyer Ratings)
              </span>
            </div>

            {/* Pricing */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-black">
                ₹{product.selling_price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.selling_price && (
                <>
                  <span className="text-sm sm:text-base text-gray-400 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    SAVE {product.discount_percentage || Math.round(((product.mrp - product.selling_price)/product.mrp)*100)}%
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              Inclusive of all taxes. Free shipping on orders over ₹999.
            </p>

            {/* Size Selector with AI Fit Assistant Trigger */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  Select Size: <strong className="text-red-600">{selectedSize}</strong>
                </span>

                <div className="flex items-center gap-3">
                  {/* AI Fit Assistant Button */}
                  <button
                    onClick={() => setShowAiFitModal(true)}
                    className="text-[11px] font-bold text-black hover:text-red-600 flex items-center gap-1 underline transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    <span>AI Size Finder</span>
                  </button>

                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-[11px] font-bold text-gray-500 hover:text-black flex items-center gap-1 underline transition"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Chart</span>
                  </button>
                </div>
              </div>

              {/* Sizes Grid */}
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const qty = product.stock?.[size] ?? 5;
                  const inStock = qty > 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      disabled={!inStock}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-xs font-bold border rounded-xs uppercase tracking-wider transition relative ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-md'
                          : inStock
                          ? 'border-gray-300 text-black hover:border-black'
                          : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                      }`}
                    >
                      <span>{size}</span>
                      {inStock && qty <= 3 && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-1 rounded uppercase tracking-tight whitespace-nowrap">
                          {qty} left
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stock Scarcity Alert */}
              {selectedSize && stockForSelected > 0 && stockForSelected <= 3 && (
                <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-red-600" />
                  Hurry! Only {stockForSelected} left in size {selectedSize}.
                </p>
              )}
              {selectedSize && stockForSelected === 0 && (
                <p className="mt-2 text-xs font-bold text-gray-400">
                  Size {selectedSize} is currently out of stock. Please select another size.
                </p>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-5">
                <span className="text-xs font-black uppercase tracking-wider text-black block mb-2">
                  Available Colors: {product.colors.join(', ')}
                </span>
                <div className="flex items-center gap-2">
                  {product.colors.map(col => (
                    <span
                      key={col}
                      className="px-3 py-1 bg-gray-100 text-black text-xs font-bold rounded-xs uppercase"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                disabled={isOutOfStock}
                onClick={() => addToCart(product, selectedSize, 1)}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xs flex items-center justify-center gap-2 transition ${
                  isOutOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-neutral-800 shadow-lg'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
              </button>

              <button
                disabled={isOutOfStock}
                onClick={() => {
                  addToCart(product, selectedSize, 1);
                  setIsCheckoutOpen(true);
                }}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xs border-2 transition ${
                  isOutOfStock
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-black text-black hover:bg-black hover:text-white'
                }`}
              >
                <span>INSTANT CHECKOUT</span>
              </button>
            </div>

            {/* Ask AI Stylist Button */}
            <button
              onClick={() => openAiShopper(`How should I style the ${product.title}? Recommend an outfit with this.`)}
              className="mt-3 w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition border border-gray-200"
            >
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>Ask AI Stylist: How to style this product?</span>
            </button>

            {/* Pincode Estimator */}
            <div className="mt-6 p-4 bg-gray-50 rounded-sm border border-gray-200">
              <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5 mb-2">
                <Truck className="w-4 h-4 text-red-600" />
                Delivery & Pincode Checker
              </span>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 text-xs border border-gray-300 px-3 py-2 rounded-xs focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded-xs hover:bg-neutral-800"
                >
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className="text-xs text-green-700 font-bold mt-2">
                  {pincodeStatus}
                </p>
              )}
            </div>

            {/* Product Specifications & Care Accordions */}
            <div className="mt-6 divide-y divide-gray-200 border-t border-b border-gray-200">
              {/* Product Details */}
              <div className="py-3.5">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'specs' ? null : 'specs')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black text-left"
                >
                  <span>Product Specifications & Fit</span>
                  {activeAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeAccordion === 'specs' && (
                  <div className="mt-3 text-xs text-gray-600 space-y-1.5">
                    <p><strong>Fit:</strong> {product.fit || 'Relaxed Streetwear Fit'}</p>
                    <p><strong>Fabric Composition:</strong> {product.fabric || '100% Combed Cotton'}</p>
                    <p><strong>Model Specs:</strong> {product.model_info || 'Model is 6\'1" wearing size L'}</p>
                    <p><strong>Occasion:</strong> {product.occasion || 'Casual & Streetwear'}</p>
                    <p className="mt-2 text-gray-700 leading-relaxed">{product.short_description}</p>
                  </div>
                )}
              </div>

              {/* Wash Care */}
              <div className="py-3.5">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'wash' ? null : 'wash')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black text-left"
                >
                  <span>Wash Care & Maintenance</span>
                  {activeAccordion === 'wash' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeAccordion === 'wash' && (
                  <div className="mt-3 text-xs text-gray-600 space-y-1">
                    <p>• {product.washcare || 'Machine Wash Cold with Similar Colors'}</p>
                    <p>• Do not bleach or tumble dry on high heat</p>
                    <p>• Warm iron inside out to preserve texture and graphic</p>
                  </div>
                )}
              </div>

              {/* Promotional Offers */}
              <div className="py-3.5">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'offers' ? null : 'offers')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black text-left"
                >
                  <span className="flex items-center gap-1.5 text-red-600 font-extrabold">
                    <Tag className="w-3.5 h-3.5" />
                    Available Coupons & Bank Offers
                  </span>
                  {activeAccordion === 'offers' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeAccordion === 'offers' && (
                  <div className="mt-3 text-xs space-y-2">
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                      <span className="font-bold text-black">CODE: LUXEE10</span>
                      <p className="text-gray-600 text-[11px]">Get flat 10% OFF on all orders over ₹999.</p>
                    </div>
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                      <span className="font-bold text-black">CODE: FLAT250</span>
                      <p className="text-gray-600 text-[11px]">Flat ₹250 instant discount on orders above ₹1,999.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-bold text-gray-600 border-t border-gray-100 pt-4">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-black" />
                <span>100% Genuine</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-5 h-5 text-black" />
                <span>7-Day Easy Return</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-black" />
                <span>Express Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 8: COMPLETE-THE-LOOK ENGINE */}
        {complementaryProduct && (
          <div className="mt-16 bg-neutral-50 p-6 sm:p-8 rounded border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-1.5 mb-1">
                  <Layers className="w-4 h-4" />
                  AI COMPLETE-THE-LOOK OUTFIT
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-black uppercase font-heading">
                  Curated Streetwear Pairing
                </h3>
                <p className="text-xs text-gray-500">
                  Engineered color & silhouette harmony. Bundle this complete outfit and save.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-400 uppercase font-bold block">Combined Bundle Price</span>
                <span className="text-2xl font-black text-black">
                  ₹{(product.selling_price + complementaryProduct.selling_price).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Two-Item Bundle Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex items-center gap-4 bg-white p-4 rounded border border-gray-200">
                <div className="w-20 h-24 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
                  <img
                    src={product.preview_image || product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Selected Item</span>
                  <h4 className="text-xs sm:text-sm font-bold text-black line-clamp-1">{product.title}</h4>
                  <p className="text-xs font-extrabold text-black mt-1">₹{product.selling_price} (Size: {selectedSize})</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded border border-gray-200">
                <div className="w-20 h-24 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
                  <img
                    src={complementaryProduct.preview_image || complementaryProduct.images[0]}
                    alt={complementaryProduct.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-red-600 uppercase">Recommended Complement</span>
                  <h4 className="text-xs sm:text-sm font-bold text-black line-clamp-1">{complementaryProduct.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-extrabold text-black">₹{complementaryProduct.selling_price}</span>
                    <select
                      value={compSelectedSize}
                      onChange={(e) => setCompSelectedSize(e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 font-bold"
                    >
                      {complementaryProduct.sizes.map(s => (
                        <option key={s} value={s}>Size {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Bundle Action Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAddCompleteLook}
                className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-xs font-black uppercase tracking-widest rounded hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD COMPLETE LOOK TO BAG</span>
              </button>
            </div>
          </div>
        )}

        {/* AI REVIEW SUMMARY & CUSTOMER REVIEWS WALL */}
        <section className="mt-16 pt-12 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-4 h-4 text-red-600" />
                COMMUNITY FEEDBACK
              </span>
              <h3 className="text-2xl font-black text-black uppercase font-heading">
                Customer Reviews & Ratings
              </h3>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-2.5 border-2 border-black text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition"
            >
              Write a Review
            </button>
          </div>

          {/* AI Review Summary Callout */}
          {reviewSummary && (
            <div className="mb-8 p-5 bg-neutral-900 text-white rounded-sm">
              <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>AI Review Insights & Sentiment</span>
              </div>
              <p className="text-sm font-bold text-white mb-2">{reviewSummary.fitConsensus}</p>
              <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                {reviewSummary.qualityHighlights?.map((hl: string, i: number) => (
                  <li key={i}>{hl}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Write Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="mb-10 bg-gray-50 p-6 rounded border border-gray-200">
              <h4 className="text-sm font-black uppercase tracking-wider text-black mb-4">Leave Your Review</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    className="w-full text-xs border border-gray-300 p-2.5 rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Rating</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="w-full text-xs border border-gray-300 p-2.5 rounded font-bold focus:outline-none focus:border-black"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Great)</option>
                    <option value={3}>⭐⭐⭐ (3 - Average)</option>
                    <option value={2}>⭐⭐ (2 - Below Expectation)</option>
                    <option value={1}>⭐ (1 - Poor)</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Fit Feedback</label>
                <div className="flex gap-4">
                  {(['Runs Small', 'True to Size', 'Runs Large'] as const).map(fit => (
                    <label key={fit} className="flex items-center gap-1.5 text-xs font-medium text-black cursor-pointer">
                      <input
                        type="radio"
                        name="fit"
                        checked={newReviewFit === fit}
                        onChange={() => setNewReviewFit(fit)}
                      />
                      <span>{fit}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Your Detailed Review</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details on fabric quality, sizing, and styling comfort..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full text-xs border border-gray-300 p-2.5 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 text-xs font-bold uppercase rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 bg-black text-white text-xs font-bold uppercase rounded hover:bg-neutral-800"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 border border-gray-100 bg-white rounded-sm shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400">{rev.date}</span>
                </div>
                <h5 className="text-xs font-bold text-black uppercase mb-1">{rev.title}</h5>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{rev.comment}</p>
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-50">
                  <span className="font-bold text-black flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-600" />
                    {rev.userName}
                  </span>
                  {rev.fitFeedback && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {rev.fitFeedback}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-black text-black uppercase font-heading mb-8">
              More from {product.category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* AI SIZE & FIT ASSISTANT MODAL */}
      {showAiFitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full p-6 rounded shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-600" />
                <h4 className="text-base font-black uppercase text-black font-heading">AI Size & Fit Stylist</h4>
              </div>
              <button onClick={() => setShowAiFitModal(false)} className="text-gray-400 hover:text-black font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Enter your body measurements to receive custom sizing guidance calibrated to this garment's exact pattern.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={fitHeight}
                  onChange={(e) => setFitHeight(e.target.value)}
                  className="w-full text-xs border border-gray-300 p-2.5 rounded font-bold"
                  placeholder="e.g. 175"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={fitWeight}
                  onChange={(e) => setFitWeight(e.target.value)}
                  className="w-full text-xs border border-gray-300 p-2.5 rounded font-bold"
                  placeholder="e.g. 72"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Silhouette Drape Preference</label>
                <select
                  value={fitPreference}
                  onChange={(e) => setFitPreference(e.target.value)}
                  className="w-full text-xs border border-gray-300 p-2.5 rounded font-bold"
                >
                  <option value="regular">Regular / Standard Fit</option>
                  <option value="oversized">Oversized / Baggy Drape</option>
                  <option value="slim">Slim / Fitted</option>
                </select>
              </div>

              <button
                onClick={handleCalculateFit}
                disabled={calculatingFit}
                className="w-full py-3 bg-black text-white text-xs font-black uppercase tracking-wider rounded hover:bg-neutral-800 transition"
              >
                {calculatingFit ? 'Calculating Fit...' : 'Calculate My Size'}
              </button>

              {fitResult && (
                <div className="mt-4 p-4 bg-neutral-900 text-white rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Recommended Size:</span>
                    <span className="text-lg font-black text-white bg-red-600 px-2 py-0.5 rounded">
                      Size {fitResult.recommendedSize}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mt-2">
                    {fitResult.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIZE CHART MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full p-6 rounded shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h4 className="text-base font-black uppercase text-black font-heading">
                {product.category} Size Chart (Inches)
              </h4>
              <button onClick={() => setShowSizeGuide(false)} className="text-gray-400 hover:text-black font-bold">
                ✕
              </button>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-black font-bold uppercase">
                    <th className="p-2">Size</th>
                    <th className="p-2">Chest / Waist</th>
                    <th className="p-2">Length</th>
                    <th className="p-2">Shoulder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  <tr><td className="p-2 font-bold">S / 28</td><td className="p-2">38" / 28"</td><td className="p-2">28.5"</td><td className="p-2">19"</td></tr>
                  <tr><td className="p-2 font-bold">M / 30</td><td className="p-2">40" / 30"</td><td className="p-2">29.0"</td><td className="p-2">20"</td></tr>
                  <tr><td className="p-2 font-bold">L / 32</td><td className="p-2">42" / 32"</td><td className="p-2">29.5"</td><td className="p-2">21"</td></tr>
                  <tr><td className="p-2 font-bold">XL / 34</td><td className="p-2">44" / 34"</td><td className="p-2">30.0"</td><td className="p-2">22"</td></tr>
                  <tr><td className="p-2 font-bold">XXL / 36</td><td className="p-2">46" / 36"</td><td className="p-2">30.5"</td><td className="p-2">23"</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Add to Cart & Buy Now Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 z-40 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Price</span>
          <span className="text-base font-black text-black">
            ₹{product.selling_price.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product, selectedSize, 1)}
            className={`flex-1 py-3 px-3 text-[11px] font-black uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 transition ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
          </button>
          <button
            disabled={isOutOfStock}
            onClick={() => {
              addToCart(product, selectedSize, 1);
              setIsCheckoutOpen(true);
            }}
            className={`flex-1 py-3 px-3 text-[11px] font-black uppercase tracking-wider rounded-xs transition ${
              isOutOfStock
                ? 'border border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* Global Modals */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <SearchModal />
      <AuthModal />
      <Footer />
    </div>
  );
}


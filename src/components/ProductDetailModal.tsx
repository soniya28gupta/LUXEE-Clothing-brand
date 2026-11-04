'use client';

import React, { useState, useEffect } from 'react';
import { Product, Review } from '@/lib/types';
import { useShop } from '@/context/ShopContext';
import {
  X,
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
  MessageSquare
} from 'lucide-react';

export default function ProductDetailModal() {
  const { selectedProduct, setSelectedProduct, addToCart, isInWishlist, toggleWishlist, setIsCartOpen, showToast } = useShop();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<'offers' | 'specs' | 'wash' | null>('offers');
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIdx(0);
      // Auto-select first in-stock size
      const firstAvailable = selectedProduct.sizes.find(
        s => (selectedProduct.stock?.[s] ?? 1) > 0
      ) || selectedProduct.sizes[0];
      setSelectedSize(firstAvailable || '');
      fetchReviews(selectedProduct.id);
    }
  }, [selectedProduct]);

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newReviewAuthor || !newReviewComment) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          userName: newReviewAuthor,
          rating: newReviewRating,
          comment: newReviewComment,
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

  if (!selectedProduct) return null;

  const inWishlist = isInWishlist(selectedProduct.id);
  const currentImages = selectedProduct.images.length > 0
    ? selectedProduct.images
    : [selectedProduct.preview_image];

  const currentStock = selectedProduct.stock?.[selectedSize] ?? 5;

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeStatus(`Fast Delivery Available! Expected by 2-3 business days. Cash on Delivery is available.`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      showToast('Please select a size first');
      return;
    }
    addToCart(selectedProduct, selectedSize, 1);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const toggleAccordion = (section: 'offers' | 'specs' | 'wash') => {
    setActiveAccordion(prev => prev === section ? null : section);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setSelectedProduct(null)}
      />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 md:p-6">
        <div className="relative w-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden z-10 flex flex-col my-8">
          
          {/* Close Button */}
          <button
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-gray-700 hover:text-black hover:bg-white shadow-md transition"
            aria-label="Close Product View"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Grid: Left Gallery, Right Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            
            {/* Gallery Column (md: 7 cols) */}
            <div className="md:col-span-7 p-4 sm:p-6 bg-neutral-50 flex flex-col-reverse sm:flex-row gap-4">
              {/* Thumbnail Strip */}
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[520px] no-scrollbar">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 border-2 rounded-xs overflow-hidden transition ${
                      activeImageIdx === idx ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Active Image Display */}
              <div className="relative flex-1 aspect-[3/4] bg-neutral-100 rounded-xs overflow-hidden">
                <img
                  src={currentImages[activeImageIdx] || selectedProduct.preview_image}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Wishlist Floating Button */}
                <button
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 text-black shadow-md hover:bg-white transition"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 ${inWishlist ? 'fill-red-600 text-red-600' : 'text-gray-700'}`}
                  />
                </button>

                {/* Image Navigation Dots (Mobile) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:hidden">
                  {currentImages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImageIdx === i ? 'w-5 bg-black' : 'w-1.5 bg-black/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Info Column (md: 5 cols) */}
            <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
              <div>
                {/* Category & Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {selectedProduct.category}
                  </span>
                  {selectedProduct.is_bestseller && (
                    <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-xs">
                      Bestseller
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase font-heading">
                  {selectedProduct.title}
                </h1>

                {/* Rating & Reviews Bar */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-black">
                    <span className="mr-1">{selectedProduct.average_rating || 4.4}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-600 font-medium">
                    {reviews.length || selectedProduct.total_ratings_count || 48} Verified Reviews
                  </span>
                </div>

                {/* Pricing Block */}
                <div className="mt-4 flex items-baseline gap-2.5 border-b border-gray-100 pb-4">
                  <span className="text-2xl font-black text-black">
                    ₹{selectedProduct.selling_price.toLocaleString('en-IN')}
                  </span>
                  {selectedProduct.mrp > selectedProduct.selling_price && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{selectedProduct.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        SAVE {selectedProduct.discount_percentage}%
                      </span>
                    </>
                  )}
                  <span className="text-[11px] text-gray-400 block w-full mt-1">
                    Inclusive of all taxes
                  </span>
                </div>

                {/* Size Selection */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-black uppercase tracking-wider">
                        Select Size
                      </span>
                      {selectedSize && currentStock > 0 && currentStock <= 3 && (
                        <span className="text-[11px] font-bold text-red-600 animate-pulse">
                          Hurry! Only {currentStock} left!
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 underline"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      Size Guide
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedProduct.sizes.map((size) => {
                      const inStock = (selectedProduct.stock?.[size] ?? 1) > 0;
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          disabled={!inStock}
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-11 border text-xs font-bold rounded-xs uppercase transition-all flex items-center justify-center ${
                            !inStock
                              ? 'border-gray-200 text-gray-300 bg-gray-50 line-through cursor-not-allowed'
                              : isSelected
                              ? 'border-black bg-black text-white shadow-md'
                              : 'border-gray-300 text-black hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      if (!selectedSize) {
                        showToast('Please select a size first');
                        return;
                      }
                      addToCart(selectedProduct, selectedSize, 1);
                    }}
                    className="w-full py-4 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xs hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO BAG</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 bg-neutral-100 text-black border border-black text-xs font-black uppercase tracking-widest rounded-xs hover:bg-neutral-200 transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    <span>BUY IT NOW</span>
                  </button>
                  <a
                    href={`/products/${selectedProduct.handle || selectedProduct.id}`}
                    onClick={() => setSelectedProduct(null)}
                    className="w-full py-2.5 bg-white text-gray-700 hover:text-black border border-gray-300 text-[11px] font-bold uppercase tracking-wider rounded-xs hover:border-black transition flex items-center justify-center gap-1.5"
                  >
                    <span>View Dedicated Product Page</span>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </a>
                </div>

                {/* Pincode Delivery Estimator */}
                <div className="mt-6 p-3.5 bg-gray-50 rounded-xs border border-gray-100">
                  <span className="text-xs font-bold text-black uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-black" />
                    Check Delivery & COD
                  </span>
                  <form onSubmit={handleCheckPincode} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="flex-1 text-xs border border-gray-300 px-3 py-2 rounded-xs focus:outline-none focus:border-black bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded-xs hover:bg-neutral-800"
                    >
                      Check
                    </button>
                  </form>
                  {pincodeStatus && (
                    <p className="mt-2 text-xs font-medium text-green-700">
                      {pincodeStatus}
                    </p>
                  )}
                </div>

                {/* Trust Highlights */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-b border-gray-100 py-3 text-[11px] text-gray-600 font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-black" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="w-4 h-4 text-black" />
                    <span>7-Day Returns</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>100% Genuine</span>
                  </div>
                </div>

                {/* Accordions */}
                <div className="mt-4 divide-y divide-gray-100">
                  {/* Offers Accordion */}
                  <div>
                    <button
                      onClick={() => toggleAccordion('offers')}
                      className="w-full py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-red-600" />
                        Available Offers & Discounts
                      </span>
                      {activeAccordion === 'offers' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {activeAccordion === 'offers' && (
                      <div className="pb-3 text-xs space-y-2 text-gray-700">
                        <div className="p-2 border border-dashed border-gray-300 rounded bg-amber-50/50">
                          <p className="font-bold text-black">Use Code: LUXEE10</p>
                          <p className="text-[11px] text-gray-600">Get 10% instant discount on your first order.</p>
                        </div>
                        <div className="p-2 border border-dashed border-gray-300 rounded bg-green-50/50">
                          <p className="font-bold text-black">Use Code: FLAT250</p>
                          <p className="text-[11px] text-gray-600">Flat ₹250 off on orders above ₹1,999.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Specs */}
                  <div>
                    <button
                      onClick={() => toggleAccordion('specs')}
                      className="w-full py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black text-left"
                    >
                      <span>Product Specifications & Fit</span>
                      {activeAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {activeAccordion === 'specs' && (
                      <div className="pb-3 text-xs space-y-1.5 text-gray-600">
                        <p><strong className="text-black">Fit:</strong> {selectedProduct.fit || 'Regular / Streetwear Fit'}</p>
                        <p><strong className="text-black">Model Specs:</strong> {selectedProduct.model_info}</p>
                        <p><strong className="text-black">Occasion:</strong> {selectedProduct.occasion || 'Casual & Urban'}</p>
                        <p><strong className="text-black">Fabric Care:</strong> {selectedProduct.washcare}</p>
                        <p className="pt-1 text-[11px]">{selectedProduct.short_description}</p>
                      </div>
                    )}
                  </div>

                  {/* Reviews Accordion & Submission Form */}
                  <div>
                    <button
                      onClick={() => toggleAccordion('wash')}
                      className="w-full py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Customer Reviews ({reviews.length})
                      </span>
                      {activeAccordion === 'wash' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {activeAccordion === 'wash' && (
                      <div className="pb-4 pt-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-black">Verified Buyer Ratings</span>
                          <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="text-xs font-bold text-red-600 underline"
                          >
                            {showReviewForm ? 'Cancel' : '+ Write a Review'}
                          </button>
                        </div>

                        {/* Review Form */}
                        {showReviewForm && (
                          <form onSubmit={handleReviewSubmit} className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2.5">
                            <input
                              type="text"
                              required
                              placeholder="Your Name (e.g. Rahul S.)"
                              value={newReviewAuthor}
                              onChange={(e) => setNewReviewAuthor(e.target.value)}
                              className="w-full text-xs p-2 border border-gray-300 rounded bg-white"
                            />
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-black">Rating:</span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setNewReviewRating(star)}
                                  className="p-0.5"
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <textarea
                              required
                              rows={2}
                              placeholder="Write your thoughts about fabric, fit, and style..."
                              value={newReviewComment}
                              onChange={(e) => setNewReviewComment(e.target.value)}
                              className="w-full text-xs p-2 border border-gray-300 rounded bg-white"
                            />
                            <button
                              type="submit"
                              disabled={submittingReview}
                              className="w-full py-2 bg-black text-white text-xs font-bold uppercase rounded hover:bg-neutral-800"
                            >
                              {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                          </form>
                        )}

                        {/* Reviews Listing */}
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {reviews.map((rev) => (
                            <div key={rev.id} className="p-2.5 bg-gray-50 rounded border border-gray-100 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-black flex items-center gap-1">
                                  {rev.userName}
                                  {rev.verifiedBuyer && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1 py-0.2 rounded font-semibold">
                                      Verified
                                    </span>
                                  )}
                                </span>
                                <div className="flex items-center text-amber-400">
                                  {[...Array(rev.rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700">{rev.comment}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">{rev.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Size Guide Modal Overlay */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white max-w-md w-full p-6 rounded shadow-2xl relative">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black uppercase tracking-tight text-black font-heading mb-4">
              Size & Measurement Guide
            </h3>
            <p className="text-xs text-gray-500 mb-4">All measurements are in inches. Body fit is relaxed/streetwear.</p>
            <table className="w-full text-xs text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-black font-bold">
                  <th className="p-2 border border-gray-200">Size</th>
                  <th className="p-2 border border-gray-200">Chest</th>
                  <th className="p-2 border border-gray-200">Length</th>
                  <th className="p-2 border border-gray-200">Shoulder</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 font-bold border border-gray-200">S (38)</td>
                  <td className="p-2 border border-gray-200">40"</td>
                  <td className="p-2 border border-gray-200">28"</td>
                  <td className="p-2 border border-gray-200">18"</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border border-gray-200">M (40)</td>
                  <td className="p-2 border border-gray-200">42"</td>
                  <td className="p-2 border border-gray-200">29"</td>
                  <td className="p-2 border border-gray-200">19"</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border border-gray-200">L (42)</td>
                  <td className="p-2 border border-gray-200">44"</td>
                  <td className="p-2 border border-gray-200">30"</td>
                  <td className="p-2 border border-gray-200">20"</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border border-gray-200">XL (44)</td>
                  <td className="p-2 border border-gray-200">46"</td>
                  <td className="p-2 border border-gray-200">31"</td>
                  <td className="p-2 border border-gray-200">21"</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border border-gray-200">XXL (46)</td>
                  <td className="p-2 border border-gray-200">48"</td>
                  <td className="p-2 border border-gray-200">32"</td>
                  <td className="p-2 border border-gray-200">22"</td>
                </tr>
              </tbody>
            </table>
            <button
              onClick={() => setShowSizeGuide(false)}
              className="mt-6 w-full py-2.5 bg-black text-white text-xs font-bold uppercase rounded"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

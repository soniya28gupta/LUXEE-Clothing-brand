'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { X, Trash2, Plus, Minus, Tag, Truck, ShieldCheck, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export default function CartDrawer({ onProceedToCheckout }: CartDrawerProps) {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    freeShippingThreshold,
    freeShippingProgress,
    couponCode,
    discount,
    applyCoupon,
    removeCoupon,
    openAiShopper,
    showToast
  } = useShop();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isCartOpen) return null;

  const shippingCost = (cartSubtotal >= freeShippingThreshold || couponCode === 'FREESHIP') ? 0 : (cart.length > 0 ? 99 : 0);
  const totalAmount = Math.max(0, cartSubtotal - discount + shippingCost);
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setApplying(true);
    const res = await applyCoupon(inputCoupon);
    setCouponMsg({ success: res.success, text: res.message });
    if (res.success) setInputCoupon('');
    setApplying(false);
  };

  const handleProductClick = (handleOrId: string) => {
    setIsCartOpen(false);
    router.push(`/products/${handleOrId}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-black font-heading">
                YOUR SHOPPING BAG ({cart.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Free Shipping Meter */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-red-600" />
                {remainingForFreeShip === 0 || couponCode === 'FREESHIP' ? (
                  <span className="text-green-700">Congratulations! You unlocked FREE Shipping!</span>
                ) : (
                  <span>Add <strong className="text-black">₹{remainingForFreeShip}</strong> more for FREE Express Delivery!</span>
                )}
              </span>
              <span className="text-[11px] text-gray-500">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500 ease-out rounded-full"
                style={{ width: `${couponCode === 'FREESHIP' ? 100 : freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-black uppercase tracking-tight">Your Bag is Empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Explore our latest drops and streetwear essentials to get started.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push('/collections/all');
                  }}
                  className="mt-6 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const img = item.product.preview_image || item.product.images[0] || '';
                return (
                  <div key={`${item.product.id}-${item.size}`} className="py-4 flex gap-3.5">
                    {/* Item Image with Product Link */}
                    <div
                      onClick={() => handleProductClick(item.product.handle || item.product.id)}
                      className="w-20 h-26 bg-[#f7f7f7] rounded-xs overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition"
                    >
                      <img
                        src={img}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => handleProductClick(item.product.handle || item.product.id)}
                            className="text-xs sm:text-sm font-bold text-black line-clamp-2 leading-snug cursor-pointer hover:text-neutral-600 transition"
                          >
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            className="text-gray-400 hover:text-red-600 transition p-0.5"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[11px] font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded-xs">
                            Size: {item.size}
                          </span>
                          {item.product.fit && (
                            <span className="text-[10px] text-gray-500 uppercase">
                              {item.product.fit}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Quantity modifier */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-300 rounded-xs">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 text-gray-700"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 text-gray-700"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-extrabold text-black">
                            ₹{(item.product.selling_price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* AI Complete-the-Look Entry inside Cart */}
            {cart.length > 0 && (
              <div className="py-4">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    openAiShopper(`Complete my look with items that match my cart (${cart.map(i => i.product.title).join(', ')})`);
                  }}
                  className="w-full p-3 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold uppercase rounded-xs flex items-center justify-between transition border border-gray-200"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    Complete My Look with AI
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Footer & Order Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-3">
              {/* Coupon Form */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-xs text-xs text-green-800">
                    <span className="font-bold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Coupon '{couponCode}' Applied (-₹{discount})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. LUXEE10)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                      className="flex-1 text-xs border border-gray-300 px-3 py-2 rounded-xs focus:outline-none focus:border-black uppercase font-bold"
                    />
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded-xs hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {applying ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponMsg && (
                  <p className={`text-[11px] mt-1.5 ${couponMsg.success ? 'text-green-600' : 'text-red-500'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {/* Bill Details */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-black">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon Discount</span>
                    <span className="font-bold">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>
                    {shippingCost === 0 ? (
                      <strong className="text-green-700 uppercase">FREE</strong>
                    ) : (
                      <strong className="text-black">₹{shippingCost}</strong>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-black pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Complete My Look with AI Stylist */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  const firstItemTitle = cart[0].product.title;
                  openAiShopper(`I have "${firstItemTitle}" in my cart. Recommend matching pieces from the LUXEE catalog to complete my full outfit!`);
                }}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black text-[11px] font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 transition border border-gray-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Complete My Look with AI Stylist</span>
              </button>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-4 bg-black text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-xl"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-widest pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>100% Secure Checkout Guaranteed</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

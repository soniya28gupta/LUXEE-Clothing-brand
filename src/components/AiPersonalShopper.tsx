'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { Product } from '@/lib/types';
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  Heart,
  ArrowRight,
  RotateCcw,
  Check,
  Zap,
  Tag
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  products?: Product[];
  reasons?: Record<string, string>;
  quickReplies?: string[];
  timestamp: string;
}

const starterPrompts = [
  "Show me black shirts under ₹2,000",
  "Recommend an oversized streetwear outfit for a party",
  "Find baggy jeans available in size 32",
  "Show formal pleated trousers for office",
  "What's trending in new drops?"
];

export default function AiPersonalShopper() {
  const router = useRouter();
  const {
    isAiShopperOpen,
    setIsAiShopperOpen,
    aiShopperPrompt,
    addToCart,
    isInWishlist,
    toggleWishlist,
    showToast
  } = useShop();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I'm your LUXEE AI Personal Stylist. Tell me about the vibe, occasion, fit, or budget you're shopping for, and I'll match you with authentic pieces from our live catalog.",
      quickReplies: starterPrompts.slice(0, 3),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiShopperPrompt && isAiShopperOpen) {
      handleSendMessage(aiShopperPrompt);
    }
  }, [aiShopperPrompt, isAiShopperOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/shopper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      if (data.success) {
        // Pre-select first in-stock size for returned products
        const newSizes: Record<string, string> = {};
        data.products.forEach((p: Product) => {
          const firstStock = p.sizes.find(s => (p.stock?.[s] ?? 0) > 0) || p.sizes[0];
          newSizes[p.id] = firstStock || '';
        });
        setSelectedSizes(prev => ({ ...prev, ...newSizes }));

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.message || "Here are pieces that fit your vision:",
          products: data.products,
          reasons: data.reasons,
          quickReplies: [
            "Show something cheaper",
            "Only in black",
            "More oversized fits",
            "Show matching accessories"
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const errorMsg: Message = {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: "I'm having a brief issue connecting with the live catalog. Please try a different query or browse our collections directly.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: "Sorry, I couldn't reach the stylist server right now. Feel free to explore our catalog via search.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductCardClick = (product: Product) => {
    setIsAiShopperOpen(false);
    router.push(`/products/${product.handle || product.id}`);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const size = selectedSizes[product.id] || product.sizes[0];
    addToCart(product, size, 1);
  };

  return (
    <>
      {/* Floating Entry Button (Bottom Right) */}
      <button
        onClick={() => setIsAiShopperOpen(true)}
        aria-label="Open AI Personal Shopper"
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 bg-black text-white px-3.5 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center gap-2 sm:gap-2.5 border border-neutral-700 hover:border-neutral-500 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer select-none group"
      >
        {/* Red circular indicator */}
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full bg-red-600 flex-shrink-0" />

        {/* Small white sparkle icon */}
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white flex-shrink-0" />

        {/* Bold white text */}
        <span className="text-[11px] sm:text-xs md:text-[13px] font-black uppercase tracking-wider text-white whitespace-nowrap font-heading">
          AI PERSONAL SHOPPER
        </span>
      </button>

      {/* Shopper Drawer / Modal */}
      {isAiShopperOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAiShopperOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider font-heading">
                    LUXEE AI Personal Shopper
                  </h3>
                  <p className="text-[10px] text-gray-300 font-medium">
                    Live Catalog Recommendations & Fit Analysis
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAiShopperOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-neutral-800 transition"
                aria-label="Close AI Personal Shopper"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-neutral-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-black text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 shadow-xs rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>

                  <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>

                  {/* AI Recommendation Cards Carousel */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 w-full space-y-3">
                      {msg.products.map((prod) => {
                        const inWish = isInWishlist(prod.id);
                        const currentSize = selectedSizes[prod.id] || prod.sizes[0];
                        const stockQty = prod.stock?.[currentSize] ?? 5;
                        const matchReason = msg.reasons?.[prod.id];

                        return (
                          <div
                            key={prod.id}
                            onClick={() => handleProductCardClick(prod)}
                            className="bg-white rounded-sm border border-gray-200 p-3 shadow-xs hover:border-black transition cursor-pointer flex flex-col gap-2.5"
                          >
                            <div className="flex gap-3">
                              {/* Thumbnail */}
                              <div className="w-20 h-26 bg-gray-100 rounded-xs overflow-hidden flex-shrink-0 relative">
                                <img
                                  src={prod.preview_image || prod.images[0]}
                                  alt={prod.title}
                                  className="w-full h-full object-cover"
                                />
                                {prod.discount_percentage && prod.discount_percentage > 0 && (
                                  <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-black px-1 rounded-xs">
                                    {prod.discount_percentage}% OFF
                                  </span>
                                )}
                              </div>

                              {/* Details */}
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-start justify-between gap-1">
                                    <h4 className="text-xs font-bold text-black line-clamp-1">
                                      {prod.title}
                                    </h4>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleWishlist(prod.id);
                                      }}
                                      className="text-gray-400 hover:text-red-600 p-0.5"
                                    >
                                      <Heart className={`w-3.5 h-3.5 ${inWish ? 'fill-red-600 text-red-600' : ''}`} />
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-black text-black">
                                      ₹{prod.selling_price.toLocaleString('en-IN')}
                                    </span>
                                    {prod.mrp > prod.selling_price && (
                                      <span className="text-[10px] text-gray-400 line-through">
                                        ₹{prod.mrp}
                                      </span>
                                    )}
                                    {prod.fit && (
                                      <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">
                                        {prod.fit}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Size Selection Dropdown */}
                                <div className="mt-2 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                                  <span className="text-[10px] font-bold text-gray-500 uppercase">Size:</span>
                                  <select
                                    value={currentSize}
                                    onChange={(e) => setSelectedSizes({ ...selectedSizes, [prod.id]: e.target.value })}
                                    className="text-xs border border-gray-300 rounded px-2 py-0.5 font-bold"
                                  >
                                    {prod.sizes.map(s => {
                                      const inStock = (prod.stock?.[s] ?? 0) > 0;
                                      return (
                                        <option key={s} value={s} disabled={!inStock}>
                                          {s} {!inStock ? '(Out of stock)' : ''}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* AI Stylist Reason Badge */}
                            {matchReason && (
                              <div className="p-2 bg-neutral-50 rounded text-[11px] text-gray-700 border-l-2 border-red-600 italic">
                                "{matchReason}"
                              </div>
                            )}

                            {/* Card Actions */}
                            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                              <button
                                onClick={(e) => handleAddToCart(prod, e)}
                                className="flex-1 py-2 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition flex items-center justify-center gap-1.5"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>Add to Bag</span>
                              </button>
                              <button
                                onClick={() => handleProductCardClick(prod)}
                                className="px-3 py-2 border border-gray-300 text-black text-[10px] font-bold uppercase tracking-wider rounded-xs hover:border-black transition flex items-center gap-1"
                              >
                                <span>View</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Reply Pills */}
                  {msg.quickReplies && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          onClick={() => handleSendMessage(qr)}
                          className="px-2.5 py-1 bg-white border border-gray-300 hover:border-black text-[11px] font-semibold text-gray-800 rounded-full transition shadow-2xs"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-2xl w-fit shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-black animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-black animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-black animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-gray-500 font-medium ml-1">Analyzing catalog...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask for an outfit, budget, occasion, or style..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 text-xs sm:text-sm border border-gray-300 px-3.5 py-2.5 rounded-full focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { Mail, ArrowRight, Share2, Globe, Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { showToast } = useShop();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast('Subscribed! Check your inbox for your 10% discount code.');
    setEmail('');
  };

  return (
    <footer className="bg-black text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Section */}
        <div className="pb-12 border-b border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">
              BE A PART OF THE SQUAD
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-heading mt-1">
              GET 10% OFF YOUR FIRST PURCHASE
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Subscribe for early access to limited edition drops, secret sales & street style guides.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md flex gap-2">
            <input
              type="email"
              required
              placeholder="ENTER YOUR EMAIL..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-700 text-xs px-4 py-3 rounded-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white uppercase"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-wider rounded-xs hover:bg-neutral-200 transition flex items-center gap-1.5 flex-shrink-0"
            >
              <span>JOIN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Links Grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-200 mb-4 font-heading">
              COLLECTIONS
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
              <li><a href="/collections/shirts" className="hover:text-white transition">SHIRTS</a></li>
              <li><a href="/collections/oversized-t-shirts" className="hover:text-white transition">OVERSIZED TEES</a></li>
              <li><a href="/collections/jeans" className="hover:text-white transition">DENIM & JEANS</a></li>
              <li><a href="/collections/trousers" className="hover:text-white transition">TROUSERS & CARGOS</a></li>
              <li><a href="/collections/sweaters" className="hover:text-white transition">SWEATERS & HOODIES</a></li>
              <li><a href="/collections/sale" className="text-red-500 hover:text-red-400 transition font-bold">END OF SEASON SALE</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-200 mb-4 font-heading">
              HELP & SUPPORT
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
              <li><a href="/account" className="hover:text-white transition">Track Your Order</a></li>
              <li><a href="/account" className="hover:text-white transition">Returns & Exchanges</a></li>
              <li><a href="/account" className="hover:text-white transition">Shipping Policy</a></li>
              <li><a href="/account" className="hover:text-white transition">Size Chart Guide</a></li>
              <li><a href="/account" className="hover:text-white transition">FAQs & Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-200 mb-4 font-heading">
              BRAND & ADMIN
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
              <li><a href="/admin" className="text-amber-400 hover:text-amber-300 transition font-bold">Admin Portal Dashboard</a></li>
              <li><a href="/" className="hover:text-white transition">Our Story</a></li>
              <li><a href="/" className="hover:text-white transition">LUXEE Retail Stores</a></li>
              <li><a href="/" className="hover:text-white transition">Careers at LUXEE</a></li>
              <li><a href="/" className="hover:text-white transition">Sustainability</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-200 mb-4 font-heading">
              FOLLOW THE VIBE
            </h4>
            <p className="text-xs text-neutral-400 mb-4">
              Get daily outfit inspiration and tag us to get featured on our feed.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-neutral-800 transition">
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-neutral-800 transition">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-neutral-800 transition">
                <Sparkles className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-heading">LUXEE.</span>
            <span>© {new Date().getFullYear()} LUXEE INDIA. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            <span className="bg-neutral-900 px-2.5 py-1 rounded">UPI</span>
            <span className="bg-neutral-900 px-2.5 py-1 rounded">VISA</span>
            <span className="bg-neutral-900 px-2.5 py-1 rounded">MASTERCARD</span>
            <span className="bg-neutral-900 px-2.5 py-1 rounded">RUPAY</span>
            <span className="bg-neutral-900 px-2.5 py-1 rounded">COD</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

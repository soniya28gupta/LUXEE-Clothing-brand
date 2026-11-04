'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { X, User, Lock, Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, login, showToast } = useShop();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isAuthOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill all required fields');
      return;
    }

    const userData = {
      id: `user-${Date.now()}`,
      name: tab === 'signup' ? name : (email.split('@')[0] || 'Snitch Customer'),
      email,
      phone: phone || '+91 98765 43210',
      address: {
        line1: '402, High Street Towers, Bandra',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050'
      },
      wishlist: []
    };

    login(userData);
    setIsAuthOpen(false);
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'user-demo-1',
      name: 'Aditya Singhania',
      email: 'aditya@example.com',
      phone: '+91 98765 01234',
      address: {
        line1: 'Villa 14, Prestige Golfshire, Nandi Hills Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '562164'
      },
      wishlist: []
    };
    login(demoUser);
    setIsAuthOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsAuthOpen(false)}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white shadow-2xl rounded-sm overflow-hidden z-10 p-6 sm:p-8">
          
          <button
            onClick={() => setIsAuthOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <span className="text-2xl font-black uppercase tracking-tight font-heading">
              LUXEE<span className="text-red-600">.</span>
            </span>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
              {tab === 'login' ? 'Sign In to Your Account' : 'Create Your LUXEE Account'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition ${
                tab === 'login' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition ${
                tab === 'signup' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohan Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-black text-white text-xs font-black uppercase tracking-widest rounded hover:bg-neutral-800 transition flex items-center justify-center gap-2"
            >
              <span>{tab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider rounded transition"
            >
              Quick 1-Click Demo Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

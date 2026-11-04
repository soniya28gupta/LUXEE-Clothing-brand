'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, StoreSettings } from '@/lib/types';

interface ShopContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;

  couponCode: string;
  discount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  isAiShopperOpen: boolean;
  setIsAiShopperOpen: (open: boolean) => void;
  aiShopperPrompt: string;
  openAiShopper: (prompt?: string) => void;

  settings: StoreSettings | null;
  toast: string | null;
  showToast: (message: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAiShopperOpen, setIsAiShopperOpen] = useState(false);
  const [aiShopperPrompt, setAiShopperPrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const freeShippingThreshold = settings?.freeShippingThreshold || 999;

  // Load persisted state from localStorage on client
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('snitch_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('snitch_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedUser = localStorage.getItem('snitch_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }

    // Fetch live store settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('snitch_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('snitch_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, size, quantity }];
    });
    showToast(`Added ${product.title} (${size}) to Bag!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
    showToast('Item removed from Bag');
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscount(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to Wishlist ❤️');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + (item.product.selling_price * item.quantity), 0);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const applyCoupon = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return { success: false, message: 'Please enter a coupon code' };

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(trimmed)}&subtotal=${cartSubtotal}`);
      const data = await res.json();
      if (data.success) {
        setDiscount(data.discount);
        setCouponCode(trimmed);
        showToast(data.message || 'Coupon applied!');
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Invalid coupon code' };
      }
    } catch (err) {
      // Fallback
      if (trimmed === 'LUXEE10') {
        const disc = Math.round(cartSubtotal * 0.1);
        setDiscount(disc);
        setCouponCode('LUXEE10');
        showToast('Coupon LUXEE10 applied! 10% Off');
        return { success: true, message: '10% discount applied!' };
      }
      return { success: false, message: 'Failed to validate coupon' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    showToast('Coupon removed');
  };

  const openAiShopper = (prompt?: string) => {
    if (prompt) setAiShopperPrompt(prompt);
    setIsAiShopperOpen(true);
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('snitch_user', JSON.stringify(userData));
    showToast(`Welcome back, ${userData.name}!`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('snitch_user');
    showToast('Logged out successfully');
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        freeShippingThreshold,
        freeShippingProgress,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        selectedProduct,
        setSelectedProduct,
        isAuthOpen,
        setIsAuthOpen,
        user,
        login,
        logout,
        couponCode,
        discount,
        applyCoupon,
        removeCoupon,
        isAiShopperOpen,
        setIsAiShopperOpen,
        aiShopperPrompt,
        openAiShopper,
        settings,
        toast,
        showToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

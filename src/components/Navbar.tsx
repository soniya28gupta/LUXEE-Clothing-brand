'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { Search, Heart, ShoppingBag, User, Menu, X, Shield } from 'lucide-react';

// Desktop navigation items matching the exact single-row layout in the reference screenshot
const desktopCategories = [
  { name: 'NEW DROPS', path: '/collections/new-drops', badge: 'HOT' },
  { name: 'SHIRTS', path: '/collections/shirts' },
  { name: 'OVERSIZED T-SHIRTS', path: '/collections/oversized-t-shirts' },
  { name: 'JEANS', path: '/collections/jeans' },
  { name: 'TROUSERS', path: '/collections/trousers' },
  { name: 'SWEATERS', path: '/collections/sweaters' },
  { name: 'SALE', path: '/collections/sale', isSale: true },
];

// Full category list including all collections for mobile drawer
const allCategories = [
  { name: 'NEW DROPS', path: '/collections/new-drops', badge: 'HOT' },
  { name: 'SHIRTS', path: '/collections/shirts' },
  { name: 'OVERSIZED T-SHIRTS', path: '/collections/oversized-t-shirts' },
  { name: 'JEANS', path: '/collections/jeans' },
  { name: 'TROUSERS', path: '/collections/trousers' },
  { name: 'SWEATERS', path: '/collections/sweaters' },
  { name: 'JACKETS', path: '/collections/jackets' },
  { name: 'BESTSELLERS', path: '/collections/bestsellers' },
  { name: 'SALE', path: '/collections/sale', isSale: true },
];

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cartCount, wishlist, setIsCartOpen, setIsSearchOpen, user, setIsAuthOpen } = useShop();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCategoryActive = (path: string) => {
    const slug = path.replace('/collections/', '').toLowerCase();

    // 1. Check pathname (e.g. /collections/oversized-t-shirts)
    if (pathname) {
      if (pathname === path || pathname === `/collections/${slug}`) return true;
      if (pathname.endsWith(`/${slug}`)) return true;
      if (slug === 'oversized-t-shirts' && (pathname.includes('/oversized') || pathname.includes('/oversized-tees'))) {
        return true;
      }
    }

    // 2. Check searchParams (e.g. /collections?category=oversized-t-shirts)
    const currentQueryCat = searchParams?.get('category')?.toLowerCase();
    if (currentQueryCat) {
      if (currentQueryCat === slug) return true;
      if (slug === 'oversized-t-shirts' && (currentQueryCat === 'oversized' || currentQueryCat === 'oversized-tees')) {
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 bg-white border-b border-gray-200 ${
      isScrolled ? 'shadow-sm' : ''
    }`}>
      {/* Single-Row Compact Navigation Bar (matching exact design in 2nd reference image) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3 xl:gap-6">
          
          {/* Left: Mobile Menu & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Mobile Menu"
              className="p-1.5 -ml-1.5 text-black hover:text-gray-600 transition lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="group flex items-center gap-1">
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-black uppercase font-heading group-hover:opacity-90 transition">
                LUXEE<span className="text-red-600">.</span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Bar with HOT badge, Categories, and Admin Button */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 2xl:gap-6">
            {desktopCategories.map((cat) => {
              const active = isCategoryActive(cat.path);
              return (
                <Link
                  key={cat.name}
                  href={cat.path}
                  className={`text-[12px] xl:text-[13px] font-bold tracking-wider uppercase transition-colors relative py-1 inline-flex items-center whitespace-nowrap cursor-pointer ${
                    active
                      ? 'text-red-600 font-black'
                      : cat.isSale
                        ? 'text-red-600 hover:text-red-700 font-bold'
                        : 'text-black hover:text-red-600 font-bold'
                  }`}
                >
                  <span>{cat.name}</span>

                  {/* Red HOT badge */}
                  {cat.badge && (
                    <span className="absolute -top-2.5 -right-3.5 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase leading-tight shadow-xs">
                      {cat.badge}
                    </span>
                  )}

                  {/* Active Red Bottom Underline Bar */}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] bg-red-600 rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Admin Portal Button right in the navigation bar as shown in Image 2 */}
            <Link
              href="/admin"
              className="text-[11px] font-bold text-gray-700 hover:text-black tracking-wider border border-gray-300 hover:border-black px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 uppercase ml-0.5 flex-shrink-0"
            >
              <Shield className="w-3.5 h-3.5 text-gray-700" />
              <span>ADMIN</span>
            </Link>
          </nav>

          {/* Right: Action Icons (Search, Wishlist, Account, Cart) */}
          <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search Catalog"
              className="p-2 text-black hover:text-gray-600 transition rounded-full hover:bg-gray-100"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/account?tab=wishlist"
              aria-label="Wishlist"
              className="p-2 text-black hover:text-gray-600 transition rounded-full hover:bg-gray-100 relative"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Account / User */}
            {user ? (
              <Link
                href="/account"
                aria-label="User Account"
                className="p-2 text-black hover:text-gray-600 transition rounded-full hover:bg-gray-100 flex items-center gap-1.5"
              >
                <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center uppercase">
                  {user.name.charAt(0)}
                </div>
              </Link>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                aria-label="Sign In"
                className="p-2 text-black hover:text-gray-600 transition rounded-full hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Shopping Bag / Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Bag"
              className="p-2 text-black hover:text-gray-600 transition rounded-full hover:bg-gray-100 relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <span className="text-2xl font-black tracking-tighter uppercase font-heading">
                  LUXEE<span className="text-red-600">.</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-gray-500 hover:text-black"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Categories Navigation in Drawer */}
              <div className="py-4 px-4 space-y-1.5">
                {allCategories.map((cat) => {
                  const active = isCategoryActive(cat.path);
                  return (
                    <Link
                      key={cat.name}
                      href={cat.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-3 px-3 rounded-lg text-sm font-bold tracking-wider uppercase transition-colors ${
                        active
                          ? 'text-red-600 bg-red-50/90 font-black'
                          : cat.isSale
                            ? 'text-red-600 hover:bg-gray-50 font-black'
                            : 'text-black hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{cat.name}</span>
                        {cat.badge && (
                          <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-3 rounded-lg text-sm font-bold tracking-wider uppercase text-gray-700 hover:bg-gray-50 mt-2 border-t border-gray-100 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-gray-600" />
                  <span>Admin Portal</span>
                </Link>
              </div>
            </div>

            {/* Bottom Account details in Drawer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-black">Logged in as {user.name}</p>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-gray-600 underline"
                  >
                    Go to My Account & Orders
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full bg-black text-white text-xs font-bold py-3 rounded uppercase tracking-wider hover:bg-neutral-800 transition"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 sm:h-18 bg-white" />}>
      <NavbarContent />
    </Suspense>
  );
}

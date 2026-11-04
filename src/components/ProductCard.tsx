'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useShop } from '@/context/ShopContext';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isInWishlist, toggleWishlist, addToCart, setSelectedProduct } = useShop();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedQuickSize, setSelectedQuickSize] = useState<string | null>(null);

  const inWishlist = isInWishlist(product.id);
  const primaryImg = product.preview_image || product.images[0] || '';
  const secondaryImg = product.images[1] || primaryImg;
  const productUrl = `/products/${product.handle || product.id}`;

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, size, 1);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not clicking quick add or wishlist
    router.push(productUrl);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedProduct(product);
  };

  return (
    <div
      className="group relative flex flex-col bg-white cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setSelectedQuickSize(null);
      }}
      onClick={handleCardClick}
    >
      {/* Image Container with 3:4 Aspect Ratio */}
      <div className="relative w-full aspect-[3/4] bg-[#f7f7f7] overflow-hidden rounded-sm">
        {/* Main & Secondary Hover Image */}
        <img
          src={primaryImg}
          alt={product.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
            isHovered && secondaryImg ? 'opacity-0' : 'opacity-100'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80";
          }}
        />
        {secondaryImg && (
          <img
            src={secondaryImg}
            alt={`${product.title} Alternate View`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.is_bestseller && (
            <span className="bg-black text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-sm">
              BESTSELLER
            </span>
          )}
          {product.is_new_drop && !product.is_bestseller && (
            <span className="bg-neutral-800 text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-sm">
              NEW DROP
            </span>
          )}
          {product.discount_percentage && product.discount_percentage > 0 && (
            <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-sm">
              {product.discount_percentage}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label="Toggle Wishlist"
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center transition shadow-sm backdrop-blur-xs"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              inWishlist ? 'fill-red-600 text-red-600' : 'text-gray-700 hover:text-black'
            }`}
          />
        </button>

        {/* Quick View Button (Eye) */}
        <button
          onClick={handleQuickView}
          aria-label="Quick View"
          className="absolute top-12 right-2.5 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center transition shadow-sm opacity-0 group-hover:opacity-100 backdrop-blur-xs"
        >
          <Eye className="w-4 h-4 text-gray-700 hover:text-black" />
        </button>

        {/* Quick Size Selector Drawer on Desktop Hover */}
        <div
          className={`hidden sm:flex absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm p-3 flex-col gap-1.5 transition-all duration-300 z-20 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            <span>Select Size</span>
            <span className="text-[10px] text-gray-500 font-medium">Quick Add</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.sizes.map((size) => {
              const inStock = (product.stock && product.stock[size] !== undefined) ? product.stock[size] > 0 : true;
              return (
                <button
                  key={size}
                  disabled={!inStock}
                  onClick={(e) => handleQuickAdd(size, e)}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-bold border rounded-xs uppercase tracking-tight transition-all ${
                    !inStock
                      ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                      : 'border-gray-300 text-black hover:border-black hover:bg-black hover:text-white'
                  }`}
                  title={inStock ? `Add size ${size} to bag` : 'Out of stock'}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-3 pb-2 flex flex-col flex-1">
        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex items-center text-amber-500">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-gray-800 ml-1">
              {product.average_rating || 4.3}
            </span>
          </div>
          <span className="text-[11px] text-gray-400">
            ({product.total_ratings_count || 32})
          </span>
          {product.fit && (
            <span className="ml-auto text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              {product.fit}
            </span>
          )}
        </div>

        {/* Product Title Link */}
        <a
          href={productUrl}
          onClick={(e) => {
            e.preventDefault();
            router.push(productUrl);
          }}
          className="text-xs sm:text-sm font-semibold text-black line-clamp-1 group-hover:text-neutral-600 transition tracking-tight"
        >
          {product.title}
        </a>

        {/* Pricing Block */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-extrabold text-black">
            ₹{product.selling_price.toLocaleString('en-IN')}
          </span>
          {product.mrp > product.selling_price && (
            <>
              <span className="text-xs text-gray-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-bold text-green-600">
                ({product.discount_percentage}% OFF)
              </span>
            </>
          )}
        </div>

        {/* Mobile Quick Add Button */}
        <div className="mt-2.5 sm:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickView(e);
            }}
            className="w-full py-2 bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Select Size</span>
          </button>
        </div>
      </div>
    </div>
  );
}

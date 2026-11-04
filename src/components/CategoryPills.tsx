'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface CategoryPillItem {
  name: string;
  slug: string;
  path: string;
  image: string;
}

export const categoryPills: CategoryPillItem[] = [
  {
    name: "SHIRTS",
    slug: "shirts",
    path: "/collections/shirts",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/1_d20306aa-e3ca-401a-9f25-5011f97dbabf.jpg?v=1790769997"
  },
  {
    name: "OVERSIZED TEES",
    slug: "oversized-t-shirts",
    path: "/collections/oversized-t-shirts",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/4pl206-01-m_53d27dc0-d10e-4b64-a38b-256e2fdaa.jpg?v=1790592713"
  },
  {
    name: "JEANS",
    slug: "jeans",
    path: "/collections/jeans",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/1_70b3ca3a-d635-405f-bbde-fe1d0540e5a9.jpg?v=1790592713"
  },
  {
    name: "TROUSERS",
    slug: "trousers",
    path: "/collections/trousers",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/4tr0002-01.jpg?v=1791825728"
  },
  {
    name: "SWEATERS",
    slug: "sweaters",
    path: "/collections/sweaters",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/3_5091ea74-cb8e-430d-900a-2fbe76afaba6.jpg?v=1790769997"
  },
  {
    name: "JACKETS",
    slug: "jackets",
    path: "/collections/jackets",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/5_43b49749-97fa-4402-a06f-ddd6eae38ec3.jpg?v=1790769997"
  },
  {
    name: "BESTSELLERS",
    slug: "bestsellers",
    path: "/collections/bestsellers",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/2_8638e1a3-359e-4385-b042-76a28cded629.jpg?v=1790769997"
  }
];

interface CategoryPillsProps {
  activeCategory?: string;
}

export default function CategoryPills({ activeCategory }: CategoryPillsProps) {
  const pathname = usePathname();

  // Determine current active slug from prop or pathname
  const getCurrentActiveSlug = () => {
    if (activeCategory) {
      const clean = activeCategory.toLowerCase().trim();
      if (clean === 'oversized-tees') return 'oversized-t-shirts';
      return clean;
    }
    if (!pathname) return '';
    for (const cat of categoryPills) {
      if (pathname === cat.path || pathname.includes(`/${cat.slug}`)) {
        return cat.slug;
      }
    }
    return '';
  };

  const currentSlug = getCurrentActiveSlug();

  return (
    <section className="py-6 sm:py-8 border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start md:justify-center gap-5 sm:gap-7 md:gap-9 lg:gap-11 overflow-x-auto no-scrollbar py-2 scroll-smooth">
          {categoryPills.map((cat) => {
            const isActive = currentSlug === cat.slug;

            return (
              <Link
                key={cat.name}
                href={cat.path}
                className="flex flex-col items-center flex-shrink-0 group cursor-pointer transition-transform"
              >
                {/* Circular Image Container with Active Black Ring */}
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 rounded-full overflow-hidden p-[2px] transition-all duration-300 ${
                    isActive
                      ? 'border-2 border-black ring-1 ring-black shadow-sm'
                      : 'border-2 border-transparent group-hover:border-black'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className={`w-full h-full object-cover rounded-full transition-transform duration-500 bg-gray-100 ${
                      isActive ? 'scale-105' : 'group-hover:scale-110'
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=200&q=80";
                    }}
                  />
                </div>

                {/* Category Label: Red when active, black on default, red on hover */}
                <span
                  className={`mt-2.5 text-[11px] sm:text-xs tracking-wider uppercase text-center transition-colors ${
                    isActive
                      ? 'font-black text-red-600'
                      : 'font-bold text-black group-hover:text-red-600'
                  }`}
                >
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Globe, CheckCircle } from 'lucide-react';

const ugcPosts = [
  {
    author: "@kabir.malhotra",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    product: "Washed Baggy Jeans",
    link: "/collections/jeans",
    review: "The fit is immaculate. Never buying jeans from anywhere else."
  },
  {
    author: "@rohan_street",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    product: "Seoul Archive Box Sweater",
    link: "/collections/sweaters",
    review: "Super cozy, heavyweight cotton. Looks killer with silver chains."
  },
  {
    author: "@vikram.vibe",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    product: "Double Pocket Shirt",
    link: "/collections/shirts",
    review: "LUXEE shirts have the best collar structure. 10/10 recommendation."
  },
  {
    author: "@aditya_fits",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    product: "Slim Pleated Trousers",
    link: "/collections/trousers",
    review: "Formal yet stylish. Wore it to a party and office back-to-back."
  }
];

export default function UgcReviewWall() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black tracking-widest text-red-600 uppercase">
            #STYLEITLIKELUXEE
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-black font-heading mt-1">
            SEEN ON THE STREETS
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Join over 500,000+ fashion rebels wearing LUXEE daily. Tag @luxee.co.in to get featured.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ugcPosts.map((post, idx) => (
            <div key={idx} className="group relative rounded-sm overflow-hidden bg-gray-100 flex flex-col shadow-sm">
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.product}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute top-3 right-3 text-white">
                  <Globe className="w-5 h-5 opacity-80" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-bold flex items-center gap-1">
                    {post.author}
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                  </p>
                  <p className="text-[11px] text-gray-300 font-medium line-clamp-2 mt-0.5">
                    "{post.review}"
                  </p>
                </div>
              </div>
              <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
                  {post.product}
                </span>
                <Link
                  href={post.link}
                  className="text-[10px] text-red-600 font-black uppercase hover:underline cursor-pointer"
                >
                  Shop Look
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

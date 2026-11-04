'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "THE OVERSIZED REVOLUTION",
    subtitle: "HEAVYWEIGHT 280 GSM COTTON | ENGINEERED STREETWEAR",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1920&q=80",
    ctaText: "EXPLORE OVERSIZED",
    ctaLink: "/collections/oversized-t-shirts",
    tag: "AUTUMN / WINTER '26"
  },
  {
    id: 2,
    title: "SIGNATURE LUXE DENIM",
    subtitle: "BAGGY, STRAIGHT & BOOTCUT FITS CRAFTED FOR THE BOLD",
    image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1920&q=80",
    ctaText: "SHOP JEANS",
    ctaLink: "/collections/jeans",
    tag: "BESTSELLING FITS"
  },
  {
    id: 3,
    title: "HIGH-CONTRAST SHIRTS",
    subtitle: "TEXTURED CORDUROY, RELAXED LINEN & STATEMENT PRINTS",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1920&q=80",
    ctaText: "SHOP SHIRTS",
    ctaLink: "/collections/shirts",
    tag: "DROP 04 / EXCLUSIVE"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);

  return (
    <div className="relative w-full h-[65vh] sm:h-[75vh] lg:h-[82vh] bg-black overflow-hidden group">
      {/* Slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image with Dark Contrast Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-7000 ease-out scale-105"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          </div>

          {/* Slide Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-14 sm:pb-20 z-20">
            <span className="inline-block bg-white text-black text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 py-1 rounded-sm mb-3 self-start">
              {slide.tag}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter max-w-3xl leading-tight font-heading">
              {slide.title}
            </h1>
            <p className="text-gray-300 text-xs sm:text-base font-medium tracking-wide mt-2 max-w-xl">
              {slide.subtitle}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <a
                href={slide.ctaLink}
                className="inline-flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-sm hover:bg-neutral-200 transition-all transform hover:-translate-y-0.5 shadow-xl"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/collections/all"
                className="hidden sm:inline-flex items-center gap-2 bg-transparent text-white border-2 border-white px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-sm hover:bg-white hover:text-black transition-all"
              >
                <span>VIEW ALL DROPS</span>
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 transition-all rounded-full ${
              idx === current ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

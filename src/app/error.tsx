'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-black font-heading">500</h1>
      <p className="mt-4 text-base sm:text-lg font-bold text-gray-800 uppercase tracking-wider">Something went wrong</p>
      <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-md">
        An unexpected error occurred while loading this page.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-black text-black text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-gray-50 transition"
        >
          Home
        </Link>
      </div>
    </div>
  );
}


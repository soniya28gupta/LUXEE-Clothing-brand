import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-black font-heading">404</h1>
      <p className="mt-4 text-base sm:text-lg font-bold text-gray-800 uppercase tracking-wider">Page Not Found</p>
      <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-md">
        The streetwear drop or page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}


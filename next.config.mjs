import './patch-readlink.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ],
  },
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/product/:slug',
        destination: '/products/:slug',
      },
    ];
  },
};

export default nextConfig;

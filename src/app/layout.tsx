import type { Metadata } from 'next';
import './globals.css';
import { ShopProvider } from '@/context/ShopContext';
import Toast from '@/components/Toast';
import AiPersonalShopper from '@/components/AiPersonalShopper';

export const metadata: Metadata = {
  title: 'LUXEE® | Official Clothing Brand | Modern Men’s Fashion & Streetwear',
  description: 'Shop the latest in oversized t-shirts, textured shirts, baggy & straight denim, trousers, and outerwear. 100% Genuine, Made in India.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black min-h-screen">
        <ShopProvider>
          {children}
          <AiPersonalShopper />
          <Toast />
        </ShopProvider>
      </body>
    </html>
  );
}

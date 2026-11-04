 HEAD
# LUXEE-Clothing-brand

# LUXEE — Modern Streetwear & Fast-Fashion E-Commerce Platform

A production-grade, full-stack Next.js e-commerce clothing brand platform reverse-engineered from [Snitch.com](https://www.snitch.com/), rebuilt with modern architecture, luxury streetwear aesthetics, and an end-to-end shopping experience.

🌐 **Live Demo on Vercel**: [https://luxee-clothing-brand.vercel.app](https://luxee-clothing-brand.vercel.app)



## 🚀 Features

- **Brand Design System**: Monochromatic luxury streetwear palette (`#FFFFFF` & `#0A0A0A`), bold typography (`Montserrat` & `Inter`), promotional badges (`BESTSELLER`, `NEW DROP`, `SAVE 35%`), and auto-advancing announcement ticker (`LUXEE10`).
- **Authentic Catalog (50+ Products)**: Shirts, Oversized T-Shirts, Jeans, Trousers, Sweaters, and Jackets with 5-7 high-resolution CDN images per item, accurate Indian Rupee pricing, MRP strikethroughs, discounts, and washcare instructions.
- **Product Listing & Filtering (PLP)**: Multi-faceted filters (Size, Fit, Price Slider, Sort) with 3:4 portrait product cards, desktop hover image flip, and quick-add size drawer.
- **Product Detail View (PDP)**: Multi-angle thumbnail strip with zoom gallery, size selector with scarcity alerts ("Only 2 left in stock"), interactive Size Guide chart, pincode delivery estimator, coupon discounts accordion, and customer review submission.
- **Shopping Bag & Cart Drawer**: Slide-over cart drawer with dynamic Free Shipping Progress Bar (₹999 threshold), quantity stepper, coupon input (`LUXEE10`, `FLAT250`), and bill breakdown.
- **Payment Sandbox Checkout**: Simulated Razorpay / Stripe payment gateway modal supporting mock UPI (`success@razorpay`) and test Cards with order receipt and confetti animation.
- **Admin Management Portal (`/admin`)**: Real-time sales metrics, product catalog management (add, delete, edit prices inline), and customer order fulfillment updates (`Processing` → `Shipped` → `Delivered`).
- **Customer Account (`/account`)**: Order history with live tracking numbers, saved wishlist, and address management.



## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Canvas Confetti
- **State Management**: React Context (`ShopContext`) with `localStorage` persistence
- **Backend Data Layer**: File-backed database (`data_store/db.json` & `src/lib/db.ts`)



## 📦 Getting Started

### 1. Install Dependencies
bash
npm install


### 2. Run the Development Server
bash
npm run dev


Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
bash
npm run build
npm run start




## 📂 Key Pages & Routes

- **Storefront**: `/`
- **Catalog & Categories**: `/collections?category=jeans`, `/collections?category=shirts`, `/collections?category=oversized-t-shirts`
- **Customer Account & Tracking**: `/account`
- **Admin Portal**: `/admin`
- **API Endpoints**: `/api/products`, `/api/orders`, `/api/reviews`, `/api/payment`
 5eee6e6 (Add LUXEE Clothing Brand project)

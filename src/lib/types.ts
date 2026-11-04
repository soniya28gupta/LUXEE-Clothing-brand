export interface Product {
  id: string;
  title: string;
  handle: string;
  category: "Shirts" | "Oversized T-Shirts" | "Jeans" | "Trousers" | "Sweaters" | "Jackets" | "Fragrances" | string;
  subcategory?: string;
  selling_price: number;
  mrp: number;
  discount_percentage?: number;
  preview_image: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: Record<string, number>;
  sku?: string;
  average_rating: number;
  total_ratings_count: number;
  model_info: string;
  washcare: string;
  short_description: string;
  fabric?: string;
  fit?: string;
  occasion?: string;
  is_bestseller?: boolean;
  is_new_drop?: boolean;
  status?: 'active' | 'archived' | 'draft';
  complementary_product_ids?: string[];
  published_at?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  date: string;
  fitFeedback?: "Runs Small" | "True to Size" | "Runs Large";
  status?: 'approved' | 'hidden';
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderTimelineEvent {
  status: string;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: "UPI" | "CARD" | "COD";
  paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded";
  fulfillmentStatus: "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  trackingNumber: string;
  createdAt: string;
  timeline?: OrderTimelineEvent[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'admin' | 'staff' | 'customer';
  address?: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  wishlist: string[];
  totalSpent?: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productTitle: string;
  size: string;
  type: 'return' | 'exchange';
  exchangeSize?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  restocked: boolean;
  refundStatus?: 'Pending' | 'Processed' | 'StoreCredit';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface StoreSettings {
  freeShippingThreshold: number;
  standardShippingCost: number;
  codEnabled: boolean;
  announcementText: string;
  bannerActive: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  featured: boolean;
  sortOrder: number;
}

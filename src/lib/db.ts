import fs from 'fs';
import path from 'path';
import {
  Product,
  Order,
  User,
  Review,
  Coupon,
  ReturnRequest,
  AuditLog,
  StoreSettings,
  CategoryItem
} from './types';
import initialProductsData from '../data/initialProducts.json';

const DATA_DIR = path.join(process.cwd(), 'data_store');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  users: User[];
  reviews: Review[];
  coupons: Coupon[];
  returns: ReturnRequest[];
  auditLogs: AuditLog[];
  settings: StoreSettings;
  categories: CategoryItem[];
}

const defaultCategories: CategoryItem[] = [
  {
    id: "cat-shirts",
    name: "SHIRTS",
    slug: "shirts",
    description: "Crafted with premium cotton, corduroy, and breathable textures.",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/1_d20306aa-e3ca-401a-9f25-5011f97dbabf.jpg?v=1790769997",
    featured: true,
    sortOrder: 1
  },
  {
    id: "cat-oversized-tees",
    name: "OVERSIZED TEES",
    slug: "oversized-t-shirts",
    description: "Heavyweight 280+ GSM combed cotton with statement silhouettes.",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/4pl206-01-m_53d27dc0-d10e-4b64-a38b-256e2fdaa.jpg?v=1790592713",
    featured: true,
    sortOrder: 2
  },
  {
    id: "cat-jeans",
    name: "JEANS",
    slug: "jeans",
    description: "Baggy, straight, bootcut, and carpenter fits washed to perfection.",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/1_70b3ca3a-d635-405f-bbde-fe1d0540e5a9.jpg?v=1790592713",
    featured: true,
    sortOrder: 3
  },
  {
    id: "cat-trousers",
    name: "TROUSERS",
    slug: "trousers",
    description: "Tailored pleats and utilitarian cargos for modern streetwear.",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/4tr0002-01.jpg?v=1791825728",
    featured: true,
    sortOrder: 4
  },
  {
    id: "cat-sweaters",
    name: "SWEATERS",
    slug: "sweaters",
    description: "Seoul archive boxy fits, knitwear, and fleece hoodies.",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/3_5091ea74-cb8e-430d-900a-2fbe76afaba6.jpg?v=1790769997",
    featured: true,
    sortOrder: 5
  },
  {
    id: "cat-jackets",
    name: "JACKETS",
    slug: "jackets",
    description: "Layering essentials engineered for urban transitions.",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/5_43b49749-97fa-4402-a06f-ddd6eae38ec3.jpg?v=1790769997",
    featured: true,
    sortOrder: 6
  },
  {
    id: "cat-bestsellers",
    name: "BESTSELLERS",
    slug: "bestsellers",
    description: "Our most loved streetwear pieces as voted by you.",
    image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/2_8638e1a3-359e-4385-b042-76a28cded629.jpg?v=1790769997",
    featured: true,
    sortOrder: 7
  }
];

const defaultCoupons: Coupon[] = [
  {
    id: "c-1",
    code: "LUXEE10",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 999,
    maxDiscount: 500,
    expiryDate: "2027-12-31",
    usageLimit: 1000,
    timesUsed: 42,
    isActive: true
  },
  {
    id: "c-2",
    code: "FLAT250",
    discountType: "fixed",
    discountValue: 250,
    minOrderAmount: 1999,
    expiryDate: "2027-12-31",
    usageLimit: 500,
    timesUsed: 19,
    isActive: true
  },
  {
    id: "c-3",
    code: "VIP20",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 2999,
    maxDiscount: 1000,
    expiryDate: "2027-12-31",
    usageLimit: 200,
    timesUsed: 12,
    isActive: true
  },
  {
    id: "c-4",
    code: "FREESHIP",
    discountType: "fixed",
    discountValue: 99,
    minOrderAmount: 499,
    expiryDate: "2027-12-31",
    usageLimit: 1000,
    timesUsed: 31,
    isActive: true
  }
];

const defaultSettings: StoreSettings = {
  freeShippingThreshold: 999,
  standardShippingCost: 99,
  codEnabled: true,
  announcementText: "BUY 2 GET 10% OFF | USE CODE 'LUXEE10' • FREE SHIPPING OVER ₹999",
  bannerActive: true
};

const defaultReturns: ReturnRequest[] = [
  {
    id: "ret-101",
    orderId: "LX-98214",
    customerName: "Kunal Singhania",
    customerEmail: "kunal.s@example.com",
    productId: "bf9707d2-993c-46ec-9421-469fb5a604b6",
    productTitle: "Straight Fit Stretch Jeans",
    size: "32",
    type: "exchange",
    exchangeSize: "34",
    reason: "Waist was slightly tight, need size 34",
    status: "Pending",
    restocked: false,
    createdAt: "2026-10-23T11:20:00Z"
  }
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    user: "Admin",
    action: "System Initialization",
    target: "Catalog & DB",
    details: "Loaded initial fashion catalog and verified synchronization",
    timestamp: "2026-10-18T10:00:00Z"
  }
];

function getInitialReviews(products: Product[]): Review[] {
  const reviews: Review[] = [];
  const authors = [
    { name: "Aarav Sharma", city: "Mumbai" },
    { name: "Rohan Verma", city: "Bengaluru" },
    { name: "Kabir Malhotra", city: "Delhi" },
    { name: "Aditya Nair", city: "Pune" },
    { name: "Varun Mehta", city: "Ahmedabad" },
    { name: "Aryan Saxena", city: "Hyderabad" },
  ];

  const comments = [
    "Absolute top-notch quality! The fabric has a premium feel and the fit is perfect.",
    "LUXEE never misses. Wore this to an evening event and got so many compliments.",
    "Heavyweight, sturdy material. Definitely buying more colors soon.",
    "Great silhouette. Slightly oversized just as expected. 10/10 streetwear vibe.",
    "Denim wash looks even better in real life than the photos. Highly recommended!",
    "Comfortable stretch and breathable fabric. Excellent delivery time too."
  ];

  products.slice(0, 15).forEach((prod, i) => {
    const author = authors[i % authors.length];
    reviews.push({
      id: `rev-${i + 1}`,
      productId: prod.id,
      userName: `${author.name} (${author.city})`,
      rating: 5,
      title: "Insane Quality & Fit!",
      comment: comments[i % comments.length],
      verifiedBuyer: true,
      date: "2026-10-18",
      fitFeedback: "True to Size",
      status: "approved"
    });
  });

  return reviews;
}

function getInitialOrders(products: Product[]): Order[] {
  return [
    {
      id: "LX-98214",
      customerName: "Kunal Singhania",
      email: "kunal.s@example.com",
      phone: "+91 98765 43210",
      address: {
        line1: "Flat 402, Skyline Residency, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050"
      },
      items: [
        {
          productId: products[0]?.id || "p-1",
          title: products[0]?.title || "Straight Fit Stretch Jeans",
          size: "32",
          quantity: 1,
          price: products[0]?.selling_price || 2099,
          image: products[0]?.preview_image || ""
        }
      ],
      subtotal: products[0]?.selling_price || 2099,
      discount: 210,
      shipping: 0,
      total: (products[0]?.selling_price || 2099) - 210,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      fulfillmentStatus: "Shipped",
      trackingNumber: "DELHIVERY-7749210",
      createdAt: "2026-10-21T14:32:00Z",
      timeline: [
        { status: "Processing", timestamp: "2026-10-21T14:32:00Z", note: "Order placed and payment verified via UPI" },
        { status: "Packed", timestamp: "2026-10-21T18:00:00Z", note: "Items packed in premium LUXEE box" },
        { status: "Shipped", timestamp: "2026-10-22T10:15:00Z", note: "Handed over to Delhivery Express" }
      ]
    },
    {
      id: "LX-98215",
      customerName: "Arjun Dev",
      email: "arjun.dev@example.com",
      phone: "+91 98111 22334",
      address: {
        line1: "House 12, Indiranagar 100ft Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560038"
      },
      items: [
        {
          productId: products[1]?.id || "p-2",
          title: products[1]?.title || "Slim Fit Stretch Pleated Trousers",
          size: "32",
          quantity: 2,
          price: products[1]?.selling_price || 1599,
          image: products[1]?.preview_image || ""
        }
      ],
      subtotal: (products[1]?.selling_price || 1599) * 2,
      discount: 250,
      shipping: 0,
      total: ((products[1]?.selling_price || 1599) * 2) - 250,
      paymentMethod: "CARD",
      paymentStatus: "Paid",
      fulfillmentStatus: "Processing",
      trackingNumber: "BLUEDART-8839012",
      createdAt: "2026-10-22T09:15:00Z",
      timeline: [
        { status: "Processing", timestamp: "2026-10-22T09:15:00Z", note: "Order confirmed via Card Sandbox" }
      ]
    }
  ];
}

function normalizeProduct(p: Product, index: number, allProducts: Product[]): Product {
  const norm = { ...p };
  if (!norm.handle) {
    norm.handle = norm.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  if (!norm.sku) {
    const catCode = (norm.category || 'LX').substring(0, 3).toUpperCase();
    norm.sku = `LX-${catCode}-${String(index + 1).padStart(3, '0')}`;
  }
  if (!norm.status) {
    norm.status = 'active';
  }
  if (!norm.fabric) {
    if (norm.category?.includes('Jeans')) norm.fabric = '100% Ring-Spun Cotton Denim';
    else if (norm.category?.includes('T-Shirts')) norm.fabric = '280 GSM Heavyweight Combed Cotton';
    else if (norm.category?.includes('Shirts')) norm.fabric = '100% Breathable Structured Cotton';
    else if (norm.category?.includes('Trousers')) norm.fabric = 'Polyester Rayon Spandex Blend';
    else if (norm.category?.includes('Sweaters')) norm.fabric = 'Premium Knit Acrylic-Wool Blend';
    else if (norm.category?.includes('Jackets')) norm.fabric = 'High-Density Utility Twill';
    else norm.fabric = 'Premium Streetwear Blend';
  }
  if (!norm.complementary_product_ids || norm.complementary_product_ids.length === 0) {
    // Dynamically pair products from complementary categories
    const complementaryCategory =
      norm.category === 'Jeans' ? 'Shirts' :
      norm.category === 'Shirts' ? 'Trousers' :
      norm.category === 'Oversized T-Shirts' ? 'Jeans' :
      norm.category === 'Trousers' ? 'Shirts' :
      norm.category === 'Jackets' ? 'Jeans' : 'Oversized T-Shirts';
    
    const matched = allProducts
      .filter(item => item.id !== norm.id && item.category === complementaryCategory)
      .slice(0, 2)
      .map(item => item.id);
    norm.complementary_product_ids = matched;
  }
  return norm;
}

function ensureDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let dbData: Partial<DatabaseSchema> = {};

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbData = JSON.parse(raw);
    } catch (e) {
      console.error("Error reading db.json, repairing:", e);
    }
  }

  let products = (dbData.products && dbData.products.length > 0)
    ? dbData.products
    : (initialProductsData as Product[]);

  // Normalize products to guarantee sku, handle, status, fabric, complementary products
  products = products.map((p, idx) => normalizeProduct(p, idx, products));

  const orders = dbData.orders && dbData.orders.length > 0
    ? dbData.orders
    : getInitialOrders(products);

  const users: User[] = (dbData.users && dbData.users.length > 0)
    ? dbData.users
    : [
        {
          id: "user-admin",
          name: "LUXEE Admin",
          email: "admin@luxee.com",
          phone: "+91 99999 00000",
          role: "admin",
          wishlist: []
        },
        {
          id: "user-staff",
          name: "LUXEE Staff Manager",
          email: "staff@luxee.com",
          phone: "+91 99999 11111",
          role: "staff",
          wishlist: []
        },
        {
          id: "user-default",
          name: "Kunal Singhania",
          email: "customer@luxee.com",
          phone: "+91 98765 43210",
          role: "customer",
          address: {
            line1: "Flat 402, Skyline Residency, Bandra West",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400050"
          },
          wishlist: [products[0]?.id || "", products[1]?.id || ""],
          totalSpent: 4299
        }
      ];

  const reviews = (dbData.reviews && dbData.reviews.length > 0)
    ? dbData.reviews
    : getInitialReviews(products);

  const coupons = (dbData.coupons && dbData.coupons.length > 0)
    ? dbData.coupons
    : defaultCoupons;

  const returns = (dbData.returns && dbData.returns.length > 0)
    ? dbData.returns
    : defaultReturns;

  const auditLogs = (dbData.auditLogs && dbData.auditLogs.length > 0)
    ? dbData.auditLogs
    : defaultAuditLogs;

  const settings = dbData.settings || defaultSettings;
  const categories = (dbData.categories && dbData.categories.length > 0)
    ? dbData.categories
    : defaultCategories;

  const fullDb: DatabaseSchema = {
    products,
    orders,
    users,
    reviews,
    coupons,
    returns,
    auditLogs,
    settings,
    categories
  };

  saveDatabase(fullDb);
  return fullDb;
}

function saveDatabase(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Database Operations
export const db = {
  // PRODUCTS
  getProducts: (includeArchived: boolean = false): Product[] => {
    const list = ensureDatabase().products;
    if (includeArchived) return list;
    return list.filter(p => p.status !== 'archived');
  },

  getProductByIdOrSlug: (idOrSlug: string): Product | undefined => {
    const list = ensureDatabase().products;
    const lower = idOrSlug.toLowerCase();
    return list.find(p => p.id === idOrSlug || p.handle?.toLowerCase() === lower || p.sku?.toLowerCase() === lower);
  },

  getProductById: (id: string): Product | undefined => {
    return ensureDatabase().products.find(p => p.id === id || p.handle === id);
  },

  createProduct: (product: Omit<Product, 'id'>, author: string = 'Admin'): Product => {
    const data = ensureDatabase();
    const newId = `prod-${Date.now()}`;
    const handle = product.handle || product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const sku = product.sku || `LX-${(product.category || 'GEN').slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    
    const newProduct: Product = {
      ...product,
      id: newId,
      handle,
      sku,
      status: product.status || 'active',
      average_rating: product.average_rating || 5.0,
      total_ratings_count: product.total_ratings_count || 1,
      images: product.images && product.images.length > 0 ? product.images : [product.preview_image],
      colors: product.colors || ['Black'],
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      stock: product.stock || { S: 10, M: 15, L: 15, XL: 10 },
      published_at: new Date().toISOString()
    };

    data.products.unshift(newProduct);
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: author,
      action: "Create Product",
      target: newProduct.title,
      details: `Created new product ${newProduct.title} (SKU: ${newProduct.sku})`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(data);
    return newProduct;
  },

  updateProduct: (id: string, updates: Partial<Product>, author: string = 'Admin'): Product | null => {
    const data = ensureDatabase();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    data.products[index] = { ...data.products[index], ...updates };
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: author,
      action: "Update Product",
      target: data.products[index].title,
      details: `Updated fields: ${Object.keys(updates).join(', ')}`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(data);
    return data.products[index];
  },

  deleteProduct: (id: string, author: string = 'Admin'): boolean => {
    const data = ensureDatabase();
    const target = data.products.find(p => p.id === id);
    if (!target) return false;

    data.products = data.products.filter(p => p.id !== id);
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: author,
      action: "Delete Product",
      target: target.title,
      details: `Permanently deleted product ${target.title} (ID: ${id})`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(data);
    return true;
  },

  archiveProduct: (id: string, author: string = 'Admin'): Product | null => {
    return db.updateProduct(id, { status: 'archived' }, author);
  },

  adjustStock: (id: string, size: string, adjustment: number, reason: string, author: string = 'Admin'): Product | null => {
    const data = ensureDatabase();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const currentStock = data.products[index].stock[size] ?? 0;
    const newStock = Math.max(0, currentStock + adjustment);
    data.products[index].stock[size] = newStock;

    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: author,
      action: "Inventory Adjustment",
      target: `${data.products[index].title} (Size ${size})`,
      details: `Adjusted by ${adjustment > 0 ? '+' + adjustment : adjustment}. Reason: ${reason}. New stock: ${newStock}`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(data);
    return data.products[index];
  },

  // ORDERS
  getOrders: (): Order[] => {
    return ensureDatabase().orders;
  },

  getOrderById: (id: string): Order | undefined => {
    return ensureDatabase().orders.find(o => o.id === id);
  },

  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'trackingNumber'>): Order => {
    const data = ensureDatabase();
    const newOrder: Order = {
      ...order,
      id: `LX-${Math.floor(10000 + Math.random() * 90000)}`,
      trackingNumber: `LUXEE-EXP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: "Processing",
          timestamp: new Date().toISOString(),
          note: `Order placed and verified via ${order.paymentMethod}`
        }
      ]
    };
    data.orders.unshift(newOrder);

    // Deduct stock for purchased items
    newOrder.items.forEach(item => {
      const prod = data.products.find(p => p.id === item.productId);
      if (prod && prod.stock && prod.stock[item.size] !== undefined) {
        prod.stock[item.size] = Math.max(0, prod.stock[item.size] - item.quantity);
      }
    });

    // Update customer spending
    const customer = data.users.find(u => u.email.toLowerCase() === newOrder.email.toLowerCase());
    if (customer) {
      customer.totalSpent = (customer.totalSpent || 0) + newOrder.total;
    }

    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: newOrder.customerName,
      action: "Order Created",
      target: newOrder.id,
      details: `New order created for ₹${newOrder.total} (${newOrder.items.length} items)`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(data);
    return newOrder;
  },

  updateOrderStatus: (id: string, status: Order['fulfillmentStatus'], note?: string, author: string = 'Admin'): Order | null => {
    const data = ensureDatabase();
    const order = data.orders.find(o => o.id === id);
    if (!order) return null;

    order.fulfillmentStatus = status;
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order marked as ${status} by ${author}`
    });

    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: author,
      action: "Order Status Update",
      target: order.id,
      details: `Status changed to ${status}`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(data);
    return order;
  },

  // RETURNS & EXCHANGES
  getReturns: (): ReturnRequest[] => {
    return ensureDatabase().returns;
  },

  createReturnRequest: (req: Omit<ReturnRequest, 'id' | 'createdAt' | 'status' | 'restocked'>): ReturnRequest => {
    const data = ensureDatabase();
    const newReq: ReturnRequest = {
      ...req,
      id: `ret-${Date.now().toString().slice(-5)}`,
      status: 'Pending',
      restocked: false,
      createdAt: new Date().toISOString()
    };
    data.returns.unshift(newReq);
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: req.customerName,
      action: "Return/Exchange Requested",
      target: req.orderId,
      details: `${req.type.toUpperCase()} requested for ${req.productTitle} (Size ${req.size}). Reason: ${req.reason}`,
      timestamp: new Date().toISOString()
    });
    saveDatabase(data);
    return newReq;
  },

  updateReturnStatus: (id: string, status: ReturnRequest['status'], restockItem: boolean = false, author: string = 'Admin'): ReturnRequest | null => {
    const data = ensureDatabase();
    const ret = data.returns.find(r => r.id === id);
    if (!ret) return null;

    ret.status = status;
    if (restockItem && !ret.restocked && (status === 'Approved' || status === 'Completed')) {
      const prod = data.products.find(p => p.id === ret.productId);
      if (prod && prod.stock && prod.stock[ret.size] !== undefined) {
        prod.stock[ret.size] += 1;
        ret.restocked = true;
      }
    }

    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: author,
      action: "Return Request Moderated",
      target: ret.id,
      details: `Return status updated to ${status}. Restocked: ${ret.restocked}`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(data);
    return ret;
  },

  // COUPONS
  getCoupons: (): Coupon[] => {
    return ensureDatabase().coupons;
  },

  validateCoupon: (code: string, subtotal: number): { valid: boolean; coupon?: Coupon; discount: number; message: string } => {
    const list = ensureDatabase().coupons;
    const clean = code.trim().toUpperCase();
    const found = list.find(c => c.code.toUpperCase() === clean);

    if (!found) {
      return { valid: false, discount: 0, message: "Invalid promo code" };
    }
    if (!found.isActive) {
      return { valid: false, discount: 0, message: "This coupon is currently inactive" };
    }
    if (new Date(found.expiryDate) < new Date()) {
      return { valid: false, discount: 0, message: "This coupon has expired" };
    }
    if (found.usageLimit && found.timesUsed >= found.usageLimit) {
      return { valid: false, discount: 0, message: "Coupon usage limit reached" };
    }
    if (subtotal < found.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount of ₹${found.minOrderAmount} required for this coupon`
      };
    }

    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = Math.round((subtotal * found.discountValue) / 100);
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    } else {
      discount = Math.min(found.discountValue, subtotal);
    }

    return { valid: true, coupon: found, discount, message: `Coupon ${found.code} applied successfully!` };
  },

  saveCoupon: (coupon: Coupon, author: string = 'Admin'): Coupon => {
    const data = ensureDatabase();
    const idx = data.coupons.findIndex(c => c.id === coupon.id || c.code.toUpperCase() === coupon.code.toUpperCase());
    if (idx >= 0) {
      data.coupons[idx] = coupon;
    } else {
      data.coupons.unshift(coupon);
    }
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: author,
      action: idx >= 0 ? "Update Coupon" : "Create Coupon",
      target: coupon.code,
      details: `${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} OFF. Min ₹${coupon.minOrderAmount}`,
      timestamp: new Date().toISOString()
    });
    saveDatabase(data);
    return coupon;
  },

  deleteCoupon: (id: string, author: string = 'Admin'): boolean => {
    const data = ensureDatabase();
    const target = data.coupons.find(c => c.id === id);
    if (!target) return false;
    data.coupons = data.coupons.filter(c => c.id !== id);
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: author,
      action: "Delete Coupon",
      target: target.code,
      details: `Removed coupon ${target.code}`,
      timestamp: new Date().toISOString()
    });
    saveDatabase(data);
    return true;
  },

  // USERS & CUSTOMERS
  getUsers: (): User[] => {
    return ensureDatabase().users;
  },

  getUserById: (id: string): User | undefined => {
    return ensureDatabase().users.find(u => u.id === id);
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    const data = ensureDatabase();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    data.users[idx] = { ...data.users[idx], ...updates };
    saveDatabase(data);
    return data.users[idx];
  },

  // REVIEWS
  getReviews: (productId?: string): Review[] => {
    const all = ensureDatabase().reviews;
    if (productId) {
      return all.filter(r => r.productId === productId);
    }
    return all;
  },

  addReview: (review: Omit<Review, 'id' | 'date'>): Review => {
    const data = ensureDatabase();
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: review.status || 'approved'
    };
    data.reviews.unshift(newReview);

    // Update product rating summary
    const prodReviews = data.reviews.filter(r => r.productId === review.productId && r.status !== 'hidden');
    const avgRating = prodReviews.reduce((acc, curr) => acc + curr.rating, 0) / (prodReviews.length || 1);
    const prod = data.products.find(p => p.id === review.productId);
    if (prod) {
      prod.average_rating = Math.round(avgRating * 10) / 10;
      prod.total_ratings_count = prodReviews.length;
    }

    saveDatabase(data);
    return newReview;
  },

  updateReviewStatus: (id: string, status: 'approved' | 'hidden'): Review | null => {
    const data = ensureDatabase();
    const rev = data.reviews.find(r => r.id === id);
    if (!rev) return null;
    rev.status = status;
    saveDatabase(data);
    return rev;
  },

  // CATEGORIES
  getCategories: (): CategoryItem[] => {
    return ensureDatabase().categories;
  },

  saveCategory: (cat: CategoryItem, author: string = 'Admin'): CategoryItem => {
    const data = ensureDatabase();
    const idx = data.categories.findIndex(c => c.id === cat.id || c.slug === cat.slug);
    if (idx >= 0) {
      data.categories[idx] = cat;
    } else {
      data.categories.push(cat);
    }
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: author,
      action: idx >= 0 ? "Update Category" : "Create Category",
      target: cat.name,
      details: `Slug: /collections/${cat.slug}`,
      timestamp: new Date().toISOString()
    });
    saveDatabase(data);
    return cat;
  },

  deleteCategory: (id: string, author: string = 'Admin'): boolean => {
    const data = ensureDatabase();
    const target = data.categories.find(c => c.id === id);
    if (!target) return false;
    data.categories = data.categories.filter(c => c.id !== id);
    saveDatabase(data);
    return true;
  },

  // SETTINGS
  getSettings: (): StoreSettings => {
    return ensureDatabase().settings;
  },

  updateSettings: (updates: Partial<StoreSettings>, author: string = 'Admin'): StoreSettings => {
    const data = ensureDatabase();
    data.settings = { ...data.settings, ...updates };
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: author,
      action: "Update Store Settings",
      target: "Store Settings",
      details: `Updated settings: ${Object.keys(updates).join(', ')}`,
      timestamp: new Date().toISOString()
    });
    saveDatabase(data);
    return data.settings;
  },

  // AUDIT LOGS
  getAuditLogs: (): AuditLog[] => {
    return ensureDatabase().auditLogs;
  },

  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>): void => {
    const data = ensureDatabase();
    data.auditLogs.unshift({
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString()
    });
    saveDatabase(data);
  },

  // RESET
  resetToInitial: (): void => {
    const products = initialProductsData as Product[];
    const normProducts = products.map((p, idx) => normalizeProduct(p, idx, products));
    const fullDb: DatabaseSchema = {
      products: normProducts,
      orders: getInitialOrders(normProducts),
      users: [],
      reviews: getInitialReviews(normProducts),
      coupons: defaultCoupons,
      returns: defaultReturns,
      auditLogs: defaultAuditLogs,
      settings: defaultSettings,
      categories: defaultCategories
    };
    saveDatabase(fullDb);
  }
};

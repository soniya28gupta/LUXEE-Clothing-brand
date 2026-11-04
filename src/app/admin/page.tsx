'use client';

import React, { useState, useEffect } from 'react';
import { Product, Order, Coupon, ReturnRequest, AuditLog, StoreSettings, CategoryItem, User } from '@/lib/types';
import {
  ShieldAlert,
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Search,
  ExternalLink,
  ArrowLeft,
  Users,
  Tag,
  MessageSquare,
  Settings,
  FileText,
  Activity,
  Layers,
  Archive,
  Download,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function AdminPage() {
  // Navigation & Role
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'inventory' | 'orders' | 'categories' | 'customers' | 'returns' | 'coupons' | 'reviews' | 'settings' | 'reports' | 'audit'
  >('dashboard');
  const [currentRole, setCurrentRole] = useState<'admin' | 'staff'>('admin');

  // Core Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    freeShippingThreshold: 999,
    standardShippingCost: 99,
    codEnabled: true,
    announcementText: "BUY 2 GET 10% OFF | USE CODE 'LUXEE10'",
    bannerActive: true
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('all');

  // Product Management States
  const [adminSearch, setAdminSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Shirts',
    selling_price: 1499,
    mrp: 1999,
    preview_image: '',
    fit: 'Relaxed Fit',
    fabric: '100% Combed Cotton',
    sku: '',
    short_description: ''
  });

  // Stock Adjustment Modal
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [adjustSize, setAdjustSize] = useState('M');
  const [adjustAmount, setAdjustAmount] = useState(5);
  const [adjustReason, setAdjustReason] = useState('Restock shipment');

  // Order Detail Modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Coupon Form Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 999,
    expiryDate: '2027-12-31',
    usageLimit: 500,
    isActive: true
  });

  // Category Form Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    featured: true
  });

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes, cRes, catRes, retRes, coupRes, logRes, setRes] = await Promise.all([
        fetch('/api/products?includeArchived=true'),
        fetch('/api/orders'),
        fetch('/api/customers'),
        fetch('/api/categories'),
        fetch('/api/returns'),
        fetch('/api/coupons'),
        fetch('/api/audit-logs'),
        fetch('/api/settings')
      ]);

      const [pData, oData, cData, catData, retData, coupData, logData, setData] = await Promise.all([
        pRes.json(),
        oRes.json(),
        cRes.json(),
        catRes.json(),
        retRes.json(),
        coupRes.json(),
        logRes.json(),
        setRes.json()
      ]);

      if (pData.success) setProducts(pData.products);
      if (oData.success) setOrders(oData.orders);
      if (cData.success) setCustomers(cData.customers);
      if (catData.success) setCategories(catData.categories);
      if (retData.success) setReturns(retData.returns);
      if (coupData.success) setCoupons(coupData.coupons);
      if (logData.success) setAuditLogs(logData.logs);
      if (setData.success) setStoreSettings(setData.settings);
    } catch (e) {
      console.error(e);
      showToast('Error loading admin records');
    } finally {
      setLoading(false);
    }
  };

  // PRODUCT ACTIONS
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await fetch(`/api/products?id=${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-name': currentRole },
          body: JSON.stringify(productForm)
        });
        const data = await res.json();
        if (data.success) {
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p));
          showToast(`Updated "${data.product.title}"`);
          setEditingProduct(null);
        }
      } else {
        const payload = {
          ...productForm,
          mrp: Number(productForm.mrp),
          selling_price: Number(productForm.selling_price),
          preview_image: productForm.preview_image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
          images: [productForm.preview_image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'],
          sizes: ['S', 'M', 'L', 'XL'],
          stock: { S: 10, M: 15, L: 15, XL: 10 }
        };
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-name': currentRole },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setProducts(prev => [data.product, ...prev]);
          showToast(`Created product "${data.product.title}"`);
          setShowAddModal(false);
        }
      }
    } catch (e) {
      showToast('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (currentRole === 'staff') {
      alert('Permission Denied: Staff role cannot delete catalog products.');
      return;
    }
    if (!confirm('Permanently delete this product?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-user-name': currentRole }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast('Product deleted from catalog');
      }
    } catch (e) {
      showToast('Delete operation failed');
    }
  };

  const handleToggleArchive = async (id: string, currentStatus?: string) => {
    try {
      const newStatus = currentStatus === 'archived' ? 'active' : 'archived';
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-name': currentRole },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === id ? data.product : p));
        showToast(`Product ${newStatus === 'archived' ? 'Archived' : 'Activated'}`);
      }
    } catch (e) {
      showToast('Archive action failed');
    }
  };

  // INVENTORY ADJUSTMENT
  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct) return;
    try {
      const res = await fetch(`/api/products?id=${stockModalProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-name': currentRole },
        body: JSON.stringify({
          action: 'adjust_stock',
          size: adjustSize,
          adjustment: Number(adjustAmount),
          reason: adjustReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === stockModalProduct.id ? data.product : p));
        showToast(`Adjusted ${stockModalProduct.title} (Size ${adjustSize})`);
        setStockModalProduct(null);
      }
    } catch (e) {
      showToast('Stock adjustment failed');
    }
  };

  // ORDER ACTIONS
  const handleUpdateOrderStatus = async (orderId: string, status: Order['fulfillmentStatus']) => {
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-name': currentRole },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        showToast(`Order #${orderId} marked as ${status}`);
        if (viewingOrder?.id === orderId) setViewingOrder(data.order);
      }
    } catch (e) {
      showToast('Status update failed');
    }
  };

  const handleProcessRefund = async (orderId: string) => {
    if (!confirm('Process demo refund for this order? Items will be restocked.')) return;
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-name': currentRole },
        body: JSON.stringify({ action: 'process_refund' })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        showToast(`Refund processed for #${orderId}`);
        if (viewingOrder?.id === orderId) setViewingOrder(data.order);
        // Refresh products to show updated stock
        fetchAdminData();
      }
    } catch (e) {
      showToast('Refund failed');
    }
  };

  // RETURN ACTIONS
  const handleModerateReturn = async (id: string, status: ReturnRequest['status'], restock: boolean) => {
    try {
      const res = await fetch(`/api/returns?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-name': currentRole },
        body: JSON.stringify({ status, restockItem: restock })
      });
      const data = await res.json();
      if (data.success) {
        setReturns(prev => prev.map(r => r.id === id ? data.returnRequest : r));
        showToast(`Return request ${status} (Restocked: ${restock ? 'Yes' : 'No'})`);
        fetchAdminData();
      }
    } catch (e) {
      showToast('Return moderation failed');
    }
  };

  // COUPON ACTIONS
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-name': currentRole },
        body: JSON.stringify(couponForm)
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(prev => {
          const idx = prev.findIndex(c => c.id === data.coupon.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = data.coupon;
            return copy;
          }
          return [data.coupon, ...prev];
        });
        showToast(`Coupon ${data.coupon.code} saved`);
        setShowCouponModal(false);
      }
    } catch (e) {
      showToast('Failed to save coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon code?')) return;
    try {
      const res = await fetch(`/api/coupons?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-user-name': currentRole }
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
        showToast('Coupon removed');
      }
    } catch (e) {
      showToast('Delete coupon failed');
    }
  };

  // CATEGORY ACTIONS
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-name': currentRole },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => {
          const idx = prev.findIndex(c => c.id === data.category.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = data.category;
            return copy;
          }
          return [...prev, data.category];
        });
        showToast(`Category ${data.category.name} saved`);
        setShowCategoryModal(false);
      }
    } catch (e) {
      showToast('Failed to save category');
    }
  };

  // SETTINGS SAVE
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'staff') {
      alert('Permission Denied: Staff cannot alter store shipping & payment credentials.');
      return;
    }
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-name': currentRole },
        body: JSON.stringify(storeSettings)
      });
      const data = await res.json();
      if (data.success) {
        setStoreSettings(data.settings);
        showToast('Store settings updated successfully');
      }
    } catch (e) {
      showToast('Save settings failed');
    }
  };

  // CSV EXPORT
  const exportCsv = (filename: string, rows: object[]) => {
    if (!rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
          cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}.csv`);
  };

  // METRICS COMPUTATION FROM ACTUAL DATABASE
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter(o => o.fulfillmentStatus === 'Processing').length;
  const lowStockProducts = products.filter(p => {
    if (!p.stock) return false;
    return Object.values(p.stock).some(qty => qty <= 3);
  });
  const avgOrderVal = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Filtered lists
  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (adminSearch && !p.title.toLowerCase().includes(adminSearch.toLowerCase()) && !p.sku?.toLowerCase().includes(adminSearch.toLowerCase())) return false;
    return true;
  });

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'All' && o.fulfillmentStatus !== orderStatusFilter) return false;
    if (orderSearch && !o.id.toLowerCase().includes(orderSearch.toLowerCase()) && !o.customerName.toLowerCase().includes(orderSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans flex flex-col">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-red-600 text-white px-4 py-2.5 rounded shadow-xl text-xs font-black uppercase tracking-wider animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Top Header */}
      <header className="bg-black border-b border-neutral-800 px-4 sm:px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-white flex items-center gap-1 text-xs uppercase font-bold transition">
            <ArrowLeft className="w-4 h-4" /> Storefront
          </a>
          <span className="text-neutral-700">|</span>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h1 className="text-sm sm:text-base font-black uppercase tracking-wider font-heading">
              LUXEE ADMIN PORTAL
            </h1>
          </div>
        </div>

        {/* Role Toggle Switch & Quick Add */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-neutral-800 rounded p-1 border border-neutral-700 text-xs">
            <span className="text-neutral-400 px-2 font-medium">Role:</span>
            <button
              onClick={() => setCurrentRole('admin')}
              className={`px-2.5 py-1 rounded font-black uppercase tracking-wider transition ${
                currentRole === 'admin' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setCurrentRole('staff')}
              className={`px-2.5 py-1 rounded font-black uppercase tracking-wider transition ${
                currentRole === 'staff' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Staff
            </button>
          </div>

          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                title: '',
                category: 'Shirts',
                selling_price: 1499,
                mrp: 1999,
                preview_image: '',
                fit: 'Relaxed Fit',
                fabric: '100% Combed Cotton',
                sku: '',
                short_description: ''
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Header Bar (Scrollable Tabs) */}
      <nav className="bg-neutral-950 border-b border-neutral-800 px-4 sm:px-6 overflow-x-auto no-scrollbar py-2.5 flex items-center gap-2 sm:gap-4 text-xs font-bold uppercase tracking-wider">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'inventory', label: `Products (${products.length})`, icon: Package },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
          { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { id: 'returns', label: `Returns (${returns.length})`, icon: RotateCcw },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'reports', label: 'Reports & Export', icon: FileText },
          { id: 'audit', label: 'Audit Log', icon: Activity },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded whitespace-nowrap transition ${
                isActive
                  ? 'bg-neutral-800 text-red-500 border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* MODULE 1: DASHBOARD METRICS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-800 border border-neutral-700 p-5 rounded">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase mb-2">
                  <span>Gross Revenue</span>
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-black text-white font-mono">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-green-400 font-semibold">100% Verified DB Transactions</span>
              </div>

              <div className="bg-neutral-800 border border-neutral-700 p-5 rounded">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase mb-2">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-black text-white font-mono">
                  {orders.length}
                </p>
                <span className="text-[11px] text-amber-400 font-semibold">{pendingOrdersCount} pending fulfillment</span>
              </div>

              <div className="bg-neutral-800 border border-neutral-700 p-5 rounded">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase mb-2">
                  <span>Low Stock Alert</span>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-2xl font-black text-white font-mono">
                  {lowStockProducts.length} Products
                </p>
                <span className="text-[11px] text-red-400 font-semibold">≤ 3 items in variant stock</span>
              </div>

              <div className="bg-neutral-800 border border-neutral-700 p-5 rounded">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase mb-2">
                  <span>Average Order Value</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-white font-mono">
                  ₹{avgOrderVal.toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-purple-400 font-semibold">Above ₹999 free shipping</span>
              </div>
            </div>

            {/* Recent Orders & Low Stock Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-neutral-800 border border-neutral-700 rounded p-5">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-700 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" /> Recent Store Orders
                  </h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-red-500 font-bold hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-neutral-900 rounded border border-neutral-700/60 text-xs">
                      <div>
                        <span className="font-mono font-bold text-white">#{o.id}</span>
                        <p className="text-neutral-400">{o.customerName} • {o.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">₹{o.total.toLocaleString('en-IN')}</span>
                        <p className={`text-[10px] font-bold uppercase ${
                          o.fulfillmentStatus === 'Delivered' ? 'text-green-400' : 'text-amber-400'
                        }`}>
                          {o.fulfillmentStatus}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Watchlist */}
              <div className="bg-neutral-800 border border-neutral-700 rounded p-5">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-700 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> Low Stock Inventory Watchlist
                  </h3>
                  <button onClick={() => setActiveTab('inventory')} className="text-xs text-red-500 font-bold hover:underline">
                    Manage Stock
                  </button>
                </div>
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-900 rounded border border-neutral-700/60 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={p.preview_image} alt={p.title} className="w-10 h-12 object-cover rounded bg-neutral-800" />
                        <div>
                          <span className="font-bold text-white line-clamp-1">{p.title}</span>
                          <p className="text-neutral-400">{p.category} • SKU: {p.sku}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setStockModalProduct(p);
                          setAdjustSize(p.sizes[0] || 'M');
                        }}
                        className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/40 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition"
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: PRODUCT & INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-800 p-4 rounded border border-neutral-700">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by Title, SKU, or Category..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs rounded px-3 py-2 font-bold focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Shirts">Shirts</option>
                  <option value="Oversized T-Shirts">Oversized T-Shirts</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Trousers">Trousers</option>
                  <option value="Sweaters">Sweaters</option>
                  <option value="Jackets">Jackets</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-neutral-800 border border-neutral-700 rounded overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-900 text-neutral-400 uppercase font-black tracking-wider border-b border-neutral-700">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category & SKU</th>
                    <th className="p-3.5">Price / MRP</th>
                    <th className="p-3.5">Stock by Variant</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {filteredProducts.map((p) => {
                    const isArchived = p.status === 'archived';
                    return (
                      <tr key={p.id} className="hover:bg-neutral-700/30 transition">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={p.preview_image}
                            alt={p.title}
                            className="w-12 h-16 object-cover rounded bg-neutral-900 flex-shrink-0"
                          />
                          <div>
                            <a
                              href={`/products/${p.handle || p.id}`}
                              target="_blank"
                              className="font-bold text-white hover:text-red-400 transition flex items-center gap-1"
                            >
                              <span>{p.title}</span>
                              <ExternalLink className="w-3 h-3 text-neutral-500" />
                            </a>
                            <span className="text-[10px] text-neutral-400 font-mono">ID: {p.id.slice(0, 12)}...</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-white block">{p.category}</span>
                          <span className="font-mono text-[10px] text-neutral-400">{p.sku || 'N/A'}</span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-mono font-bold text-white block">₹{p.selling_price}</span>
                          <span className="text-neutral-500 line-through text-[10px]">₹{p.mrp}</span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.sizes?.map(sz => {
                              const qty = p.stock?.[sz] ?? 0;
                              return (
                                <span
                                  key={sz}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                    qty === 0
                                      ? 'bg-red-900/50 text-red-300'
                                      : qty <= 3
                                      ? 'bg-amber-900/50 text-amber-300'
                                      : 'bg-neutral-700 text-neutral-300'
                                  }`}
                                >
                                  {sz}:{qty}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isArchived
                              ? 'bg-neutral-700 text-neutral-400'
                              : 'bg-green-900/60 text-green-300'
                          }`}>
                            {isArchived ? 'Archived' : 'Active'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Restock Button */}
                            <button
                              onClick={() => {
                                setStockModalProduct(p);
                                setAdjustSize(p.sizes[0] || 'M');
                              }}
                              title="Adjust Stock"
                              className="p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  title: p.title,
                                  category: p.category,
                                  selling_price: p.selling_price,
                                  mrp: p.mrp,
                                  preview_image: p.preview_image,
                                  fit: p.fit || 'Relaxed Fit',
                                  fabric: p.fabric || '100% Cotton',
                                  sku: p.sku || '',
                                  short_description: p.short_description
                                });
                                setShowAddModal(true);
                              }}
                              title="Edit Product"
                              className="p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Archive Button */}
                            <button
                              onClick={() => handleToggleArchive(p.id, p.status)}
                              title={isArchived ? "Unarchive" : "Archive"}
                              className="p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button (Restricted for staff) */}
                            {currentRole === 'admin' && (
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                title="Delete Product"
                                className="p-1.5 bg-red-900/40 hover:bg-red-800 rounded text-red-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Orders Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-800 p-4 rounded border border-neutral-700">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by Order ID or Customer Name..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs rounded px-3 py-2 font-bold focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="bg-neutral-800 border border-neutral-700 rounded overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-900 text-neutral-400 uppercase font-black tracking-wider border-b border-neutral-700">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Total & Payment</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Fulfillment Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-700/30 transition">
                      <td className="p-3.5 font-mono font-bold text-white">
                        <button
                          onClick={() => setViewingOrder(o)}
                          className="hover:text-red-400 underline font-bold"
                        >
                          #{o.id}
                        </button>
                        <span className="text-[10px] text-neutral-500 block">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-white block">{o.customerName}</span>
                        <span className="text-neutral-400 text-[10px]">{o.email}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium">{o.items.length} item(s)</span>
                        <p className="text-[10px] text-neutral-400 line-clamp-1">
                          {o.items.map(it => `${it.title} (${it.size})`).join(', ')}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono font-bold text-white block">₹{o.total.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-neutral-400 uppercase">{o.paymentMethod} • {o.paymentStatus}</span>
                      </td>

                      <td className="p-3.5">
                        <select
                          value={o.fulfillmentStatus}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                          className="bg-neutral-900 border border-neutral-700 text-xs rounded px-2.5 py-1 font-bold text-white focus:outline-none"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingOrder(o)}
                            className="px-2.5 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-xs text-white"
                          >
                            Details
                          </button>
                          {o.paymentStatus === 'Paid' && (
                            <button
                              onClick={() => handleProcessRefund(o.id)}
                              className="px-2.5 py-1 bg-red-900/50 hover:bg-red-800 text-red-200 rounded text-[11px]"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 4: CATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Storefront Collections & Categories</h2>
              <button
                onClick={() => {
                  setCategoryForm({ name: '', slug: '', description: '', image: '', featured: true });
                  setShowCategoryModal(true);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 rounded text-xs font-bold uppercase flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-neutral-800 border border-neutral-700 rounded p-4 flex gap-3">
                  <img src={cat.image} alt={cat.name} className="w-16 h-16 object-cover rounded bg-neutral-900 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm uppercase">{cat.name}</h3>
                    <p className="text-[11px] text-neutral-400 font-mono">/collections/{cat.slug}</p>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{cat.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href={`/collections/${cat.slug}`}
                        target="_blank"
                        className="text-[10px] text-red-400 hover:underline flex items-center gap-1"
                      >
                        Visit Category <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 5: CUSTOMER MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-neutral-800 border border-neutral-700 rounded overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-900 text-neutral-400 uppercase font-black tracking-wider border-b border-neutral-700">
                  <tr>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">Shipping Address</th>
                    <th className="p-3.5">Total Orders</th>
                    <th className="p-3.5">Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-700/30 transition">
                      <td className="p-3.5 font-bold text-white">
                        {c.name}
                        <span className="text-[10px] text-neutral-400 block font-normal capitalize">Role: {c.role || 'Customer'}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="block text-white">{c.email}</span>
                        <span className="text-neutral-400 text-[11px]">{c.phone || 'N/A'}</span>
                      </td>
                      <td className="p-3.5 text-neutral-300">
                        {c.address ? `${c.address.line1}, ${c.address.city}` : 'No address saved'}
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        {c.wishlist ? `${c.wishlist.length} item(s) in wishlist` : '-'}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-green-400">
                        ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 6: RETURNS & EXCHANGES */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div className="bg-neutral-800 border border-neutral-700 rounded overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-900 text-neutral-400 uppercase font-black tracking-wider border-b border-neutral-700">
                  <tr>
                    <th className="p-3.5">Request ID</th>
                    <th className="p-3.5">Customer & Order</th>
                    <th className="p-3.5">Item & Exchange Info</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Decisions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {returns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-neutral-700/30 transition">
                      <td className="p-3.5 font-mono font-bold text-white">#{ret.id}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{ret.customerName}</span>
                        <span className="font-mono text-[10px] text-neutral-400">Order #{ret.orderId}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{ret.productTitle} (Size: {ret.size})</span>
                        <span className="text-red-400 text-[10px] uppercase font-bold">
                          {ret.type === 'exchange' ? `Exchange for size ${ret.exchangeSize}` : 'Full Refund'}
                        </span>
                      </td>
                      <td className="p-3.5 text-neutral-300">{ret.reason}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          ret.status === 'Approved' || ret.status === 'Completed'
                            ? 'bg-green-900/60 text-green-300'
                            : ret.status === 'Rejected'
                            ? 'bg-red-900/60 text-red-300'
                            : 'bg-amber-900/60 text-amber-300'
                        }`}>
                          {ret.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {ret.status === 'Pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleModerateReturn(ret.id, 'Approved', true)}
                              className="px-2.5 py-1 bg-green-700 hover:bg-green-600 rounded text-xs font-bold text-white"
                            >
                              Approve & Restock
                            </button>
                            <button
                              onClick={() => handleModerateReturn(ret.id, 'Rejected', false)}
                              className="px-2.5 py-1 bg-red-800 hover:bg-red-700 rounded text-xs font-bold text-white"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 7: COUPONS & PROMOTIONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Active Promo Codes & Rules</h2>
              <button
                onClick={() => {
                  setCouponForm({
                    code: '',
                    discountType: 'percentage',
                    discountValue: 10,
                    minOrderAmount: 999,
                    expiryDate: '2027-12-31',
                    usageLimit: 500,
                    isActive: true
                  });
                  setShowCouponModal(true);
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 rounded text-xs font-bold uppercase flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div key={c.id} className="bg-neutral-800 border border-neutral-700 rounded p-5 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-base font-black text-white bg-neutral-900 px-3 py-1 rounded border border-neutral-700">
                      {c.code}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      c.isActive ? 'bg-green-900/60 text-green-300' : 'bg-neutral-700 text-neutral-400'
                    }`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-red-400 mt-2">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">Min Order: ₹{c.minOrderAmount}</p>
                  <p className="text-[10px] text-neutral-500 mt-2">Used {c.timesUsed} of {c.usageLimit} times • Expires {c.expiryDate}</p>

                  <div className="mt-4 pt-3 border-t border-neutral-700 flex justify-end">
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Delete Coupon
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 8: SETTINGS & CONTENT */}
        {activeTab === 'settings' && (
          <div className="bg-neutral-800 border border-neutral-700 rounded p-6 max-w-2xl space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-white border-b border-neutral-700 pb-3">
              Store Shipping, Payments & Announcement Settings
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 font-bold uppercase block mb-1">
                  Announcement Bar Marquee Text
                </label>
                <input
                  type="text"
                  value={storeSettings.announcementText}
                  onChange={(e) => setStoreSettings({ ...storeSettings, announcementText: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-400 font-bold uppercase block mb-1">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={storeSettings.freeShippingThreshold}
                    onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-bold uppercase block mb-1">
                    Standard Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={storeSettings.standardShippingCost}
                    onChange={(e) => setStoreSettings({ ...storeSettings, standardShippingCost: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-white font-bold">
                  <input
                    type="checkbox"
                    checked={storeSettings.codEnabled}
                    onChange={(e) => setStoreSettings({ ...storeSettings, codEnabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Enable Cash on Delivery (COD) Checkout Option</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-700 flex justify-end">
                <button
                  type="submit"
                  disabled={currentRole === 'staff'}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-black uppercase rounded transition"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODULE 9: REPORTS & CSV EXPORT */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-neutral-800 border border-neutral-700 p-6 rounded space-y-3">
                <h3 className="font-bold text-white text-sm uppercase">Export Customer Orders CSV</h3>
                <p className="text-xs text-neutral-400">Download entire orders dataset with items, addresses, and fulfillment tracking.</p>
                <button
                  onClick={() => exportCsv('luxee-orders', orders)}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-black border border-neutral-700 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 text-white"
                >
                  <Download className="w-4 h-4" /> Download Orders CSV
                </button>
              </div>

              <div className="bg-neutral-800 border border-neutral-700 p-6 rounded space-y-3">
                <h3 className="font-bold text-white text-sm uppercase">Export Customers Directory</h3>
                <p className="text-xs text-neutral-400">Download customer contact info, spend totals, and account statistics.</p>
                <button
                  onClick={() => exportCsv('luxee-customers', customers)}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-black border border-neutral-700 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 text-white"
                >
                  <Download className="w-4 h-4" /> Download Customers CSV
                </button>
              </div>

              <div className="bg-neutral-800 border border-neutral-700 p-6 rounded space-y-3">
                <h3 className="font-bold text-white text-sm uppercase">Export Product Inventory CSV</h3>
                <p className="text-xs text-neutral-400">Export product SKUs, prices, categories, and variant stock levels.</p>
                <button
                  onClick={() => exportCsv('luxee-products', products)}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-black border border-neutral-700 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 text-white"
                >
                  <Download className="w-4 h-4" /> Download Catalog CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 10: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="bg-neutral-800 border border-neutral-700 rounded overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900 text-neutral-400 uppercase font-black tracking-wider border-b border-neutral-700">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Target</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-700/30 transition">
                    <td className="p-3.5 font-mono text-neutral-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold text-white">{log.user}</td>
                    <td className="p-3.5 text-red-400 font-bold uppercase">{log.action}</td>
                    <td className="p-3.5 text-neutral-200">{log.target}</td>
                    <td className="p-3.5 text-neutral-400">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-800 border border-neutral-700 max-w-xl w-full p-6 rounded shadow-2xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
              <h3 className="text-sm font-black uppercase text-white font-heading">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-bold"
                  placeholder="e.g. Vintage Wash Baggy Denim"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-400 uppercase block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-bold"
                  >
                    <option value="Shirts">Shirts</option>
                    <option value="Oversized T-Shirts">Oversized T-Shirts</option>
                    <option value="Jeans">Jeans</option>
                    <option value="Trousers">Trousers</option>
                    <option value="Sweaters">Sweaters</option>
                    <option value="Jackets">Jackets</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-400 uppercase block mb-1">SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-mono"
                    placeholder="e.g. LX-JEA-099"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-400 uppercase block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.selling_price}
                    onChange={(e) => setProductForm({ ...productForm, selling_price: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-400 uppercase block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-400 uppercase block mb-1">Fit Type</label>
                  <input
                    type="text"
                    value={productForm.fit}
                    onChange={(e) => setProductForm({ ...productForm, fit: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white"
                    placeholder="e.g. Baggy Fit, Straight Fit"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-400 uppercase block mb-1">Fabric Composition</label>
                  <input
                    type="text"
                    value={productForm.fabric}
                    onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white"
                    placeholder="e.g. 100% Combed Cotton"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">Image URL</label>
                <input
                  type="text"
                  value={productForm.preview_image}
                  onChange={(e) => setProductForm({ ...productForm, preview_image: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.short_description}
                  onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white"
                  placeholder="Detailed material and styling note..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-neutral-600 rounded uppercase font-bold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded uppercase font-black text-white"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTOCK / INVENTORY ADJUSTMENT MODAL */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-800 border border-neutral-700 max-w-md w-full p-6 rounded shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
              <h3 className="text-sm font-black uppercase text-white font-heading">
                Adjust Inventory Stock
              </h3>
              <button onClick={() => setStockModalProduct(null)} className="text-neutral-400 hover:text-white font-bold">✕</button>
            </div>

            <p className="font-bold text-white">{stockModalProduct.title}</p>
            <p className="text-neutral-400">SKU: {stockModalProduct.sku}</p>

            <form onSubmit={handleStockAdjustment} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">Select Size</label>
                <select
                  value={adjustSize}
                  onChange={(e) => setAdjustSize(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-bold"
                >
                  {stockModalProduct.sizes?.map(sz => (
                    <option key={sz} value={sz}>
                      Size {sz} (Current: {stockModalProduct.stock?.[sz] ?? 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">Stock Adjustment Quantity</label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-mono font-bold"
                  placeholder="+5 or -2"
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">Use positive numbers to add stock, negative to subtract.</span>
              </div>

              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white"
                  placeholder="e.g. Warehouse restock, Damaged batch"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-700">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="px-4 py-2 border border-neutral-600 rounded uppercase font-bold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded uppercase font-black text-white"
                >
                  Apply Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-800 border border-neutral-700 max-w-xl w-full p-6 rounded shadow-2xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase text-white font-heading">
                  Order #{viewingOrder.id}
                </h3>
                <span className="text-[11px] text-neutral-400">{new Date(viewingOrder.createdAt).toLocaleString()}</span>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-neutral-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 bg-neutral-900 rounded border border-neutral-700/60">
              <div>
                <span className="text-neutral-500 uppercase font-bold block text-[10px]">Customer</span>
                <p className="font-bold text-white">{viewingOrder.customerName}</p>
                <p className="text-neutral-400">{viewingOrder.email}</p>
                <p className="text-neutral-400">{viewingOrder.phone}</p>
              </div>

              <div>
                <span className="text-neutral-500 uppercase font-bold block text-[10px]">Shipping Address</span>
                <p className="text-neutral-300">{viewingOrder.address?.line1}</p>
                <p className="text-neutral-300">{viewingOrder.address?.city}, {viewingOrder.address?.state} - {viewingOrder.address?.pincode}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 border-t border-b border-neutral-700 py-3">
              <span className="text-neutral-400 font-bold uppercase block text-[10px]">Purchased Items</span>
              {viewingOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <img src={it.image} alt={it.title} className="w-10 h-12 object-cover rounded bg-neutral-900" />
                    <div>
                      <span className="font-bold text-white block">{it.title}</span>
                      <span className="text-neutral-400 text-[10px]">Size: {it.size} • Qty: {it.quantity}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-white">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="space-y-1 text-neutral-300">
              <div className="flex justify-between"><span>Subtotal:</span><span>₹{viewingOrder.subtotal}</span></div>
              <div className="flex justify-between text-green-400"><span>Discount:</span><span>-₹{viewingOrder.discount}</span></div>
              <div className="flex justify-between"><span>Shipping:</span><span>₹{viewingOrder.shipping}</span></div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-neutral-700">
                <span>Grand Total:</span><span>₹{viewingOrder.total}</span>
              </div>
            </div>

            {/* Timeline */}
            {viewingOrder.timeline && (
              <div className="pt-2">
                <span className="text-neutral-400 font-bold uppercase block text-[10px] mb-2">Order Activity Timeline</span>
                <div className="space-y-1.5 pl-2 border-l border-neutral-700">
                  {viewingOrder.timeline.map((ev, i) => (
                    <div key={i} className="text-[11px]">
                      <span className="text-red-400 font-bold uppercase">{ev.status}</span>
                      <span className="text-neutral-500 ml-2">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      <p className="text-neutral-400">{ev.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CATEGORY CREATION MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-800 border border-neutral-700 max-w-md w-full p-6 rounded shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
              <h3 className="text-sm font-black uppercase text-white font-heading">Add Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-neutral-400 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CARGOS & UTILITY"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">Image URL</label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-700">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-neutral-600 rounded uppercase font-bold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded uppercase font-black text-white"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-800 border border-neutral-700 max-w-md w-full p-6 rounded shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
              <h3 className="text-sm font-black uppercase text-white font-heading">New Promo Code</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-neutral-400 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-mono font-bold uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-400 uppercase block mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-400 uppercase block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-mono font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-neutral-400 uppercase block mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  value={couponForm.minOrderAmount}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-700">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-neutral-600 rounded uppercase font-bold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded uppercase font-black text-white"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

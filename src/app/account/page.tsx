'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import ProductDetailModal from '@/components/ProductDetailModal';
import SearchModal from '@/components/SearchModal';
import AuthModal from '@/components/AuthModal';
import ProductCard from '@/components/ProductCard';
import { useShop } from '@/context/ShopContext';
import { Order, Product, ReturnRequest } from '@/lib/types';
import {
  Package,
  Heart,
  User as UserIcon,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  LogOut,
  ShoppingBag,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, setIsAuthOpen, wishlist, addToCart, showToast } = useShop();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'wishlist' || tabParam === 'orders' || tabParam === 'profile') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Return / Exchange modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<any>(null);
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return');
  const [exchangeSize, setExchangeSize] = useState('L');
  const [returnReason, setReturnReason] = useState('Size is too small');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchWishlistItems();
  }, [wishlist, user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
      const res = await fetch(`/api/orders${emailQuery}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchWishlistItems = async () => {
    if (wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        const matched = data.products.filter((p: Product) => wishlist.includes(p.id));
        setWishlistProducts(matched);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenReturnModal = (order: Order, item: any) => {
    setSelectedOrderForReturn(order);
    setSelectedItemForReturn(item);
    setReturnModalOpen(true);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReturn || !selectedItemForReturn) return;

    setSubmittingReturn(true);
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderForReturn.id,
          customerName: selectedOrderForReturn.customerName,
          customerEmail: selectedOrderForReturn.email,
          productId: selectedItemForReturn.productId,
          productTitle: selectedItemForReturn.title,
          size: selectedItemForReturn.size,
          type: returnType,
          exchangeSize: returnType === 'exchange' ? exchangeSize : undefined,
          reason: returnReason
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${returnType === 'return' ? 'Return' : 'Exchange'} request submitted successfully!`);
        setReturnModalOpen(false);
      } else {
        showToast(data.error || 'Failed to submit request');
      }
    } catch (err) {
      showToast('Error submitting return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getStatusStepIndex = (status: Order['fulfillmentStatus']) => {
    switch (status) {
      case 'Processing': return 1;
      case 'Packed': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Account Header */}
        <div className="bg-white p-6 sm:p-8 rounded border border-gray-200 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-black text-white text-xl font-black uppercase flex items-center justify-center font-heading">
              {user ? user.name.charAt(0) : 'S'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight font-heading">
                {user ? user.name : 'Guest Customer'}
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                {user ? user.email : 'Sign in to access saved orders & quick checkout'}
              </p>
            </div>
          </div>

          <div>
            {user ? (
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-xs font-bold uppercase rounded hover:border-black text-gray-700 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase rounded hover:bg-neutral-800 transition"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 bg-white px-6 rounded-t border-t border-x">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition ${
              activeTab === 'orders' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Package className="w-4 h-4" />
            Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition ${
              activeTab === 'wishlist' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Heart className="w-4 h-4" />
            Wishlist ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition ${
              activeTab === 'profile' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Saved Address
          </button>
        </div>

        {/* TAB 1: Order History with Live Order Tracking Timeline */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="p-12 text-center text-xs font-bold uppercase text-gray-400 bg-white rounded border">
                Loading Orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded border border-gray-200">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-black uppercase">No Orders Placed Yet</h3>
                <p className="text-xs text-gray-500 mt-1">Explore our catalog and place your first order!</p>
              </div>
            ) : (
              orders.map((order) => {
                const currentStep = getStatusStepIndex(order.fulfillmentStatus);
                const steps = ['Processing', 'Packed', 'Shipped', 'Delivered'];

                return (
                  <div key={order.id} className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-5">
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-black font-mono">
                          #{order.id}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                          order.fulfillmentStatus === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.fulfillmentStatus === 'Shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : order.fulfillmentStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.fulfillmentStatus}
                        </span>
                        <span className="text-xs font-bold bg-neutral-100 text-gray-800 px-2 py-0.5 rounded">
                          {order.paymentMethod} ({order.paymentStatus})
                        </span>
                      </div>
                    </div>

                    {/* Order Tracking Timeline Progress Bar */}
                    {order.fulfillmentStatus !== 'Cancelled' && (
                      <div className="py-3 px-4 bg-gray-50 rounded border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-3">
                          Live Order Tracking Status
                        </span>
                        <div className="relative flex items-center justify-between">
                          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-gray-200 z-0" />
                          <div
                            className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-black transition-all duration-500 z-0"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                          />
                          {steps.map((st, i) => {
                            const isDone = i + 1 <= currentStep;
                            return (
                              <div key={st} className="relative z-10 flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition ${
                                  isDone ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                  {isDone ? '✓' : i + 1}
                                </div>
                                <span className={`text-[10px] font-bold mt-1 uppercase ${
                                  isDone ? 'text-black' : 'text-gray-400'
                                }`}>
                                  {st}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-b-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-14 h-18 object-cover rounded bg-gray-100 flex-shrink-0 cursor-pointer"
                            onClick={() => router.push(`/products/${item.productId}`)}
                          />
                          <div className="flex-1">
                            <h4
                              onClick={() => router.push(`/products/${item.productId}`)}
                              className="text-xs font-bold text-black leading-snug cursor-pointer hover:underline"
                            >
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Size: {item.size} • Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-xs font-extrabold text-black">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {/* Return / Exchange Button */}
                            <button
                              onClick={() => handleOpenReturnModal(order, item)}
                              className="text-[10px] font-bold text-neutral-700 hover:text-black border border-gray-300 hover:border-black px-2 py-0.5 rounded transition flex items-center gap-1"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Return / Exchange</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Bottom Footer */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-gray-500 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-black" />
                        <span>Tracking: <strong className="text-black font-mono">{order.trackingNumber}</strong></span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">Total Paid:</span>
                        <span className="text-sm font-black text-black">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="p-16 text-center bg-white rounded border border-gray-200">
                <Heart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-black uppercase">Your Wishlist is Empty</h3>
                <p className="text-xs text-gray-500 mt-1">Tap the heart icon on any product to save it here.</p>
                <a
                  href="/collections/all"
                  className="mt-4 inline-block px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded"
                >
                  Explore Drops
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {wishlistProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Saved Address */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded border border-gray-200 max-w-lg space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-black font-heading">
              Default Shipping Address
            </h3>
            <div className="p-4 bg-gray-50 rounded border border-gray-200 text-xs text-gray-700 space-y-1">
              <p className="font-bold text-black">{user?.name || 'Customer'}</p>
              <p>{user?.address?.line1 || 'Flat 402, High Street Towers, Bandra West'}</p>
              <p>{user?.address?.city || 'Mumbai'}, {user?.address?.state || 'Maharashtra'} - {user?.address?.pincode || '400050'}</p>
              <p className="pt-1">Phone: {user?.phone || '+91 98765 43210'}</p>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-xs font-bold text-black underline"
            >
              Update Information
            </button>
          </div>
        )}

      </main>

      {/* Return / Exchange Modal */}
      {returnModalOpen && selectedItemForReturn && selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full p-6 rounded shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h4 className="text-sm font-black uppercase text-black font-heading">
                Request Return or Exchange
              </h4>
              <button onClick={() => setReturnModalOpen(false)} className="text-gray-400 hover:text-black font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Product</span>
                <p className="font-bold text-black">{selectedItemForReturn.title} (Size: {selectedItemForReturn.size})</p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">Order #{selectedOrderForReturn.id}</p>
              </div>

              <div>
                <label className="font-bold text-gray-700 uppercase block mb-1">Request Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="reqType"
                      checked={returnType === 'return'}
                      onChange={() => setReturnType('return')}
                    />
                    <span>Full Refund (Return)</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="reqType"
                      checked={returnType === 'exchange'}
                      onChange={() => setReturnType('exchange')}
                    />
                    <span>Size Exchange</span>
                  </label>
                </div>
              </div>

              {returnType === 'exchange' && (
                <div>
                  <label className="font-bold text-gray-700 uppercase block mb-1">Select Exchange Size</label>
                  <select
                    value={exchangeSize}
                    onChange={(e) => setExchangeSize(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded font-bold"
                  >
                    {['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'].map(sz => (
                      <option key={sz} value={sz}>Size {sz}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700 uppercase block mb-1">Reason for Return/Exchange</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded font-medium"
                >
                  <option value="Size is too small">Size is too small</option>
                  <option value="Size is too large">Size is too large</option>
                  <option value="Fabric / material not as expected">Fabric / material not as expected</option>
                  <option value="Received damaged or defective piece">Received damaged or defective piece</option>
                  <option value="Changed mind / Don't need it">Changed mind / Don't need it</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded uppercase font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="px-6 py-2 bg-black text-white rounded uppercase font-black hover:bg-neutral-800 transition"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />

      <ProductDetailModal />
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <SearchModal />
      <AuthModal />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-12 text-center text-xs font-bold uppercase tracking-wider">Loading Account...</div>}>
      <AccountContent />
    </Suspense>
  );
}

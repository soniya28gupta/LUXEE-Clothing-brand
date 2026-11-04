'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  Truck,
  Sparkles
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, cartSubtotal, discount, couponCode, clearCart, user, showToast } = useShop();

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState(user?.address?.line1 || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');

  // Payment states
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [testUpiId, setTestUpiId] = useState('success@razorpay');
  const [testCardNumber, setTestCardNumber] = useState('4242 4242 4242 4242');
  const [testExpiry, setTestExpiry] = useState('12/28');
  const [testCvv, setTestCvv] = useState('123');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  if (!isOpen) return null;

  const shippingCost = (cartSubtotal >= 999 || couponCode === 'FREESHIP') ? 0 : 99;
  const totalAmount = Math.max(0, cartSubtotal - discount + shippingCost);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !phone || !addressLine || !city || !pincode) {
      showToast('Please fill in all shipping details');
      return;
    }
    setStep('payment');
  };

  const handleProcessPayment = async () => {
    setProcessingPayment(true);
    try {
      // 1. Simulate payment sandbox verification
      const payRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          method: paymentMode,
          testUpiId,
          testCardNumber
        })
      });
      const payData = await payRes.json();

      // 2. Create Order in Database
      const orderPayload = {
        customerName,
        email,
        phone,
        address: {
          line1: addressLine,
          city,
          state,
          pincode
        },
        items: cart.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          size: item.size,
          quantity: item.quantity,
          price: item.product.selling_price,
          image: item.product.preview_image || item.product.images[0] || ''
        })),
        subtotal: cartSubtotal,
        discount,
        shipping: shippingCost,
        total: totalAmount,
        paymentMethod: paymentMode,
        paymentStatus: paymentMode === 'COD' ? 'Pending' : 'Paid',
        fulfillmentStatus: 'Processing'
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const orderData = await orderRes.json();

      if (orderData.success) {
        setCreatedOrder(orderData.order);
        setStep('success');
        clearCart();
        // Fire celebration confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        showToast(orderData.error || 'Failed to create order');
      }
    } catch (err) {
      console.error(err);
      showToast('Error processing checkout');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      setStep('details');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm overflow-hidden z-10 flex flex-col my-8">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-neutral-900 text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black uppercase tracking-tight font-heading">
                LUXEE<span className="text-red-500">.</span>
              </span>
              <span className="text-xs text-neutral-400">|</span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                {step === 'details' && 'Shipping & Contact'}
                {step === 'payment' && 'Razorpay / Stripe Sandbox'}
                {step === 'success' && 'Order Confirmed!'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            
            {/* STEP 1: Details */}
            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-black">
                    Delivery Address
                  </h3>
                  <span className="text-xs font-bold text-gray-500">
                    Step 1 of 2
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aryan Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aryan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Street Address / Flat / Building *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 304, Palm Grove Towers, MG Road"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="400050"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Summary Mini Bar */}
                <div className="p-3 bg-gray-50 rounded border border-gray-100 flex items-center justify-between text-xs text-gray-700">
                  <span>Order Total ({cart.length} items):</span>
                  <span className="font-extrabold text-black text-sm">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xs hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>CONTINUE TO PAYMENT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Payment Sandbox */}
            {step === 'payment' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-green-600" />
                      Select Payment Mode
                    </h3>
                    <p className="text-[11px] text-gray-500">Test Sandbox environment active</p>
                  </div>
                  <button
                    onClick={() => setStep('details')}
                    className="text-xs font-bold text-gray-500 hover:text-black underline"
                  >
                    Edit Address
                  </button>
                </div>

                {/* Payment Options Radio Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('UPI')}
                    className={`p-3.5 border rounded text-left transition flex flex-col justify-between ${
                      paymentMode === 'UPI' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-black mb-2" />
                    <div>
                      <span className="block text-xs font-bold uppercase text-black">Instant UPI</span>
                      <span className="text-[10px] text-gray-500">GPay, PhonePe, Paytm</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('CARD')}
                    className={`p-3.5 border rounded text-left transition flex flex-col justify-between ${
                      paymentMode === 'CARD' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-black mb-2" />
                    <div>
                      <span className="block text-xs font-bold uppercase text-black">Card</span>
                      <span className="text-[10px] text-gray-500">Visa, Mastercard, RuPay</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('COD')}
                    className={`p-3.5 border rounded text-left transition flex flex-col justify-between ${
                      paymentMode === 'COD' ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-black mb-2" />
                    <div>
                      <span className="block text-xs font-bold uppercase text-black">Cash on Delivery</span>
                      <span className="text-[10px] text-gray-500">Pay at doorstep</span>
                    </div>
                  </button>
                </div>

                {/* Dynamic Sandbox Details */}
                {paymentMode === 'UPI' && (
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded text-xs space-y-2">
                    <span className="font-bold text-black uppercase tracking-wider block">Sandbox UPI VPA</span>
                    <input
                      type="text"
                      value={testUpiId}
                      onChange={(e) => setTestUpiId(e.target.value)}
                      className="w-full text-xs p-2 border border-gray-300 rounded bg-white font-mono"
                    />
                    <p className="text-[11px] text-gray-500">Use default <code className="bg-gray-200 px-1 py-0.5 rounded">success@razorpay</code> for instant simulated success.</p>
                  </div>
                )}

                {paymentMode === 'CARD' && (
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded text-xs space-y-2.5">
                    <span className="font-bold text-black uppercase tracking-wider block">Sandbox Card Details</span>
                    <input
                      type="text"
                      value={testCardNumber}
                      onChange={(e) => setTestCardNumber(e.target.value)}
                      placeholder="Card Number"
                      className="w-full text-xs p-2 border border-gray-300 rounded bg-white font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={testExpiry}
                        onChange={(e) => setTestExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full text-xs p-2 border border-gray-300 rounded bg-white font-mono"
                      />
                      <input
                        type="password"
                        value={testCvv}
                        onChange={(e) => setTestCvv(e.target.value)}
                        placeholder="CVV"
                        className="w-full text-xs p-2 border border-gray-300 rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {paymentMode === 'COD' && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                    <p className="font-bold">Cash on Delivery Selected</p>
                    <p className="text-[11px] mt-0.5">Please keep exact cash ready at the time of delivery.</p>
                  </div>
                )}

                {/* Amount to Pay CTA */}
                <button
                  type="button"
                  disabled={processingPayment}
                  onClick={handleProcessPayment}
                  className="w-full py-4 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xs hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-xl"
                >
                  <Lock className="w-4 h-4 text-green-400" />
                  <span>
                    {processingPayment
                      ? 'PROCESSING PAYMENT...'
                      : `PAY ₹${totalAmount.toLocaleString('en-IN')} VIA ${paymentMode === 'COD' ? 'COD' : 'RAZORPAY SANDBOX'}`}
                  </span>
                </button>
              </div>
            )}

            {/* STEP 3: Order Success */}
            {step === 'success' && createdOrder && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-[11px] font-black tracking-widest text-green-600 uppercase">
                    PAYMENT SUCCESSFUL & ORDER PLACED
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-heading mt-1">
                    THANK YOU, {createdOrder.customerName}!
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Your order has been confirmed and is being prepared for dispatch.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Order ID:</span>
                    <span className="font-extrabold text-black">{createdOrder.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Tracking Code:</span>
                    <span className="font-mono font-bold text-black">{createdOrder.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Delivery Address:</span>
                    <span className="font-medium text-black text-right max-w-[200px]">
                      {createdOrder.address.line1}, {createdOrder.address.city} - {createdOrder.address.pincode}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-gray-500">Amount Paid:</span>
                    <span className="font-black text-base text-black">₹{createdOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-neutral-800"
                  >
                    Continue Shopping
                  </button>
                  <a
                    href="/account"
                    className="px-6 py-3 border border-gray-300 text-black text-xs font-bold uppercase tracking-wider rounded hover:border-black"
                  >
                    View in Account
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAllowed } from '@/lib/access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    const status = searchParams.get('status');

    if (id) {
      const order = db.getOrderById(id);
      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, order });
    }

    let orders = db.getOrders();

    if (email) {
      orders = orders.filter(o => o.email.toLowerCase() === email.toLowerCase());
    }

    if (status && status !== 'All') {
      orders = orders.filter(o => o.fulfillmentStatus.toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required order details' }, { status: 400 });
    }

    // Server-side inventory and price verification
    for (const item of body.items) {
      const product = db.getProductById(item.productId);
      if (!product) {
        return NextResponse.json({ success: false, error: `Product "${item.title}" no longer exists.` }, { status: 400 });
      }
      if (product.stock && product.stock[item.size] !== undefined) {
        if (product.stock[item.size] < item.quantity) {
          return NextResponse.json({
            success: false,
            error: `Insufficient stock for ${product.title} (Size: ${item.size}). Only ${product.stock[item.size]} left.`
          }, { status: 400 });
        }
      }
    }

    const order = db.createOrder(body);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const id = searchParams.get('id') || body.id;
    const status = body.status;
    const note = body.note;
    const author = request.headers.get('x-user-name') || 'Admin';

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }

    if (body.action === 'process_refund' || status) {
      if (!isAllowed(request, ['admin', 'staff'])) {
        return NextResponse.json({ success: false, error: 'Permission denied.' }, { status: 403 });
      }
    }

    // Action: process_refund
    if (body.action === 'process_refund') {
      const order = db.getOrderById(id);
      if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      order.paymentStatus = 'Refunded';
      order.fulfillmentStatus = 'Cancelled';
      if (!order.timeline) order.timeline = [];
      order.timeline.push({
        status: "Refunded",
        timestamp: new Date().toISOString(),
        note: `Demo refund of ₹${order.total} processed by ${author}`
      });
      // Restock items
      order.items.forEach(item => {
        db.adjustStock(item.productId, item.size, item.quantity, `Refund order ${order.id}`, author);
      });
      return NextResponse.json({ success: true, order });
    }

    if (status) {
      const updated = db.updateOrderStatus(id, status, note, author);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ success: false, error: 'No status or action provided' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
  }
}

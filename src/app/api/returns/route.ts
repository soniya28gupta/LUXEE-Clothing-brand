import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAllowed } from '@/lib/access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    let returns = db.getReturns();

    if (orderId) {
      returns = returns.filter(r => r.orderId === orderId);
    }

    return NextResponse.json({ success: true, count: returns.length, returns });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch returns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.orderId || !body.productId || !body.reason) {
      return NextResponse.json({ success: false, error: 'Missing required return details' }, { status: 400 });
    }

    const newReq = db.createReturnRequest({
      orderId: body.orderId,
      customerName: body.customerName || 'Customer',
      customerEmail: body.customerEmail || 'customer@luxee.com',
      productId: body.productId,
      productTitle: body.productTitle || 'LUXEE Item',
      size: body.size || 'M',
      type: body.type || 'return',
      exchangeSize: body.exchangeSize,
      reason: body.reason,
      refundStatus: body.type === 'exchange' ? 'StoreCredit' : 'Pending'
    });

    return NextResponse.json({ success: true, returnRequest: newReq }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit return request' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const author = request.headers.get('x-user-name') || 'Admin';

    if (!isAllowed(request, ['admin', 'staff'])) {
      return NextResponse.json({ success: false, error: 'Permission denied.' }, { status: 403 });
    }

    if (!id || !body.status) {
      return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });
    }

    const restock = body.restockItem === true;
    const updated = db.updateReturnStatus(id, body.status, restock, author);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Return request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, returnRequest: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update return request' }, { status: 500 });
  }
}


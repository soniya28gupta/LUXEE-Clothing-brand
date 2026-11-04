import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAllowed } from '@/lib/access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const subtotal = searchParams.get('subtotal') ? Number(searchParams.get('subtotal')) : 0;

    if (code) {
      const result = db.validateCoupon(code, subtotal);
      return NextResponse.json({
        success: result.valid,
        discount: result.discount,
        coupon: result.coupon,
        message: result.message
      });
    }

    const coupons = db.getCoupons();
    return NextResponse.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const author = request.headers.get('x-user-name') || 'Admin';

    if (body.action === 'validate') {
      // Validation is available to storefront shoppers without admin access.
    } else if (!isAllowed(request, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });
    }

    // If validating code
    if (body.action === 'validate') {
      const result = db.validateCoupon(body.code || '', body.subtotal || 0);
      return NextResponse.json({
        success: result.valid,
        discount: result.discount,
        coupon: result.coupon,
        message: result.message
      });
    }

    if (!body.code || !body.discountValue) {
      return NextResponse.json({ success: false, error: 'Coupon code and discount value required' }, { status: 400 });
    }

    const coupon = {
      id: body.id || `c-${Date.now()}`,
      code: body.code.toUpperCase().trim(),
      discountType: body.discountType || 'percentage',
      discountValue: Number(body.discountValue),
      minOrderAmount: Number(body.minOrderAmount || 0),
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      expiryDate: body.expiryDate || new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0],
      usageLimit: Number(body.usageLimit || 500),
      timesUsed: Number(body.timesUsed || 0),
      isActive: body.isActive !== undefined ? body.isActive : true
    };

    const saved = db.saveCoupon(coupon, author);
    return NextResponse.json({ success: true, coupon: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save coupon' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const author = request.headers.get('x-user-name') || 'Admin';

    if (!isAllowed(request, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });
    }

    if (!id) return NextResponse.json({ success: false, error: 'Coupon ID required' }, { status: 400 });

    const deleted = db.deleteCoupon(id, author);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete coupon' }, { status: 500 });
  }
}


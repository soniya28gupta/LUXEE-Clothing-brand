import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAllowed } from '@/lib/access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const all = searchParams.get('all') === 'true'; // include hidden for admin
    let reviews = db.getReviews(productId);
    if (!all) {
      reviews = reviews.filter(r => r.status !== 'hidden');
    }
    return NextResponse.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.productId || !body.userName || !body.rating || !body.comment) {
      return NextResponse.json({ success: false, error: 'Missing required review fields' }, { status: 400 });
    }

    const review = db.addReview({
      productId: body.productId,
      userName: body.userName,
      rating: Number(body.rating),
      title: body.title || 'Verified Buyer Review',
      comment: body.comment,
      verifiedBuyer: true,
      fitFeedback: body.fitFeedback || 'True to Size',
      status: 'approved'
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add review' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!isAllowed(request, ['admin', 'staff'])) {
      return NextResponse.json({ success: false, error: 'Permission denied.' }, { status: 403 });
    }

    if (!id || !body.status) {
      return NextResponse.json({ success: false, error: 'Review ID and status required' }, { status: 400 });
    }

    const updated = db.updateReviewStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

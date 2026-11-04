import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAllowed } from '@/lib/access';

export async function GET() {
  try {
    const settings = db.getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAllowed(request, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const author = request.headers.get('x-user-name') || 'Admin';
    const settings = db.updateSettings(body, author);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}


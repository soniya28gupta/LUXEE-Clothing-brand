import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestRole } from '@/lib/access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const requestedEmail = searchParams.get('email')?.trim().toLowerCase();
    const role = getRequestRole(request);
    let users = db.getUsers();

    if (role === 'customer' && requestedEmail) {
      users = users.filter(user => user.email.toLowerCase() === requestedEmail);
    } else if (role === 'customer') {
      const customerEmail = request.headers.get('x-user-email')?.trim().toLowerCase();
      if (customerEmail) {
        users = users.filter(user => user.email.toLowerCase() === customerEmail);
      }
    }

    // Map each customer with their order history & total spend
    const orders = db.getOrders();
    const enriched = users.map(user => {
      const userOrders = orders.filter(o => o.email.toLowerCase() === user.email.toLowerCase());
      const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        ...user,
        orderCount: userOrders.length,
        totalSpent: totalSpent || user.totalSpent || 0,
        orders: userOrders
      };
    });

    let result = enriched;
    if (search) {
      result = enriched.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.phone?.includes(search)
      );
    }

    return NextResponse.json({ success: true, count: result.length, customers: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch customers' }, { status: 500 });
  }
}


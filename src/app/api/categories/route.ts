import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAllowed } from '@/lib/access';

export async function GET() {
  try {
    const categories = db.getCategories();
    return NextResponse.json({ success: true, count: categories.length, categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const author = request.headers.get('x-user-name') || 'Admin';

    if (!isAllowed(request, ['admin', 'staff'])) {
      return NextResponse.json({ success: false, error: 'Permission denied.' }, { status: 403 });
    }

    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, error: 'Category name and slug are required' }, { status: 400 });
    }

    const cat = {
      id: body.id || `cat-${Date.now()}`,
      name: body.name.toUpperCase().trim(),
      slug: body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: body.description || `Explore ${body.name} essentials`,
      image: body.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80",
      featured: body.featured !== undefined ? body.featured : true,
      sortOrder: body.sortOrder || 10
    };

    const saved = db.saveCategory(cat, author);
    return NextResponse.json({ success: true, category: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const author = request.headers.get('x-user-name') || 'Admin';

    if (!isAllowed(request, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Only admins may delete categories.' }, { status: 403 });
    }

    if (!id) return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 });

    const deleted = db.deleteCategory(id, author);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}


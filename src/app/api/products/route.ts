import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAllowed } from '@/lib/access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const includeArchived = searchParams.get('includeArchived') === 'true';

    if (id || slug) {
      const target = id || slug || '';
      const product = db.getProductByIdOrSlug(target);
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product });
    }

    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase().trim();
    const sort = searchParams.get('sort');
    const fit = searchParams.get('fit');
    const size = searchParams.get('size');
    const color = searchParams.get('color')?.toLowerCase();
    const inStock = searchParams.get('inStock') === 'true';
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
    const featured = searchParams.get('featured');

    let products = db.getProducts(includeArchived);

    // Filter by Category or Collection
    if (category && category !== 'All' && category !== 'all') {
      const catClean = category.toLowerCase().trim();
      if (catClean === 'new-drops' || catClean === 'new drops' || catClean === 'new') {
        products = products.filter(p => p.is_new_drop);
      } else if (catClean === 'sale' || catClean === 'on-sale' || catClean === 'deals') {
        products = products.filter(p => (p.discount_percentage && p.discount_percentage > 0) || (p.mrp > p.selling_price));
      } else if (catClean === 'bestsellers' || catClean === 'bestseller') {
        products = products.filter(p => p.is_bestseller);
      } else if (catClean === 'oversized-t-shirts' || catClean === 'oversized-tees' || catClean === 'oversized') {
        products = products.filter(p => p.category.toLowerCase().includes('oversized') || p.category.toLowerCase().includes('tee'));
      } else if (catClean === 'shirts' || catClean === 'shirt') {
        products = products.filter(p => p.category.toLowerCase().includes('shirt') && !p.category.toLowerCase().includes('t-shirt') && !p.category.toLowerCase().includes('tee'));
      } else if (catClean === 'jeans' || catClean === 'jean' || catClean === 'denim') {
        products = products.filter(p => p.category.toLowerCase().includes('jean') || p.category.toLowerCase().includes('denim'));
      } else if (catClean === 'trousers' || catClean === 'trouser' || catClean === 'cargos') {
        products = products.filter(p => p.category.toLowerCase().includes('trouser') || p.category.toLowerCase().includes('cargo') || p.category.toLowerCase().includes('pant'));
      } else if (catClean === 'sweaters' || catClean === 'sweater') {
        products = products.filter(p => p.category.toLowerCase().includes('sweater') || p.category.toLowerCase().includes('hoodie') || p.category.toLowerCase().includes('knit'));
      } else if (catClean === 'jackets' || catClean === 'jacket') {
        products = products.filter(p => p.category.toLowerCase().includes('jacket') || p.category.toLowerCase().includes('overshirt'));
      } else {
        const normalizedCat = catClean.replace(/[-_]/g, ' ');
        products = products.filter(p => {
          const pCat = p.category.toLowerCase().replace(/[-_]/g, ' ');
          return pCat === normalizedCat || pCat.includes(normalizedCat) || normalizedCat.includes(pCat);
        });
      }
    }

    // Match every query term so combined searches like "black pants" work.
    if (search) {
      const searchTerms = search.split(/\s+/).filter(Boolean);
      const searchableFields = (p: typeof products[number]) => [
        p.title,
        p.category,
        p.sku || '',
        p.handle || '',
        p.fit || '',
        p.fabric || '',
        p.occasion || '',
        p.short_description || '',
        ...(p.colors || []),
        ...(p.sizes || [])
      ].join(' ').toLowerCase();

      products = products.filter(p => {
        const fields = searchableFields(p);
        const fieldTokens = new Set(fields.match(/[a-z0-9]+/g) || []);
        const category = p.category.toLowerCase();
        return searchTerms.every(term => {
          if (term === 'pants' || term === 'pant') {
            return /trouser|jean|denim|cargo/.test(category) || fields.includes(term);
          }
          if (term === 'bottoms' || term === 'bottomwear') {
            return /trouser|jean|denim|cargo/.test(category);
          }
          if (term === 'tee' || term === 'tees' || term === 'tshirt' || term === 't-shirts') {
            return /t-shirt|tee|oversized/.test(category) || fields.includes(term);
          }
          if (term === 'shirts' || term === 'shirt') {
            return category.includes('shirt') || fields.includes(term);
          }
          return fieldTokens.has(term);
        });
      });
    }

    // Filter by Fit
    if (fit && fit !== 'All') {
      products = products.filter(p => p.fit?.toLowerCase() === fit.toLowerCase());
    }

    // Filter by Size
    if (size && size !== 'All') {
      products = products.filter(p => p.sizes?.includes(size));
    }

    // Filter by Color
    if (color && color !== 'all') {
      products = products.filter(p => p.colors?.some(c => c.toLowerCase() === color));
    }

    // Filter by inStock
    if (inStock) {
      products = products.filter(p => {
        if (!p.stock) return false;
        return Object.values(p.stock).some(qty => qty > 0);
      });
    }

    // Filter by Price range
    if (minPrice !== null) {
      products = products.filter(p => p.selling_price >= minPrice);
    }
    if (maxPrice !== null) {
      products = products.filter(p => p.selling_price <= maxPrice);
    }

    // Featured filters
    if (featured === 'bestseller' || featured === 'bestsellers') {
      products = products.filter(p => p.is_bestseller);
    } else if (featured === 'new' || featured === 'new-drops') {
      products = products.filter(p => p.is_new_drop);
    } else if (featured === 'sale') {
      products = products.filter(p => (p.discount_percentage && p.discount_percentage > 0) || (p.mrp > p.selling_price));
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a, b) => a.selling_price - b.selling_price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.selling_price - a.selling_price);
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else if (sort === 'newest') {
      products.sort((a, b) => (b.is_new_drop ? 1 : 0) - (a.is_new_drop ? 1 : 0));
    }

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.selling_price || !body.category) {
      return NextResponse.json({ success: false, error: 'Missing required product fields' }, { status: 400 });
    }

    if (!isAllowed(request, ['admin', 'staff'])) {
      return NextResponse.json({ success: false, error: 'Permission denied. Admin access required.' }, { status: 403 });
    }

    const author = request.headers.get('x-user-name') || 'Admin';
    const newProduct = db.createProduct(body, author);
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const id = searchParams.get('id') || body.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    if (!isAllowed(request, ['admin', 'staff'])) {
      return NextResponse.json({ success: false, error: 'Permission denied. Admin access required.' }, { status: 403 });
    }

    const author = request.headers.get('x-user-name') || 'Admin';
    const updated = db.updateProduct(id, body, author);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const id = searchParams.get('id') || body.id;
    const author = request.headers.get('x-user-name') || 'Admin';

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    if (body.action === 'delete') {
      if (!isAllowed(request, ['admin'])) {
        return NextResponse.json({ success: false, error: 'Only admins may permanently delete products.' }, { status: 403 });
      }
      const deleted = db.deleteProduct(id, author);
      if (!deleted) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Product deleted' });
    }

    if (!isAllowed(request, ['admin', 'staff'])) {
      return NextResponse.json({ success: false, error: 'Permission denied. Admin access required.' }, { status: 403 });
    }

    // Action: adjust_stock
    if (body.action === 'adjust_stock') {
      const { size, adjustment, reason } = body;
      const updated = db.adjustStock(id, size, adjustment, reason || 'Manual adjustment', author);
      if (!updated) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      return NextResponse.json({ success: true, product: updated });
    }

    // Action: archive
    if (body.action === 'archive') {
      const updated = db.archiveProduct(id, author);
      return NextResponse.json({ success: true, product: updated });
    }

    // Action: toggle_publish
    if (body.action === 'toggle_publish') {
      const prod = db.getProductById(id);
      if (!prod) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      const newStatus = prod.status === 'active' ? 'draft' : 'active';
      const updated = db.updateProduct(id, { status: newStatus }, author);
      return NextResponse.json({ success: true, product: updated });
    }

    const updated = db.updateProduct(id, body, author);
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Patch failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const author = request.headers.get('x-user-name') || 'Admin';

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    if (!isAllowed(request, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Only admins may permanently delete products.' }, { status: 403 });
    }

    const deleted = db.deleteProduct(id, author);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}

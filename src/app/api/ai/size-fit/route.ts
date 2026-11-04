import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { productId, height, weight, usualSize, fitPreference } = await request.json();

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const product = db.getProductById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const heightNum = Number(height) || 175; // cm
    const weightNum = Number(weight) || 72; // kg
    const fitPref = (fitPreference || 'regular').toLowerCase(); // 'oversized' | 'regular' | 'slim'

    // Determine size index for numeric waist (Jeans/Trousers) vs Alpha (Shirts/Tees)
    const isWaistNumeric = product.category === 'Jeans' || product.category === 'Trousers';
    let recommendedSize = '';
    let explanation = '';

    if (isWaistNumeric) {
      let waistEst = 32;
      if (weightNum < 60) waistEst = 28;
      else if (weightNum < 68) waistEst = 30;
      else if (weightNum < 78) waistEst = 32;
      else if (weightNum < 88) waistEst = 34;
      else waistEst = 36;

      if (fitPref === 'oversized' || fitPref === 'baggy') {
        waistEst = Math.min(36, waistEst + 2);
      } else if (fitPref === 'slim') {
        waistEst = Math.max(28, waistEst);
      }

      recommendedSize = String(waistEst);
      const inStockQty = product.stock?.[recommendedSize] ?? 0;

      explanation = `Based on your estimated waist profile (${weightNum}kg) and ${fitPref} fit preference, size ${recommendedSize} will deliver the ideal proportion. ${
        inStockQty > 0 ? `In stock (${inStockQty} units left).` : 'Currently running low in inventory.'
      }`;
    } else {
      let alphaEst = 'M';
      if (weightNum < 62) alphaEst = 'S';
      else if (weightNum < 75) alphaEst = 'M';
      else if (weightNum < 86) alphaEst = 'L';
      else alphaEst = 'XL';

      if (fitPref === 'oversized') {
        if (alphaEst === 'S') alphaEst = 'M';
        else if (alphaEst === 'M') alphaEst = 'L';
        else if (alphaEst === 'L') alphaEst = 'XL';
      } else if (fitPref === 'slim' && alphaEst !== 'S') {
        if (alphaEst === 'XL') alphaEst = 'L';
        else if (alphaEst === 'L') alphaEst = 'M';
      }

      recommendedSize = alphaEst;
      const inStockQty = product.stock?.[recommendedSize] ?? 0;

      explanation = `Based on your usual size ${usualSize || 'M'}, height (${heightNum}cm), and preference for a ${fitPref} silhouette, size ${recommendedSize} is recommended for optimal shoulder drape and chest comfort.`;
    }

    return NextResponse.json({
      success: true,
      recommendedSize,
      fitType: product.fit || 'Modern Fit',
      fabric: product.fabric || '100% Premium Cotton',
      explanation,
      stockStatus: (product.stock?.[recommendedSize] ?? 0) > 0 ? 'In Stock' : 'Out of Stock'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fit calculation failed' }, { status: 500 });
  }
}


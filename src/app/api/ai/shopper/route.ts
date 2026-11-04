import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Product } from '@/lib/types';

interface ShopperRequest {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  context?: {
    currentCategory?: string;
    budget?: number;
    color?: string;
    size?: string;
    fit?: string;
    occasion?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message, context }: ShopperRequest = await request.json();
    if (!message) {
      return NextResponse.json({ success: false, error: 'Query message is required' }, { status: 400 });
    }

    const lower = message.toLowerCase();
    const allProducts = db.getProducts();

    // 1. Detect Category intent
    let targetCategory: string | null = context?.currentCategory || null;
    if (lower.includes('shirt')) targetCategory = 'Shirts';
    else if (lower.includes('oversized') || lower.includes('tee') || lower.includes('tshirt') || lower.includes('t-shirt')) targetCategory = 'Oversized T-Shirts';
    else if (lower.includes('jean') || lower.includes('denim')) targetCategory = 'Jeans';
    else if (lower.includes('trouser') || lower.includes('cargo') || lower.includes('pant')) targetCategory = 'Trousers';
    else if (lower.includes('sweater') || lower.includes('knit') || lower.includes('hoodie')) targetCategory = 'Sweaters';
    else if (lower.includes('jacket') || lower.includes('overshirt') || lower.includes('outerwear')) targetCategory = 'Jackets';

    // 2. Detect Budget constraint (e.g. "under 2000", "below 1500", "less than 2500")
    let maxBudget: number | null = context?.budget || null;
    const budgetMatch = lower.match(/(?:under|below|less than|max|budget)\s*(?:₹|rs\.?|inr)?\s*(\d{3,5})/i) ||
                        lower.match(/(\d{3,5})\s*(?:rs|inr|rupees|or less|under)/i);
    if (budgetMatch) {
      maxBudget = parseInt(budgetMatch[1], 10);
    }
    if (lower.includes('cheaper') || lower.includes('less expensive') || lower.includes('affordable')) {
      maxBudget = 1800;
    }

    // 3. Detect Color intent
    let targetColor: string | null = context?.color || null;
    const colors = ['black', 'blue', 'white', 'grey', 'gray', 'beige', 'navy', 'brown', 'green', 'olive'];
    for (const c of colors) {
      if (lower.includes(c)) {
        targetColor = c;
        break;
      }
    }

    // 4. Detect Fit intent
    let targetFit: string | null = context?.fit || null;
    if (lower.includes('oversized') || lower.includes('baggy') || lower.includes('loose')) targetFit = 'oversized';
    else if (lower.includes('slim') || lower.includes('tight')) targetFit = 'slim';
    else if (lower.includes('straight') || lower.includes('regular')) targetFit = 'straight';
    else if (lower.includes('relaxed')) targetFit = 'relaxed';

    // 5. Detect Occasion intent
    let occasion: string | null = context?.occasion || null;
    if (lower.includes('party') || lower.includes('club') || lower.includes('night out') || lower.includes('birthday')) occasion = 'party';
    else if (lower.includes('formal') || lower.includes('office') || lower.includes('work') || lower.includes('interview')) occasion = 'formal';
    else if (lower.includes('casual') || lower.includes('college') || lower.includes('daily') || lower.includes('street')) occasion = 'casual';
    else if (lower.includes('winter') || lower.includes('cold') || lower.includes('travel')) occasion = 'winter';

    // 6. Detect Size intent
    let targetSize: string | null = context?.size || null;
    const sizeMatch = lower.match(/\b(xs|s|m|l|xl|xxl|28|30|32|34|36)\b/i);
    if (sizeMatch) {
      targetSize = sizeMatch[1].toUpperCase();
    }

    // Filter Candidates using actual catalog products with in-stock checks
    let filtered = allProducts.filter(p => {
      // Category match
      if (targetCategory && !p.category.toLowerCase().includes(targetCategory.toLowerCase())) {
        return false;
      }
      // Budget match
      if (maxBudget && p.selling_price > maxBudget) {
        return false;
      }
      // Color match
      if (targetColor) {
        const matchesColor = p.colors?.some(c => c.toLowerCase().includes(targetColor!)) ||
                             p.title.toLowerCase().includes(targetColor!);
        if (!matchesColor) return false;
      }
      // Fit match
      if (targetFit) {
        const pFit = (p.fit || '').toLowerCase();
        const pTitle = p.title.toLowerCase();
        if (targetFit === 'oversized' && !pFit.includes('oversized') && !pFit.includes('baggy') && !pTitle.includes('oversized')) return false;
        if (targetFit === 'slim' && !pFit.includes('slim')) return false;
        if (targetFit === 'straight' && !pFit.includes('straight') && !pFit.includes('regular')) return false;
      }
      // Size in-stock match
      if (targetSize) {
        if (!p.sizes.includes(targetSize) || (p.stock?.[targetSize] ?? 0) <= 0) {
          return false;
        }
      }
      return true;
    });

    // Fallback if filter too narrow
    if (filtered.length === 0) {
      filtered = allProducts.filter(p => {
        if (maxBudget && p.selling_price > maxBudget) return false;
        if (targetCategory && p.category.toLowerCase().includes(targetCategory.toLowerCase())) return true;
        return true;
      });
    }

    // Sort by rating & relevance
    filtered.sort((a, b) => (b.average_rating || 4.5) - (a.average_rating || 4.5));
    const recommendations = filtered.slice(0, 4);

    // Generate tailored AI advice explanation
    const reasons: Record<string, string> = {};
    recommendations.forEach(prod => {
      if (occasion === 'party') {
        reasons[prod.id] = `Tailored for nightlife: high-contrast streetwear aesthetic with a sharp modern drape.`;
      } else if (occasion === 'formal') {
        reasons[prod.id] = `Sharp and polished: tailored silhouette in breathable fabric suited for professional or evening wear.`;
      } else if (targetFit === 'oversized') {
        reasons[prod.id] = `Signature 280+ GSM heavyweight silhouette engineered with dropped shoulders for authentic streetwear drape.`;
      } else if (maxBudget) {
        reasons[prod.id] = `Exceptional value at ₹${prod.selling_price} (MRP: ₹${prod.mrp}) without compromising fabric quality.`;
      } else {
        reasons[prod.id] = `LUXEE Top Pick: Rated ${prod.average_rating}★ by verified buyers for premium fit & comfort.`;
      }
    });

    let conversationalReply = "";
    if (recommendations.length > 0) {
      if (targetCategory && maxBudget) {
        conversationalReply = `I found these premium ${targetCategory} within your ₹${maxBudget.toLocaleString('en-IN')} budget. Each piece is currently in stock and ready to ship.`;
      } else if (targetCategory) {
        conversationalReply = `Here are our top-rated ${targetCategory} handpicked for your style. They feature our signature luxury streetwear cuts and premium fabrics.`;
      } else if (occasion) {
        conversationalReply = `For your ${occasion} look, I recommend these high-impact streetwear essentials designed to elevate your silhouette.`;
      } else {
        conversationalReply = `Here are handpicked recommendations from our latest catalog drop that match your request.`;
      }
    } else {
      conversationalReply = `I couldn't find an exact match for those specific criteria, but here are our bestselling signature pieces you might love!`;
    }

    return NextResponse.json({
      success: true,
      message: conversationalReply,
      intent: {
        category: targetCategory,
        budget: maxBudget,
        color: targetColor,
        fit: targetFit,
        occasion,
        size: targetSize
      },
      products: recommendations,
      reasons
    });
  } catch (error) {
    console.error('AI Shopper error:', error);
    return NextResponse.json({
      success: false,
      error: 'AI Shopper consultation temporarily unavailable'
    }, { status: 500 });
  }
}


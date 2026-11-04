import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, method, testUpiId, testCardNumber } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    // Realistic sandbox verification
    const transactionId = `pay_luxee_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

    // Simulate standard test credentials
    if (method === 'UPI') {
      return NextResponse.json({
        success: true,
        transactionId,
        gateway: 'Razorpay Sandbox',
        status: 'CAPTURED',
        paymentMode: 'UPI',
        vpa: testUpiId || 'success@razorpay',
        message: 'Sandbox payment successfully simulated and captured.'
      });
    }

    return NextResponse.json({
      success: true,
      transactionId,
      gateway: 'Razorpay / Stripe Sandbox',
      status: 'CAPTURED',
      paymentMode: 'Card',
      last4: testCardNumber ? testCardNumber.slice(-4) : '4242',
      message: 'Sandbox payment successfully simulated and captured.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Payment simulation failed' }, { status: 500 });
  }
}

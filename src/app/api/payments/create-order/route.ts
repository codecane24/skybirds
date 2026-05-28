import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import { normalizeCurrency } from '@/lib/currency';
import { connectDB } from '@/lib/mongodb';

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';

  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.');
  }

  if (
    keyId === 'rzp_test_your_key_id' ||
    keySecret === 'your_razorpay_key_secret'
  ) {
    throw new Error('Razorpay keys are still placeholders. Replace them with actual Razorpay credentials in .env.');
  }

  return { keyId, keySecret };
}

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    await connectDB();
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const currency = normalizeCurrency(booking.currency);
    const { keyId, keySecret } = getRazorpayConfig();
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(booking.totalAmount * 100), // paise
      currency,
      receipt: `booking_${booking._id}`,
    });

    // Update booking with razorpay order ID
    booking.razorpayOrderId = order.id;
    await booking.save();

    // Create payment record (clientId is optional for public payments)
    await Payment.findOneAndUpdate(
      { razorpayOrderId: order.id },
      {
        bookingId: booking._id,
        clientId: booking.clientId,
        amount: booking.totalAmount,
        currency,
        conversionRate: booking.conversionRate || 1,
        razorpayOrderId: order.id,
        status: 'created',
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

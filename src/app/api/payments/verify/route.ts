import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { sendEmail, bookingConfirmationTemplate } from '@/lib/email';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/currency';
import { finalizePayment } from '@/lib/payments';

function getRazorpaySecret() {
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || '';

  if (!keySecret) {
    throw new Error('Razorpay verification is not configured. Set RAZORPAY_KEY_SECRET in .env.');
  }

  if (keySecret === 'your_razorpay_key_secret') {
    throw new Error('Razorpay key secret is still a placeholder. Replace it with the actual Razorpay secret in .env.');
  }

  return keySecret;
}

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const keySecret = getRazorpaySecret();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const { booking, client, wasAlreadyPaid } = await finalizePayment({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking record not found' }, { status: 404 });
    }

    // Send confirmation email
    if (!wasAlreadyPaid && client) {
      try {
        await sendEmail({
          to: client.email,
          subject: 'Booking Confirmed — Sky Birds',
          html: bookingConfirmationTemplate({
            name: client.name,
            destination: booking.destination,
            travelDate: format(new Date(booking.travelDate), 'dd MMM yyyy'),
            returnDate: format(new Date(booking.returnDate), 'dd MMM yyyy'),
            travelers: booking.travelers,
            amount: formatMoney(booking.totalAmount, booking.currency),
            bookingId: booking._id.toString().slice(-8).toUpperCase(),
          }),
        });
      } catch {
        // Email failed but payment is verified
      }
    }

    return NextResponse.json({ message: 'Payment verified', bookingId: booking?._id });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

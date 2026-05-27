import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import Client from '@/models/Client';
import { sendEmail, bookingConfirmationTemplate } from '@/lib/email';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/currency';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    await connectDB();

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'captured' },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Update booking
    const booking = await Booking.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, paymentStatus: 'paid', status: 'confirmed' },
      { new: true }
    );

    // Send confirmation email
    if (booking) {
      const clientId = payment.clientId || booking.clientId;
      const client = clientId ? await Client.findById(clientId) : null;
      if (client) {
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
    }

    return NextResponse.json({ message: 'Payment verified', bookingId: booking?._id });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

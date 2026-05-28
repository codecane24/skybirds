import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { finalizePayment } from '@/lib/payments';
import { bookingConfirmationTemplate, sendEmail } from '@/lib/email';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/currency';

function getWebhookSecret() {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || '';

  if (!webhookSecret) {
    throw new Error('Razorpay webhook secret is not configured. Set RAZORPAY_WEBHOOK_SECRET in .env.local.');
  }

  return webhookSecret;
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature') || '';
    const rawBody = await req.text();
    const webhookSecret = getWebhookSecret();
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (!signature || signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
          };
        };
      };
    };

    if (payload.event !== 'payment.captured') {
      return NextResponse.json({ received: true });
    }

    const razorpayPaymentId = payload.payload?.payment?.entity?.id || '';
    const razorpayOrderId = payload.payload?.payment?.entity?.order_id || '';

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing webhook payment details' }, { status: 400 });
    }

    const { booking, client, wasAlreadyPaid } = await finalizePayment({
      razorpayOrderId,
      razorpayPaymentId,
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking record not found' }, { status: 404 });
    }

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

    return NextResponse.json({ received: true, bookingId: booking._id });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
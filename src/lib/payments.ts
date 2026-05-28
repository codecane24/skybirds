import Booking from '@/models/Booking';
import Client from '@/models/Client';
import Payment from '@/models/Payment';
import { DEFAULT_CURRENCY } from '@/lib/currency';
import { connectDB } from '@/lib/mongodb';

interface FinalizePaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}

export async function finalizePayment({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: FinalizePaymentInput) {
  await connectDB();

  const existingBooking = await Booking.findOne({ razorpayOrderId });

  if (!existingBooking) {
    return { booking: null, payment: null, client: null, wasAlreadyPaid: false };
  }

  const wasAlreadyPaid = existingBooking.paymentStatus === 'paid';

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      $set: {
        bookingId: existingBooking._id,
        clientId: existingBooking.clientId,
        amount: existingBooking.totalAmount,
        currency: existingBooking.currency || DEFAULT_CURRENCY,
        conversionRate: existingBooking.conversionRate || 1,
        razorpayPaymentId,
        status: 'captured',
        ...(razorpaySignature ? { razorpaySignature } : {}),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  const booking = await Booking.findByIdAndUpdate(
    existingBooking._id,
    {
      razorpayPaymentId,
      paymentStatus: 'paid',
      status: 'confirmed',
    },
    { new: true }
  );

  const clientId = payment?.clientId || booking?.clientId;
  const client = clientId ? await Client.findById(clientId) : null;

  return { booking, payment, client, wasAlreadyPaid };
}
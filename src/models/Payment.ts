import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  clientId?: Types.ObjectId;
  amount: number;
  currency: string;
  conversionRate: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  status: 'created' | 'captured' | 'failed' | 'refunded';
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: false },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  conversionRate: { type: Number, default: 1 },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  status: { type: String, enum: ['created', 'captured', 'failed', 'refunded'], default: 'created' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

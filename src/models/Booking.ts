import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  clientId: Types.ObjectId;
  destination: string;
  travelDate: Date;
  returnDate: Date;
  travelers: number;
  services: string[];
  totalAmount: number;
  currency: string;
  conversionRate: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  attachments?: Array<{
    type: string;
    url: string;
    name?: string;
    description?: string;
  }>;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  destination: { type: String, required: true },
  travelDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  travelers: { type: Number, required: true, min: 1 },
  services: [{ type: String }],
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR', uppercase: true, trim: true },
  conversionRate: { type: Number, default: 1 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  notes: { type: String, default: '' },
  attachments: [
    {
      type: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  countryCode: string;
  alternatePhone: string;
  company: string;
  avatar: string;
  isVerified: boolean;
  verificationToken: string | null;
  tokenExpiry: Date | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  createdAt: Date;
}

const ClientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  countryCode: { type: String, default: '+91' },
  alternatePhone: { type: String, default: '' },
  company: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  tokenExpiry: { type: Date, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

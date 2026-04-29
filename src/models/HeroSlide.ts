import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroSlide extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  location?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

const HeroSlideSchema = new Schema<IHeroSlide>({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  imageUrl: { type: String, required: true },
  ctaText: { type: String },
  ctaLink: { type: String },
  location: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.HeroSlide || mongoose.model<IHeroSlide>('HeroSlide', HeroSlideSchema);

// Utility to seed current hero section data from the live DB
import mongoose from 'mongoose';
import fs from 'fs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skybirds';

async function exportCurrentHeroSlides() {
  await mongoose.connect(MONGODB_URI);
  const HeroSlideSchema = new mongoose.Schema({
    title: String,
    subtitle: String,
    imageUrl: String,
    ctaText: String,
    ctaLink: String,
    location: String,
    order: Number,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  });
  const HeroSlide = mongoose.models.HeroSlide || mongoose.model('HeroSlide', HeroSlideSchema);
  const slides = await HeroSlide.find({}).sort({ order: 1, createdAt: -1 });
  fs.writeFileSync('hero-slides-export.json', JSON.stringify(slides, null, 2));
  console.log('✓ Exported current hero slides to hero-slides-export.json');
  process.exit(0);
}

exportCurrentHeroSlides();

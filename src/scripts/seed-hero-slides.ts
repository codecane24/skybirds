import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skybirds';

async function seedHeroSlides() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

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

  await HeroSlide.deleteMany({});
  await HeroSlide.insertMany([
    {
      title: 'FLY BEYOND BOUNDARIES',
      subtitle: '',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      ctaText: 'Connect to Plan',
      ctaLink: '#',
      location: 'New Zealand',
      order: 1,
      isActive: true,
    },
    {
      title: 'DISCOVER NEW HORIZONS',
      subtitle: '',
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
      ctaText: 'Start Your Journey',
      ctaLink: '#',
      location: 'Switzerland',
      order: 2,
      isActive: true,
    },
  ]);
  console.log('✓ Hero slides seeded');
  process.exit(0);
}

seedHeroSlides();

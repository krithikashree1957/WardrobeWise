/**
 * Seeds the database with a demo user, sample wardrobe items, and an
 * outfit so the app is immediately explorable after `npm run seed`.
 *
 * Usage: npm run seed  (from /backend)
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { ClothingItem } from '../models/ClothingItem';
import { Outfit } from '../models/Outfit';
import { Avatar } from '../models/Avatar';

const DEMO_EMAIL = 'demo@wardrobewise.app';

async function seed() {
  await connectDB();

  console.log('[seed] Clearing existing demo data...');
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    await ClothingItem.deleteMany({ owner: existing._id });
    await Outfit.deleteMany({ owner: existing._id });
    await Avatar.deleteMany({ owner: existing._id });
    await existing.deleteOne();
  }

  console.log('[seed] Creating demo user...');
  const user = await User.create({
    fullName: 'Alex Morgan',
    email: DEMO_EMAIL,
    password: 'Password123!',
    age: 28,
    gender: 'women',
    heightCm: 168,
    weightKg: 60,
    skinTone: '#D2A578',
    bodyShape: 'hourglass',
    fashionPreferences: ['Minimal', 'Chic', 'Business'],
    country: 'United Kingdom',
    city: 'London',
    isEmailVerified: true,
  });

  await Avatar.create({
    owner: user._id,
    hairStyle: 'long-wavy',
    hairColor: '#3B2A20',
    faceShape: 'oval',
    skinTone: '#D2A578',
    heightCm: 168,
    bodyShape: 'hourglass',
  });

  console.log('[seed] Creating sample wardrobe items...');
  const sampleImages = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=600',
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600',
  ];

  const items = await ClothingItem.insertMany([
    {
      owner: user._id, imageUrl: sampleImages[0], category: 'top', material: 'cashmere', brand: 'Everlane',
      color: 'black', pattern: 'solid', sleeveLength: 'long', season: ['autumn', 'winter'],
      occasion: ['office', 'casual'], price: 89, timesWorn: 6, laundryStatus: 'clean', isFavorite: true,
      aiDetection: { clothingType: 'sweater', fabric: 'cashmere', color: 'black', pattern: 'solid', sleeveLength: 'long', formality: 'smart-casual', confidenceScore: 94 },
    },
    {
      owner: user._id, imageUrl: sampleImages[1], category: 'jeans', material: 'denim', brand: 'Levi\'s',
      color: 'indigo', pattern: 'solid', season: ['all-season'], occasion: ['casual', 'college'],
      price: 70, timesWorn: 12, laundryStatus: 'worn-once',
      aiDetection: { clothingType: 'jeans', fabric: 'denim', color: 'indigo', pattern: 'solid', sleeveLength: 'n/a', formality: 'casual', confidenceScore: 97 },
    },
    {
      owner: user._id, imageUrl: sampleImages[2], category: 'shoes', material: 'leather', brand: 'Common Projects',
      color: 'white', pattern: 'solid', season: ['all-season'], occasion: ['casual', 'office'],
      price: 210, timesWorn: 20, laundryStatus: 'clean',
    },
    {
      owner: user._id, imageUrl: sampleImages[3], category: 'jacket', material: 'wool blend', brand: 'COS',
      color: 'beige', pattern: 'solid', season: ['autumn', 'winter'], occasion: ['office', 'vacation'],
      price: 180, timesWorn: 3, laundryStatus: 'clean', isFavorite: true,
    },
    {
      owner: user._id, imageUrl: sampleImages[4], category: 'dress', material: 'silk', brand: 'Reformation',
      color: 'burgundy', pattern: 'solid', season: ['spring', 'summer'], occasion: ['party', 'wedding'],
      price: 145, timesWorn: 1, laundryStatus: 'needs-washing',
    },
    {
      owner: user._id, imageUrl: sampleImages[5], category: 'bag', material: 'leather', brand: 'Polène',
      color: 'tan', pattern: 'solid', season: ['all-season'], occasion: ['office', 'casual'],
      price: 320, timesWorn: 15, laundryStatus: 'clean', isFavorite: true,
    },
  ]);

  console.log('[seed] Creating a sample outfit...');
  await Outfit.create({
    owner: user._id,
    name: 'Effortless Professional',
    top: items[0]._id,
    bottom: items[1]._id,
    shoes: items[2]._id,
    accessories: [items[5]._id],
    mood: 'confident',
    occasion: 'office',
    weatherContext: { tempC: 22, condition: 'Clear', city: 'London' },
    confidenceScore: 92,
    reasoning: {
      weatherSuitability: 'Suited for 22°C, clear conditions.',
      occasionSuitability: 'Appropriate formality level for office.',
      colorHarmony: 'Uses a monochromatic color relationship for visual balance.',
      comfortScore: 82,
      overallReasoning: 'This combination balances color harmony, comfort, and occasion appropriateness for a confident professional look.',
    },
    colorTheoryScheme: 'monochromatic',
    isSaved: true,
  });

  console.log('[seed] Done! Demo login: demo@wardrobewise.app / Password123!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});

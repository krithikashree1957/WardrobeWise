// Shared frontend types - mirrors backend Mongoose schemas (see /backend/src/models)

export type ClothingCategory =
  | 'top' | 'shirt' | 'pants' | 'jeans' | 'dress' | 'saree'
  | 'shoes' | 'bag' | 'watch' | 'jewellery' | 'jacket' | 'accessory';

export type LaundryStatus = 'clean' | 'worn-once' | 'needs-washing' | 'ironed';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season';
export type Occasion =
  | 'college' | 'office' | 'interview' | 'party' | 'wedding' | 'festival' | 'vacation' | 'gym' | 'casual';
export type Mood =
  | 'happy' | 'confident' | 'professional' | 'romantic' | 'creative' | 'casual' | 'relaxed' | 'energetic';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  skinTone?: string;
  bodyShape?: string;
  fashionPreferences: string[];
  country?: string;
  city?: string;
  createdAt: string;
}

export interface AIDetection {
  clothingType?: string;
  fabric?: string;
  color?: string;
  pattern?: string;
  sleeveLength?: string;
  formality?: string;
  confidenceScore?: number;
  note?: string;
}

export interface ClothingItem {
  _id: string;
  owner: string;
  imageUrl: string;
  category: ClothingCategory;
  material?: string;
  brand?: string;
  color: string;
  pattern?: string;
  sleeveLength?: string;
  season: Season[];
  occasion: Occasion[];
  purchaseDate?: string;
  price?: number;
  notes?: string;
  aiDetection?: AIDetection;
  laundryStatus: LaundryStatus;
  isFavorite: boolean;
  timesWorn: number;
  lastWornAt?: string;
  createdAt: string;
}

export interface OutfitReasoning {
  weatherSuitability?: string;
  occasionSuitability?: string;
  colorHarmony?: string;
  comfortScore?: number;
  overallReasoning?: string;
}

export interface Outfit {
  _id: string;
  name: string;
  top?: ClothingItem;
  bottom?: ClothingItem;
  shoes?: ClothingItem;
  accessories: ClothingItem[];
  outerwear?: ClothingItem;
  mood?: string;
  occasion?: string;
  weatherContext?: { tempC?: number; condition?: string; city?: string };
  confidenceScore: number;
  reasoning: OutfitReasoning;
  colorTheoryScheme?: string;
  isSaved: boolean;
  isWorn: boolean;
  createdAt: string;
}

export interface WeatherSnapshot {
  tempC: number;
  feelsLikeC: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  city: string;
}

export interface Avatar {
  _id: string;
  hairStyle: string;
  hairColor: string;
  faceShape: string;
  skinTone: string;
  heightCm: number;
  bodyShape: string;
  provider: 'internal' | 'ready-player-me';
  externalAvatarUrl?: string;
}

export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface PackingListItem {
  _id?: string;
  label: string;
  category: string;
  packed: boolean;
}

export interface PackingList {
  _id: string;
  destination: string;
  days: number;
  expectedWeather?: { tempMinC?: number; tempMaxC?: number; condition?: string };
  items: PackingListItem[];
  createdAt: string;
}

export interface ShoppingSuggestion {
  _id: string;
  imageUrl: string;
  detectedCategory?: string;
  detectedColor?: string;
  completesOutfits: number;
  worthBuyingScore: number;
  verdict: 'worth-it' | 'redundant' | 'situational';
  reasoning?: string;
  createdAt: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  price: number;
  imageUrl: string;
  store: 'Amazon' | 'Myntra' | 'Flipkart';
  buyUrl: string;
  occasion: Occasion[];
  season: Season[];
  matchScore: number;
}

export interface MarketplaceRecommendation {
  category: ClothingCategory;
  reason: string;
  products: MarketplaceProduct[];
}

export interface WardrobeStatistics {
  totalClothes: number;
  favoriteColor: string | null;
  favoriteBrand: string | null;
  mostWornItems: ClothingItem[];
  leastWornItems: ClothingItem[];
  monthlyUsage: { month: string; count: number }[];
}

export interface SustainabilityDashboard {
  costPerWear: { itemId: string; costPerWear: number }[];
  mostUsed: ClothingItem[];
  leastUsed: ClothingItem[];
  unusedCount: number;
  donationSuggestions: { item: ClothingItem; reason: string }[];
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

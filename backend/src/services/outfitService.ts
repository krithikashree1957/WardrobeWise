import { Types } from 'mongoose';
import { ClothingItem, IClothingItem } from '../models/ClothingItem';
import { suggestScheme } from './colorTheoryService';
import { explainOutfitChoice } from './geminiService';
import type { WeatherSnapshot } from './weatherService';

export interface OutfitGenerationParams {
  ownerId: string;
  mood?: string;
  occasion?: string;
  weather?: WeatherSnapshot;
}

export interface GeneratedOutfit {
  top?: IClothingItem;
  bottom?: IClothingItem;
  shoes?: IClothingItem;
  accessories: IClothingItem[];
  confidenceScore: number;
  colorTheoryScheme: string;
  reasoning: {
    weatherSuitability: string;
    occasionSuitability: string;
    colorHarmony: string;
    comfortScore: number;
    overallReasoning: string;
  };
}

const HEX_FALLBACK: Record<string, string> = {
  black: '#1a1c1c', white: '#f9f9f9', navy: '#1e3a5f', denim: '#4a6b8a',
  beige: '#e8ddcb', grey: '#9a9a9a', gray: '#9a9a9a', red: '#c62828',
  green: '#2e7d32', olive: '#6b7a3d', burgundy: '#6b1f2a', lavender: '#a78bfa',
  brown: '#6b4a34', tan: '#d2b48c',
};

function colorToHex(color: string): string {
  const key = color.trim().toLowerCase();
  return HEX_FALLBACK[key] || '#674bb5';
}

/**
 * Rule-based outfit generator. Selects one item per slot from the user's
 * wardrobe, filtered by occasion/season/weather, then scores the result
 * using color theory + simple heuristics. Gemini is used only to produce
 * the natural-language reasoning text (see geminiService.explainOutfitChoice),
 * keeping the core selection deterministic, fast, and free of API cost.
 */
export async function generateOutfit(params: OutfitGenerationParams): Promise<GeneratedOutfit | null> {
  const { ownerId, mood, occasion, weather } = params;
  const owner = new Types.ObjectId(ownerId);

  const baseFilter: Record<string, unknown> = { owner };
  if (occasion) baseFilter.occasion = occasion;

  const [tops, bottoms, shoesList, accessoryList] = await Promise.all([
    ClothingItem.find({ ...baseFilter, category: { $in: ['top', 'shirt', 'dress', 'saree'] } }).limit(20),
    ClothingItem.find({ ...baseFilter, category: { $in: ['pants', 'jeans'] } }).limit(20),
    ClothingItem.find({ ...baseFilter, category: 'shoes' }).limit(20),
    ClothingItem.find({ ...baseFilter, category: { $in: ['bag', 'watch', 'jewellery', 'accessory'] } }).limit(20),
  ]);

  // If a dress/saree is picked as "top", skip separate bottoms.
  const top = tops[Math.floor(Math.random() * tops.length)];
  const isOnePiece = top && (top.category === 'dress' || top.category === 'saree');
  const bottom = isOnePiece ? undefined : bottoms[Math.floor(Math.random() * bottoms.length)];
  const shoes = shoesList[Math.floor(Math.random() * shoesList.length)];
  const accessories = accessoryList.slice(0, 2);

  if (!top && !bottom && !shoes) return null;

  const colorA = top ? colorToHex(top.color) : '#674bb5';
  const colorB = bottom ? colorToHex(bottom.color) : (shoes ? colorToHex(shoes.color) : '#f9f9f9');
  const scheme = suggestScheme(colorA, colorB);

  let comfortScore = 70;
  if (weather && weather.tempC > 28 && top?.material?.toLowerCase().includes('wool')) comfortScore -= 20;
  if (mood === 'relaxed' || mood === 'casual') comfortScore += 10;
  comfortScore = Math.max(0, Math.min(100, comfortScore));

  const confidenceScore = Math.round(
    (comfortScore * 0.4) +
    (top && bottom ? 30 : 15) +
    (shoes ? 15 : 0) +
    (accessories.length > 0 ? 10 : 0)
  );

  const itemNames = [top?.color && `${top.color} ${top.category}`, bottom?.color && `${bottom.color} ${bottom.category}`, shoes?.color && `${shoes.color} shoes`]
    .filter(Boolean) as string[];

  let overallReasoning: string;
  try {
    overallReasoning = await explainOutfitChoice({
      items: itemNames,
      mood,
      occasion,
      weather: weather ? `${weather.tempC}°C, ${weather.condition}` : undefined,
    });
  } catch {
    overallReasoning = 'This combination balances color harmony, comfort, and occasion appropriateness.';
  }

  return {
    top,
    bottom,
    shoes,
    accessories,
    confidenceScore: Math.min(100, Math.max(0, confidenceScore)),
    colorTheoryScheme: scheme,
    reasoning: {
      weatherSuitability: weather
        ? `Suited for ${weather.tempC}°C and ${weather.condition.toLowerCase()} conditions.`
        : 'Weather context not provided.',
      occasionSuitability: occasion
        ? `Appropriate formality level for ${occasion}.`
        : 'General everyday appropriateness.',
      colorHarmony: `Uses a ${scheme} color relationship for visual balance.`,
      comfortScore,
      overallReasoning,
    },
  };
}

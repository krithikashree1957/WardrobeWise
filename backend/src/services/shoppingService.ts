import { ClothingItem, IClothingItem } from '../models/ClothingItem';
import { Types } from 'mongoose';
import { suggestScheme } from './colorTheoryService';

/**
 * Compares a candidate (potential purchase) item against the user's
 * existing wardrobe to estimate how well it would integrate, whether it
 * duplicates existing pieces, and how many "new" outfits it could unlock.
 */
export async function evaluateShoppingCandidate(
  ownerId: string,
  candidate: { category: string; color: string }
) {
  const owner = new Types.ObjectId(ownerId);
  const wardrobe: IClothingItem[] = await ClothingItem.find({ owner });

  const sameCategory = wardrobe.filter((i) => i.category === candidate.category);
  const complementaryCategories = wardrobe.filter((i) => i.category !== candidate.category);

  const matches = complementaryCategories.filter((item) => {
    const scheme = suggestScheme(item.color, candidate.color);
    return scheme === 'analogous' || scheme === 'monochromatic' || scheme === 'complementary';
  });

  const isDuplicate = sameCategory.some(
    (i) => i.color.toLowerCase() === candidate.color.toLowerCase()
  );

  const completesOutfits = Math.min(matches.length, 10);
  let worthBuyingScore = Math.min(100, matches.length * 8 + 20);
  let verdict: 'worth-it' | 'redundant' | 'situational' = 'situational';

  if (isDuplicate) {
    worthBuyingScore = Math.max(10, worthBuyingScore - 40);
    verdict = 'redundant';
  } else if (worthBuyingScore >= 60) {
    verdict = 'worth-it';
  }

  const reasoning = isDuplicate
    ? `You already own similar ${candidate.color} ${candidate.category} pieces - this may be redundant.`
    : `This pairs well with ${matches.length} item(s) already in your wardrobe and could unlock ~${completesOutfits} new outfit combinations.`;

  return {
    matchesWardrobe: matches.map((m) => m._id),
    completesOutfits,
    worthBuyingScore,
    verdict,
    reasoning,
  };
}

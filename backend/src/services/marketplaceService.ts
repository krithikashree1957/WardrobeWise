import { ClothingCategory, IClothingItem, Occasion, Season } from '../models/ClothingItem';
import { getProductCatalog, MarketplaceProduct } from './marketplaceCatalogService';

export interface WardrobeGap {
  category: ClothingCategory;
  reason: string;
}

export interface ScoredProduct extends MarketplaceProduct {
  matchScore: number;
}

export interface MarketplaceRecommendation {
  category: ClothingCategory;
  reason: string;
  products: ScoredProduct[];
}

const NEUTRAL_COLORS = new Set([
  'white', 'black', 'grey', 'gray', 'navy', 'beige', 'brown', 'tan', 'silver', 'gold', 'cream', 'khaki',
]);

/**
 * Rule-based "what's missing" detector.
 *
 * Each rule looks at which categories the user already owns and, if a
 * practical companion piece is absent, records a gap with a
 * human-readable reason. This mirrors how a stylist would reason about a
 * wardrobe: "you have a shirt and jeans, but no shoes/watch/belt to
 * finish the look."
 */
interface GapRule {
  id: string;
  category: ClothingCategory;
  matches: (owned: Set<ClothingCategory>, wardrobe: IClothingItem[]) => boolean;
  reason: string;
}

const GAP_RULES: GapRule[] = [
  {
    id: 'footwear-for-topbottom',
    category: 'shoes',
    matches: (owned) =>
      (owned.has('shirt') || owned.has('top')) && (owned.has('pants') || owned.has('jeans')) && !owned.has('shoes'),
    reason: 'You have tops and bottoms logged but no footwear - shoes would complete these outfits.',
  },
  {
    id: 'watch-for-topbottom',
    category: 'watch',
    matches: (owned) =>
      (owned.has('shirt') || owned.has('top')) && (owned.has('pants') || owned.has('jeans')) && !owned.has('watch'),
    reason: 'A watch would add a polished finishing touch to your shirt-and-pants combinations.',
  },
  {
    id: 'accessory-for-topbottom',
    category: 'accessory',
    matches: (owned) =>
      (owned.has('shirt') || owned.has('top')) && (owned.has('pants') || owned.has('jeans')) && !owned.has('accessory'),
    reason: 'An accessory like a belt would tie your shirt-and-pants outfits together.',
  },
  {
    id: 'bag-for-topbottom',
    category: 'bag',
    matches: (owned) =>
      (owned.has('shirt') || owned.has('top')) && (owned.has('pants') || owned.has('jeans')) && !owned.has('bag'),
    reason: 'A bag is missing from your everyday outfits.',
  },
  {
    id: 'jewellery-for-saree',
    category: 'jewellery',
    matches: (owned) => owned.has('saree') && !owned.has('jewellery'),
    reason: 'Your ethnic wear has no jewellery logged yet - earrings or a necklace would elevate it.',
  },
  {
    id: 'bag-for-saree',
    category: 'bag',
    matches: (owned) => owned.has('saree') && !owned.has('bag'),
    reason: 'A clutch would complement your ethnic wear.',
  },
  {
    id: 'footwear-for-saree',
    category: 'shoes',
    matches: (owned) => owned.has('saree') && !owned.has('shoes'),
    reason: 'Matching footwear would complete your ethnic looks.',
  },
  {
    id: 'jewellery-for-dress',
    category: 'jewellery',
    matches: (owned) => owned.has('dress') && !owned.has('jewellery'),
    reason: 'Jewellery would add polish to your dresses.',
  },
  {
    id: 'footwear-for-dress',
    category: 'shoes',
    matches: (owned) => owned.has('dress') && !owned.has('shoes'),
    reason: 'Footwear is missing to pair with your dresses.',
  },
  {
    id: 'jacket-for-cold-season',
    category: 'jacket',
    matches: (owned, wardrobe) =>
      !owned.has('jacket') && wardrobe.some((i) => i.season?.includes('winter') || i.season?.includes('autumn')),
    reason: 'You own pieces for colder weather but no outerwear - a jacket would help you layer.',
  },
  {
    id: 'bag-general',
    category: 'bag',
    matches: (owned) => owned.size >= 2 && !owned.has('bag'),
    reason: 'A versatile bag would round out your wardrobe.',
  },
];

/** Finds up to `maxGaps` distinct missing-category gaps for a wardrobe. */
export function analyzeWardrobeGaps(wardrobe: IClothingItem[], maxGaps = 4): WardrobeGap[] {
  const owned = new Set<ClothingCategory>(wardrobe.map((i) => i.category));
  const gaps: WardrobeGap[] = [];
  const seenCategories = new Set<ClothingCategory>();

  for (const rule of GAP_RULES) {
    if (seenCategories.has(rule.category)) continue;
    if (rule.matches(owned, wardrobe)) {
      gaps.push({ category: rule.category, reason: rule.reason });
      seenCategories.add(rule.category);
    }
    if (gaps.length >= maxGaps) break;
  }

  return gaps;
}

/** Returns the most frequent value in an array of strings/enums, if any. */
function mostFrequent<T extends string>(values: T[]): T | undefined {
  if (values.length === 0) return undefined;
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  let best: T | undefined;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

interface WardrobeContext {
  dominantColor?: string;
  dominantOccasion?: Occasion;
  dominantSeason?: Season;
}

function buildWardrobeContext(wardrobe: IClothingItem[]): WardrobeContext {
  return {
    dominantColor: mostFrequent(wardrobe.map((i) => i.color.toLowerCase())),
    dominantOccasion: mostFrequent(wardrobe.flatMap((i) => i.occasion || [])),
    dominantSeason: mostFrequent(wardrobe.flatMap((i) => i.season || [])),
  };
}

/**
 * Scores a candidate product for how well it would coordinate with the
 * user's existing wardrobe. Higher is better; capped at 100.
 */
function scoreProduct(candidate: MarketplaceProduct, ctx: WardrobeContext): number {
  let score = 40;
  const colorLower = candidate.color.toLowerCase();

  if (NEUTRAL_COLORS.has(colorLower)) score += 20;
  if (ctx.dominantColor && colorLower === ctx.dominantColor) score += 15;
  if (ctx.dominantOccasion && candidate.occasion.includes(ctx.dominantOccasion)) score += 15;
  else if (candidate.occasion.includes('casual')) score += 5;
  if (ctx.dominantSeason && (candidate.season.includes(ctx.dominantSeason) || candidate.season.includes('all-season'))) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Builds the full set of marketplace recommendations for a wardrobe:
 * finds the gaps, then scores and ranks catalog products for each gap.
 */
export function buildMarketplaceRecommendations(
  wardrobe: IClothingItem[],
  perCategoryLimit = 3
): MarketplaceRecommendation[] {
  const gaps = analyzeWardrobeGaps(wardrobe);
  if (gaps.length === 0) return [];

  const ctx = buildWardrobeContext(wardrobe);
  const catalog = getProductCatalog();

  return gaps
    .map((gap) => {
      const products: ScoredProduct[] = catalog
        .filter((p) => p.category === gap.category)
        .map((p) => ({ ...p, matchScore: scoreProduct(p, ctx) }))
        .sort((a, b) => b.matchScore - a.matchScore || a.price - b.price)
        .slice(0, perCategoryLimit);

      return { category: gap.category, reason: gap.reason, products };
    })
    .filter((rec) => rec.products.length > 0);
}

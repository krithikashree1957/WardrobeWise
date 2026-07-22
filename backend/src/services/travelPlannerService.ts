import { ClothingCategory, IClothingItem, Occasion } from '../models/ClothingItem';
import { ITravelChecklistItem, ITravelDayPlan, ITravelOutfitSlot, TravelOutfitSlotName } from '../models/TravelPlan';
import type { WeatherSnapshot } from './weatherService';
import { WardrobeGap } from './marketplaceService';

/**
 * Maps a free-text travel "purpose" (Tourism, Business, College, Wedding,
 * Vacation, Casual, ...) to the closest existing `Occasion` enum value so
 * it can drive checklist rules and daily-outfit selection the same way
 * an item's `occasion` field does elsewhere in the app.
 */
export function purposeToOccasion(purpose: string): Occasion {
  const key = purpose.trim().toLowerCase();
  const map: Record<string, Occasion> = {
    tourism: 'vacation',
    vacation: 'vacation',
    holiday: 'vacation',
    business: 'office',
    work: 'office',
    office: 'office',
    college: 'college',
    school: 'college',
    wedding: 'wedding',
    festival: 'festival',
    interview: 'interview',
    party: 'party',
    gym: 'gym',
    casual: 'casual',
  };
  return map[key] || 'casual';
}

interface ChecklistRule {
  label: string;
  category: ClothingCategory;
  /** Any of these categories in the wardrobe count as satisfying this rule. */
  matchCategories: ClothingCategory[];
  condition: (ctx: RuleContext) => boolean;
}

interface RuleContext {
  tempC: number;
  weatherCondition: string;
  days: number;
  occasion: Occasion;
}

const CHECKLIST_RULES: ChecklistRule[] = [
  {
    label: 'Everyday Tops',
    category: 'top',
    matchCategories: ['top', 'shirt'],
    condition: () => true,
  },
  {
    label: 'Comfortable Bottoms',
    category: 'jeans',
    matchCategories: ['jeans', 'pants'],
    condition: () => true,
  },
  {
    label: 'Walking Shoes / Sneakers',
    category: 'shoes',
    matchCategories: ['shoes'],
    condition: () => true,
  },
  {
    label: 'Daily Bag',
    category: 'bag',
    matchCategories: ['bag'],
    condition: () => true,
  },
  {
    label: 'Winter Jacket',
    category: 'jacket',
    matchCategories: ['jacket'],
    condition: (ctx) => ctx.tempC <= 15,
  },
  {
    label: 'Thermal Wear',
    category: 'jacket',
    matchCategories: ['jacket'],
    condition: (ctx) => ctx.tempC <= 5,
  },
  {
    label: 'Gloves',
    category: 'accessory',
    matchCategories: ['accessory'],
    condition: (ctx) => ctx.tempC <= 5,
  },
  {
    label: 'Sunglasses',
    category: 'accessory',
    matchCategories: ['accessory'],
    condition: (ctx) => ctx.tempC >= 24,
  },
  {
    label: 'Umbrella',
    category: 'accessory',
    matchCategories: ['accessory'],
    condition: (ctx) => /rain|drizzle|thunderstorm/i.test(ctx.weatherCondition),
  },
  {
    label: 'Rain Coat',
    category: 'jacket',
    matchCategories: ['jacket'],
    condition: (ctx) => /rain|drizzle|thunderstorm/i.test(ctx.weatherCondition),
  },
  {
    label: 'Snow Boots',
    category: 'shoes',
    matchCategories: ['shoes'],
    condition: (ctx) => /snow/i.test(ctx.weatherCondition),
  },
  {
    label: 'Formal Shirt',
    category: 'shirt',
    matchCategories: ['shirt'],
    condition: (ctx) => ctx.occasion === 'office' || ctx.occasion === 'interview',
  },
  {
    label: 'Watch',
    category: 'watch',
    matchCategories: ['watch'],
    condition: (ctx) => ctx.occasion === 'office' || ctx.occasion === 'interview' || ctx.occasion === 'wedding',
  },
  {
    label: 'Ethnic / Formal Outfit',
    category: 'dress',
    matchCategories: ['dress', 'saree'],
    condition: (ctx) => ctx.occasion === 'wedding' || ctx.occasion === 'festival',
  },
  {
    label: 'Jewellery',
    category: 'jewellery',
    matchCategories: ['jewellery'],
    condition: (ctx) => ctx.occasion === 'wedding' || ctx.occasion === 'festival' || ctx.occasion === 'party',
  },
  {
    label: 'Extra Layer for Longer Trip',
    category: 'top',
    matchCategories: ['top', 'shirt'],
    condition: (ctx) => ctx.days >= 5,
  },
];

/**
 * Builds a named packing checklist (not yet matched against the
 * wardrobe) from expected weather, trip length, and purpose.
 */
export function buildTravelChecklist(
  weather: WeatherSnapshot,
  days: number,
  purpose: string
): { label: string; category: ClothingCategory; matchCategories: ClothingCategory[] }[] {
  const ctx: RuleContext = {
    tempC: weather.tempC,
    weatherCondition: weather.condition,
    days,
    occasion: purposeToOccasion(purpose),
  };

  return CHECKLIST_RULES.filter((rule) => rule.condition(ctx)).map((rule) => ({
    label: rule.label,
    category: rule.category,
    matchCategories: rule.matchCategories,
  }));
}

/**
 * Compares the generated checklist against the user's wardrobe and marks
 * each entry as already-available (with the matched item) or missing.
 */
export function matchChecklistAgainstWardrobe(
  checklist: { label: string; category: ClothingCategory; matchCategories: ClothingCategory[] }[],
  wardrobe: IClothingItem[]
): ITravelChecklistItem[] {
  return checklist.map((entry) => {
    const matched = wardrobe.find((item) => entry.matchCategories.includes(item.category));
    return {
      label: entry.label,
      category: entry.category,
      available: Boolean(matched),
      matchedItem: matched?._id,
    };
  });
}

/** Turns the missing checklist entries into wardrobe gaps for the shared recommendation engine. */
export function checklistToGaps(checklist: ITravelChecklistItem[], destination: string): WardrobeGap[] {
  const seen = new Set<ClothingCategory>();
  const gaps: WardrobeGap[] = [];

  for (const item of checklist) {
    if (item.available || seen.has(item.category)) continue;
    seen.add(item.category);
    gaps.push({
      category: item.category,
      reason: `You'll need a "${item.label}" for your trip to ${destination}, and don't have one in your wardrobe yet.`,
    });
  }

  return gaps;
}

const SLOTS: TravelOutfitSlotName[] = ['morning', 'afternoon', 'evening', 'night'];

/** Picks the nth item from a list, cycling around so trips longer than the wardrobe still get a suggestion. */
function pick<T>(list: T[], index: number): T | undefined {
  if (list.length === 0) return undefined;
  return list[index % list.length];
}

/**
 * Generates a day-by-day outfit plan for the whole trip. Reuses the same
 * top/bottom/shoes/outerwear/accessories shape as the existing Outfit
 * model, so the frontend can render it with the same item-thumbnail
 * pattern used on the Outfits page. Selection is deterministic (rotates
 * through matching wardrobe items) rather than calling an LLM, keeping it
 * fast and free of external API cost for potentially many day/slot
 * combinations.
 */
export function buildDailyOutfitPlan(
  days: number,
  wardrobe: IClothingItem[],
  weather: WeatherSnapshot,
  purpose: string
): ITravelDayPlan[] {
  const occasion = purposeToOccasion(purpose);
  const isFormalTrip = occasion === 'office' || occasion === 'interview' || occasion === 'wedding';
  const isCold = weather.tempC <= 15;

  const tops = wardrobe.filter((i) => ['top', 'shirt'].includes(i.category));
  const formalTops = wardrobe.filter((i) => i.category === 'shirt');
  const onePieces = wardrobe.filter((i) => ['dress', 'saree'].includes(i.category));
  const bottoms = wardrobe.filter((i) => ['pants', 'jeans'].includes(i.category));
  const shoesList = wardrobe.filter((i) => i.category === 'shoes');
  const outerwear = wardrobe.filter((i) => i.category === 'jacket');
  const accessoryPool = wardrobe.filter((i) => ['bag', 'watch', 'jewellery', 'accessory'].includes(i.category));

  const dayPlans: ITravelDayPlan[] = [];

  for (let day = 1; day <= days; day++) {
    const slots: ITravelOutfitSlot[] = SLOTS.map((slotName, slotIndex) => {
      const rotation = (day - 1) * SLOTS.length + slotIndex;
      const wantsFormal = isFormalTrip && (slotName === 'evening' || slotName === 'afternoon');
      const wantsOnePiece = wantsFormal && onePieces.length > 0 && slotIndex % 2 === 0;

      const onePiece = wantsOnePiece ? pick(onePieces, rotation) : undefined;
      const regularTop = onePiece
        ? undefined
        : wantsFormal && formalTops.length > 0
        ? pick(formalTops, rotation)
        : pick(tops, rotation);
      const chosenTop = onePiece || regularTop;
      const bottom = onePiece ? undefined : pick(bottoms, rotation);
      const shoes = pick(shoesList, rotation);
      const needsOuterwear = isCold && (slotName === 'morning' || slotName === 'night');
      const outer = needsOuterwear ? pick(outerwear, rotation) : undefined;
      const accessory = accessoryPool.length > 0 ? pick(accessoryPool, rotation) : undefined;

      const missingParts: string[] = [];
      if (!chosenTop) missingParts.push('a top');
      if (!onePiece && !bottom) missingParts.push('bottoms');
      if (!shoes) missingParts.push('shoes');
      if (needsOuterwear && !outer) missingParts.push('a jacket');

      const note =
        missingParts.length > 0
          ? `No matching ${missingParts.join(', ')} in your wardrobe yet for this slot - check the Marketplace tab for options.`
          : `${slotName[0].toUpperCase()}${slotName.slice(1)} look for ${weather.tempC}°C, ${weather.condition.toLowerCase()} conditions${
              wantsFormal ? `, dressed up for ${purpose}` : ''
            }.`;

      return {
        slot: slotName,
        top: chosenTop?._id,
        bottom: bottom?._id,
        shoes: shoes?._id,
        outerwear: outer?._id,
        accessories: accessory ? [accessory._id] : [],
        note,
      };
    });

    dayPlans.push({ day, slots });
  }

  return dayPlans;
}

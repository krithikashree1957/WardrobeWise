import type { WeatherSnapshot } from './weatherService';
import type { IPackingItem } from '../models/PackingList';

/**
 * Generates a packing checklist from destination weather + trip length.
 * Quantities scale with number of days (with sensible caps).
 */
export function buildPackingChecklist(days: number, weather: WeatherSnapshot): IPackingItem[] {
  const items: IPackingItem[] = [];
  const push = (label: string, category: string) => items.push({ label, category, packed: false });

  const tops = Math.min(days, 7);
  const bottoms = Math.min(Math.ceil(days / 2), 5);
  const underwear = Math.min(days, 10);

  push(`${tops} tops / t-shirts`, 'clothing');
  push(`${bottoms} bottoms (pants/shorts)`, 'clothing');
  push(`${underwear} sets underwear & socks`, 'clothing');
  push('Comfortable walking shoes', 'footwear');

  if (weather.tempC <= 10) {
    push('Heavy jacket / coat', 'outerwear');
    push('Thermal layers', 'clothing');
    push('Beanie & gloves', 'accessory');
  } else if (weather.tempC <= 20) {
    push('Light jacket or sweater', 'outerwear');
  } else {
    push('Sunglasses', 'accessory');
    push('Sunscreen', 'toiletry');
    push('Light, breathable fabrics', 'clothing');
  }

  if (/rain/i.test(weather.condition)) {
    push('Compact umbrella', 'accessory');
    push('Waterproof jacket', 'outerwear');
  }
  if (/snow/i.test(weather.condition)) {
    push('Snow boots', 'footwear');
  }

  push('Toiletries kit', 'toiletry');
  push('Phone charger & adapter', 'electronics');
  push('One formal outfit (just in case)', 'clothing');

  return items;
}

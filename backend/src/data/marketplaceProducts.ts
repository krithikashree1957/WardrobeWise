import { ClothingCategory, Occasion, Season } from '../models/ClothingItem';

export type MarketplaceStore = 'Amazon' | 'Myntra' | 'Flipkart';

export interface MarketplaceProduct {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  price: number;
  imageUrl: string;
  store: MarketplaceStore;
  buyUrl: string;
  occasion: Occasion[];
  season: Season[];
}

/**
 * Demo product catalog for the AI Wardrobe Marketplace Assistant.
 *
 * This is intentionally a static, in-repo dataset (no scraping, no
 * third-party product APIs) so the feature works out of the box for a
 * student project. Each product's `buyUrl` points to a real store search
 * page (not a fabricated product page), so the "Buy" button always lands
 * somewhere valid.
 *
 * Swapping this out for a real catalog later only requires changing
 * `getProductCatalog()` in `marketplaceCatalogService.ts` to read from a
 * MongoDB collection or a live shopping API instead of this array - every
 * consumer of the catalog (marketplaceService, the controller) is written
 * against the `MarketplaceProduct` shape above, not against this file.
 */
function storeSearchUrl(store: MarketplaceStore, query: string): string {
  const q = encodeURIComponent(query);
  switch (store) {
    case 'Amazon':
      return `https://www.amazon.in/s?k=${q}`;
    case 'Myntra':
      return `https://www.myntra.com/${q.replace(/%20/g, '-')}`;
    case 'Flipkart':
    default:
      return `https://www.flipkart.com/search?q=${q}`;
  }
}

function product(
  id: string,
  name: string,
  category: ClothingCategory,
  color: string,
  price: number,
  store: MarketplaceStore,
  occasion: Occasion[],
  season: Season[]
): MarketplaceProduct {
  return {
    id,
    name,
    category,
    color,
    price,
    imageUrl: `https://placehold.co/400x400/EEE8F5/674bb5?text=${encodeURIComponent(name)}`,
    store,
    buyUrl: storeSearchUrl(store, name),
    occasion,
    season,
  };
}

export const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  // Footwear (shoes)
  product('shoes-001', 'White Sneakers', 'shoes', 'white', 45, 'Myntra', ['casual', 'college', 'vacation'], ['all-season']),
  product('shoes-002', 'Black Formal Derby Shoes', 'shoes', 'black', 65, 'Amazon', ['office', 'interview'], ['all-season']),
  product('shoes-003', 'Tan Loafers', 'shoes', 'tan', 55, 'Flipkart', ['office', 'casual'], ['all-season']),
  product('shoes-004', 'Silver Block Heels', 'shoes', 'silver', 40, 'Myntra', ['party', 'wedding'], ['all-season']),
  product('shoes-005', 'Gold Embellished Sandals', 'shoes', 'gold', 35, 'Flipkart', ['festival', 'wedding', 'party'], ['all-season']),
  product('shoes-006', 'Beige Espadrilles', 'shoes', 'beige', 30, 'Amazon', ['vacation', 'casual'], ['spring', 'summer']),

  // Watches
  product('watch-001', 'Silver Analog Watch', 'watch', 'silver', 38, 'Amazon', ['office', 'college', 'casual'], ['all-season']),
  product('watch-002', 'Black Chronograph Watch', 'watch', 'black', 60, 'Myntra', ['office', 'interview'], ['all-season']),
  product('watch-003', 'Gold-Tone Dress Watch', 'watch', 'gold', 70, 'Flipkart', ['wedding', 'party'], ['all-season']),

  // Accessories (belts, sunglasses, etc.)
  product('accessory-001', 'Black Leather Belt', 'accessory', 'black', 18, 'Amazon', ['office', 'college', 'casual'], ['all-season']),
  product('accessory-002', 'Brown Leather Belt', 'accessory', 'brown', 16, 'Flipkart', ['office', 'casual'], ['all-season']),
  product('accessory-003', 'Tortoise Sunglasses', 'accessory', 'brown', 20, 'Myntra', ['vacation', 'casual'], ['summer', 'spring']),
  product('accessory-004', 'Silk Pocket Square', 'accessory', 'navy', 12, 'Amazon', ['wedding', 'party', 'interview'], ['all-season']),

  // Bags
  product('bag-001', 'Black Structured Handbag', 'bag', 'black', 48, 'Myntra', ['office', 'casual'], ['all-season']),
  product('bag-002', 'Tan Crossbody Bag', 'bag', 'tan', 32, 'Amazon', ['casual', 'college', 'vacation'], ['all-season']),
  product('bag-003', 'Gold Embroidered Clutch', 'bag', 'gold', 28, 'Flipkart', ['wedding', 'festival', 'party'], ['all-season']),
  product('bag-004', 'Navy Laptop Tote', 'bag', 'navy', 52, 'Amazon', ['office', 'college'], ['all-season']),

  // Jewellery
  product('jewellery-001', 'Silver Drop Earrings', 'jewellery', 'silver', 15, 'Myntra', ['party', 'casual', 'college'], ['all-season']),
  product('jewellery-002', 'Gold Jhumka Earrings', 'jewellery', 'gold', 22, 'Flipkart', ['festival', 'wedding'], ['all-season']),
  product('jewellery-003', 'Pearl Necklace Set', 'jewellery', 'white', 30, 'Amazon', ['wedding', 'party'], ['all-season']),
  product('jewellery-004', 'Oxidised Silver Choker', 'jewellery', 'silver', 20, 'Myntra', ['festival', 'casual'], ['all-season']),

  // Jackets / outerwear
  product('jacket-001', 'Navy Bomber Jacket', 'jacket', 'navy', 60, 'Myntra', ['casual', 'college'], ['autumn', 'winter']),
  product('jacket-002', 'Black Denim Jacket', 'jacket', 'black', 52, 'Amazon', ['casual', 'college'], ['autumn', 'winter']),
  product('jacket-003', 'Beige Trench Coat', 'jacket', 'beige', 85, 'Flipkart', ['office', 'casual'], ['autumn', 'winter']),
  product('jacket-004', 'Grey Wool Blazer', 'jacket', 'grey', 90, 'Amazon', ['office', 'interview'], ['autumn', 'winter']),

  // Tops / shirts
  product('shirt-001', 'White Cotton Shirt', 'shirt', 'white', 28, 'Myntra', ['office', 'interview', 'college'], ['all-season']),
  product('shirt-002', 'Light Blue Formal Shirt', 'shirt', 'blue', 32, 'Amazon', ['office', 'interview'], ['all-season']),
  product('top-001', 'White Basic Tee', 'top', 'white', 15, 'Flipkart', ['casual', 'college', 'gym'], ['all-season']),
  product('top-002', 'Black Fitted Top', 'top', 'black', 18, 'Myntra', ['party', 'casual'], ['all-season']),

  // Bottoms
  product('pants-001', 'Black Tailored Trousers', 'pants', 'black', 35, 'Amazon', ['office', 'interview'], ['all-season']),
  product('jeans-001', 'Black Slim-Fit Jeans', 'jeans', 'black', 40, 'Myntra', ['casual', 'college'], ['all-season']),
  product('jeans-002', 'Blue Straight-Fit Jeans', 'jeans', 'blue', 38, 'Flipkart', ['casual', 'college'], ['all-season']),

  // Dresses & ethnic wear
  product('dress-001', 'Navy Wrap Dress', 'dress', 'navy', 50, 'Myntra', ['office', 'party'], ['all-season']),
  product('dress-002', 'Floral Summer Dress', 'dress', 'white', 38, 'Amazon', ['vacation', 'casual'], ['summer', 'spring']),
  product('saree-001', 'Maroon Silk Saree', 'saree', 'maroon', 70, 'Flipkart', ['wedding', 'festival'], ['all-season']),
  product('saree-002', 'Blue Georgette Saree', 'saree', 'blue', 50, 'Myntra', ['festival', 'party'], ['all-season']),
];

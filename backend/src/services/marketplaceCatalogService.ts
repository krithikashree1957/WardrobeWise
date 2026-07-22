import { MARKETPLACE_PRODUCTS, MarketplaceProduct } from '../data/marketplaceProducts';

/**
 * Single seam between the recommendation engine and the underlying
 * product source. Today it returns the static in-repo dataset; later
 * this can be swapped to query a MongoDB `Product` collection or call a
 * real shopping API (Amazon/Myntra/Flipkart affiliate APIs, etc.)
 * without touching `marketplaceService.ts` or the controller, since both
 * only depend on the `MarketplaceProduct[]` shape returned here.
 */
export function getProductCatalog(): MarketplaceProduct[] {
  return MARKETPLACE_PRODUCTS;
}

export function getProductsByCategory(category: string): MarketplaceProduct[] {
  return getProductCatalog().filter((p) => p.category === category);
}

export type { MarketplaceProduct };

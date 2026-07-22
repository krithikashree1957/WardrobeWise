import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { marketplaceService } from '../services/marketplaceService';
import type { MarketplaceRecommendation } from '../types';
import { Icon } from '../components/common/Icon';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';
import { getErrorMessage } from '../lib/utils';

const STORE_STYLES: Record<string, string> = {
  Amazon: 'bg-amber-100 text-amber-700',
  Myntra: 'bg-pink-100 text-pink-700',
  Flipkart: 'bg-sky-100 text-sky-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  shoes: 'Footwear',
  watch: 'Watch',
  accessory: 'Accessory',
  bag: 'Bag',
  jewellery: 'Jewellery',
  jacket: 'Outerwear',
  top: 'Top',
  shirt: 'Shirt',
  pants: 'Pants',
  jeans: 'Jeans',
  dress: 'Dress',
  saree: 'Saree',
};

/**
 * AI Wardrobe Marketplace Assistant - analyzes the user's existing
 * wardrobe (categories, colors, occasions, seasons) and recommends
 * complementary products that would complete their outfits, each with a
 * demo "Buy" link to Amazon / Myntra / Flipkart.
 */
export default function Marketplace() {
  const [recommendations, setRecommendations] = useState<MarketplaceRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | undefined>();

  const load = async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.getRecommendations();
      setRecommendations(res.data.data.recommendations);
      setMessage(res.data.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell>
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
          Marketplace Assistant
        </h1>
        <p className="text-on-surface-variant font-body-sm">
          AI-picked pieces that complete outfits already in your wardrobe.
        </p>
      </section>

      <section className="space-y-stack-lg">
        {loading ? (
          <div className="space-y-stack-md">
            {[1, 2].map((i) => (
              <div key={i} className="glass-surface p-gutter rounded-lg space-y-3">
                <Skeleton className="w-1/2 h-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-56 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <EmptyState
            icon="storefront"
            title="No recommendations yet"
            description={
              message ||
              "Your wardrobe already covers the essentials we check for - add more items to unlock new suggestions."
            }
          />
        ) : (
          recommendations.map((rec) => (
            <div key={rec.category} className="glass-surface p-gutter rounded-lg space-y-stack-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-label-caps font-label-caps text-primary uppercase">
                    {CATEGORY_LABELS[rec.category] || rec.category}
                  </span>
                  <p className="text-body-sm text-on-surface-variant mt-1 max-w-xl">{rec.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {rec.products.map((product) => (
                  <div key={product.id} className="bg-white/50 rounded-lg overflow-hidden flex flex-col">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-title-md text-title-md leading-snug">{product.name}</span>
                        <span
                          className={`text-[10px] font-label-caps px-2 py-1 rounded-full uppercase flex-none ${STORE_STYLES[product.store]}`}
                        >
                          {product.store}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                        <span className="font-semibold text-on-surface">${product.price}</span>
                        <span className="capitalize">{product.color}</span>
                        <span className="flex items-center gap-1">
                          <Icon name="auto_awesome" className="text-sm text-primary" />
                          {product.matchScore}% match
                        </span>
                      </div>
                      <a
                        href={product.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto w-full text-center lavender-gradient text-on-primary font-label-caps text-label-caps py-3 rounded-xl button-glow"
                      >
                        BUY NOW
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </AppShell>
  );
}

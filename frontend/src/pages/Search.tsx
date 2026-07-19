import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { wardrobeService } from '../services/wardrobeService';
import type { ClothingItem, Occasion, Season } from '../types';
import { Icon } from '../components/common/Icon';
import { SkeletonCard } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { getErrorMessage } from '../lib/utils';

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter', 'all-season'];
const OCCASIONS: Occasion[] = ['college', 'office', 'interview', 'party', 'wedding', 'festival', 'vacation', 'gym', 'casual'];

/** Search - filter wardrobe by color, material, season, occasion, brand, favorites. */
export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState('');
  const [occasion, setOccasion] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [results, setResults] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await wardrobeService.list({
        search: query || undefined,
        season: season || undefined,
        occasion: occasion || undefined,
        favorite: favoritesOnly || undefined,
      });
      setResults(res.data.data.items);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(runSearch, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, season, occasion, favoritesOnly]);

  return (
    <AppShell>
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
          Search Wardrobe
        </h1>
        <p className="text-on-surface-variant font-body-sm">Find items by color, material, brand, season, or occasion.</p>
      </section>

      <section className="glass-surface p-gutter rounded-lg space-y-stack-md">
        <div className="relative">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search color, material, brand, notes..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-white/60 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFavoritesOnly((f) => !f)}
            className={`px-3 py-1.5 rounded-full text-body-sm border flex items-center gap-1 ${
              favoritesOnly ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-white/50'
            }`}
          >
            <Icon name="favorite" filled={favoritesOnly} className="text-sm" /> Favorites
          </button>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="px-3 py-1.5 rounded-full text-body-sm border border-outline-variant bg-white/50 capitalize"
          >
            <option value="">Any Season</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="px-3 py-1.5 rounded-full text-body-sm border border-outline-variant bg-white/50 capitalize"
          >
            <option value="">Any Occasion</option>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : searched && results.length === 0 ? (
        <EmptyState icon="search_off" title="No matches" description="Try adjusting your filters or search terms." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/wardrobe/${item._id}`)}
              className="glass-surface p-2 rounded-lg cursor-pointer hover:-translate-y-1 transition-all"
            >
              <div className="w-full h-40 rounded-md overflow-hidden mb-2 bg-surface-container-high">
                <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.color} />
              </div>
              <div className="px-1">
                <div className="text-[10px] font-label-caps text-on-surface-variant uppercase">{item.category}</div>
                <div className="text-body-sm font-semibold truncate capitalize">{item.color}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

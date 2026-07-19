import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { wardrobeService } from '../services/wardrobeService';
import type { ClothingItem, ClothingCategory } from '../types';
import { SkeletonCard } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Icon } from '../components/common/Icon';
import { getErrorMessage } from '../lib/utils';

const CATEGORIES: { id: ClothingCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'top', label: 'Tops' },
  { id: 'shirt', label: 'Shirts' },
  { id: 'pants', label: 'Pants' },
  { id: 'jeans', label: 'Jeans' },
  { id: 'dress', label: 'Dresses' },
  { id: 'saree', label: 'Sarees' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'bag', label: 'Bags' },
  { id: 'watch', label: 'Watches' },
  { id: 'jewellery', label: 'Jewellery' },
  { id: 'jacket', label: 'Jackets' },
  { id: 'accessory', label: 'Accessories' },
];

/** Wardrobe - grid of clothing items with search/category filters + favorites toggle. */
export default function Wardrobe() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await wardrobeService.list({
        category: category === 'all' ? undefined : category,
        search: search || undefined,
        favorite: favoritesOnly || undefined,
      });
      setItems(res.data.data.items);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search, favoritesOnly]);

  const toggleFavorite = async (id: string) => {
    try {
      await wardrobeService.toggleFavorite(id);
      setItems((prev) => prev.map((i) => (i._id === id ? { ...i, isFavorite: !i.isFavorite } : i)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AppShell>
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-gutter">
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
            My Wardrobe
          </h1>
          <p className="text-on-surface-variant font-body-sm">{items.length} items in your digital closet</p>
        </div>
        <button
          onClick={() => navigate('/wardrobe/add')}
          className="lavender-gradient text-on-primary font-title-md text-title-md py-3 px-6 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all button-glow flex items-center gap-2 justify-center"
        >
          <Icon name="add" /> Add Item
        </button>
      </section>

      {/* Search + Filter Bar */}
      <section className="glass-surface p-gutter rounded-lg space-y-stack-md">
        <div className="relative group">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by color, brand, material..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-white/60 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => setFavoritesOnly((f) => !f)}
            className={`flex-none px-4 py-2 rounded-full text-body-sm font-medium border transition-colors flex items-center gap-1 ${
              favoritesOnly ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-white/50'
            }`}
          >
            <Icon name="favorite" filled={favoritesOnly} className="text-sm" /> Favorites
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex-none px-4 py-2 rounded-full text-body-sm font-medium border transition-colors capitalize ${
                category === c.id ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-white/50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="checkroom"
          title="No items found"
          description="Try a different filter, or add your first wardrobe item to get started."
          action={
            <button
              onClick={() => navigate('/wardrobe/add')}
              className="lavender-gradient text-on-primary font-title-md text-title-md py-3 px-6 rounded-xl button-glow"
            >
              Add Item
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/wardrobe/${item._id}`)}
              className="glass-surface p-2 rounded-lg group cursor-pointer hover:-translate-y-1 transition-all"
            >
              <div className="relative w-full h-48 rounded-md overflow-hidden mb-2 bg-surface-container-high">
                <img className="w-full h-full object-cover" src={item.imageUrl} alt={item.color} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item._id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full glass-surface flex items-center justify-center"
                >
                  <Icon name="favorite" filled={item.isFavorite} className={item.isFavorite ? 'text-primary text-lg' : 'text-white text-lg'} />
                </button>
              </div>
              <div className="px-1">
                <div className="text-[10px] font-label-caps text-on-surface-variant uppercase">{item.category}</div>
                <div className="text-body-sm font-semibold truncate capitalize">
                  {item.color} {item.brand ? `· ${item.brand}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

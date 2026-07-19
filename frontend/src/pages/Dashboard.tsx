import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, formatRelativeDate } from '../lib/utils';
import { Skeleton } from '../components/common/Skeleton';

const MOODS = [
  { id: 'energetic', label: 'BOLD', icon: 'rocket_launch' },
  { id: 'relaxed', label: 'CHILL', icon: 'coffee' },
  { id: 'casual', label: 'MINIMAL', icon: 'self_improvement' },
];

interface DashboardData {
  user: { fullName?: string };
  weather?: { tempC: number; condition: string; city: string };
  todaysOutfit: any;
  aiSuggestions: { fabrics: string[]; colors: string[]; shoes: string[]; layers: string[] } | null;
  recentOutfits: any[];
  recentlyWorn: any[];
  wardrobeSummary: { totalItems: number };
}

/**
 * Dashboard - ported 1:1 from Stitch export
 * (stitch_wardrobewise_ai_fashion_studio/dashboard/code.html).
 * Header + weather widget, hero "Today's Outfit" card, mood selector +
 * wardrobe stats, quick actions, "Recently Worn" horizontal scroller,
 * and AI style tip chips - wired to live API data.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState('relaxed');

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.get();
      setData(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroImage =
    data?.todaysOutfit?.top?.imageUrl ||
    'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200&q=80';

  return (
    <AppShell>
      {/* Header & Weather Widget */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-gutter">
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface tracking-tight">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Stylist'}
          </h1>
          <p className="text-on-surface-variant font-body-sm">Ready for a productive day?</p>
        </div>
        <div className="glass-surface px-6 py-4 rounded-lg flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">light_mode</span>
          <div>
            <div className="font-title-md text-title-md">
              {loading ? <Skeleton className="w-10 h-5" /> : `${Math.round(data?.weather?.tempC ?? 22)}°C`}
            </div>
            <div className="text-label-caps font-label-caps uppercase text-on-surface-variant">
              {loading ? '...' : `${data?.weather?.condition || 'Sunny'} • ${data?.weather?.city || user?.city || 'London'}`}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Card: Today's Outfit */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 relative group overflow-hidden rounded-lg shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <div
            className="w-full h-[400px] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${heroImage}')` }}
          />
          <div className="absolute bottom-6 left-6 z-20 text-white">
            <div className="text-label-caps font-label-caps mb-2 bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full inline-block">
              TODAY'S OUTFIT
            </div>
            <h2 className="font-headline-lg text-white mb-1">
              {data?.todaysOutfit?.name || 'Generate your first look'}
            </h2>
            <p className="text-white/80 font-body-sm">
              {data?.todaysOutfit
                ? data.todaysOutfit.reasoning?.occasionSuitability || 'Curated for today.'
                : 'Tap Generate to get an AI-styled outfit.'}
            </p>
          </div>
          {data?.todaysOutfit && (
            <div className="absolute top-6 right-6 z-20 glass-surface p-4 rounded-xl flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">{data.todaysOutfit.confidenceScore}%</div>
              <div className="text-[10px] font-label-caps text-on-surface-variant">CONFIDENCE</div>
            </div>
          )}
        </div>

        {/* Mood Card */}
        <div className="glass-surface p-gutter flex flex-col justify-between rounded-lg">
          <div>
            <h3 className="font-title-md text-title-md mb-2">How's your mood?</h3>
            <p className="text-body-sm text-on-surface-variant mb-stack-md">
              AI will adjust your outfit suggestions accordingly.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                    mood === m.id
                      ? 'bg-primary-container/20 border-primary/20 text-primary'
                      : 'border-outline-variant hover:bg-primary-container/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl mb-1">{m.icon}</span>
                  <span className="text-[10px] font-label-caps">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-stack-lg border-t border-outline-variant/30 pt-stack-md">
            <h4 className="text-label-caps font-label-caps text-on-surface-variant mb-2">WARDROBE STATS</h4>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold">{data?.wardrobeSummary?.totalItems ?? 0}</span>
                <span className="text-on-surface-variant font-body-sm ml-1">items total</span>
              </div>
              <div className="w-16 h-8 flex items-end gap-1">
                <div className="w-2 bg-primary/20 h-4 rounded-t-sm" />
                <div className="w-2 bg-primary/40 h-6 rounded-t-sm" />
                <div className="w-2 bg-primary h-8 rounded-t-sm" />
                <div className="w-2 bg-primary/60 h-5 rounded-t-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-3 gap-3 md:gap-gutter">
        <button
          onClick={() => navigate('/wardrobe/add')}
          className="glass-surface flex flex-col items-center justify-center p-6 rounded-lg group transition-all hover:-translate-y-1 active:scale-95"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">photo_camera</span>
          </div>
          <span className="text-label-caps font-label-caps">AI SCAN</span>
        </button>
        <button
          onClick={() => navigate('/outfits')}
          className="glass-surface flex flex-col items-center justify-center p-6 rounded-lg group transition-all hover:-translate-y-1 active:scale-95 bg-primary text-white border-none"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <span className="text-label-caps font-label-caps">GENERATE</span>
        </button>
        <button
          onClick={() => navigate('/wardrobe/add')}
          className="glass-surface flex flex-col items-center justify-center p-6 rounded-lg group transition-all hover:-translate-y-1 active:scale-95"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">add</span>
          </div>
          <span className="text-label-caps font-label-caps">ADD ITEM</span>
        </button>
      </section>

      {/* Horizontal Scroll: Recently Worn */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-title-md text-title-md">Recently Worn</h3>
          <button onClick={() => navigate('/wardrobe')} className="text-primary text-label-caps font-label-caps">
            VIEW ALL
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
          {loading &&
            [1, 2, 3].map((i) => <Skeleton key={i} className="snap-start flex-none w-40 h-56 rounded-lg" />)}
          {!loading && data?.recentlyWorn?.length === 0 && (
            <p className="text-on-surface-variant text-body-sm">No worn items yet - mark items as worn from your wardrobe.</p>
          )}
          {data?.recentlyWorn?.map((item) => (
            <div key={item._id} className="snap-start flex-none w-40 glass-surface p-2 rounded-lg group">
              <div className="w-full h-48 rounded-md overflow-hidden mb-2">
                <img className="w-full h-full object-cover" src={item.imageUrl} alt={item.color} />
              </div>
              <div className="px-1">
                <div className="text-[10px] font-label-caps text-on-surface-variant">
                  {formatRelativeDate(item.lastWornAt).toUpperCase()}
                </div>
                <div className="text-body-sm font-semibold truncate capitalize">
                  {item.color} {item.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Suggestions Chips */}
      <section className="glass-surface p-gutter rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">tips_and_updates</span>
          <h3 className="font-title-md text-title-md">Style Tips for You</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {data?.aiSuggestions?.layers?.[0] && (
            <div className="bg-secondary-container/20 text-on-secondary-container px-4 py-2 rounded-full text-body-sm flex items-center gap-2 border border-secondary-container/30">
              <span className="material-symbols-outlined text-sm">ac_unit</span>
              Layer up: {data.aiSuggestions.layers[0]}
            </div>
          )}
          {data?.aiSuggestions?.colors?.[0] && (
            <div className="bg-primary-container/10 text-primary px-4 py-2 rounded-full text-body-sm flex items-center gap-2 border border-primary-container/20">
              <span className="material-symbols-outlined text-sm">palette</span>
              Try {data.aiSuggestions.colors[0]} tones today
            </div>
          )}
          <div className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-full text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Shoe care reminder
          </div>
        </div>
      </section>
    </AppShell>
  );
}

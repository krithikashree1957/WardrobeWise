import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AppShell } from '../components/layout/AppShell';
import { analyticsService } from '../services/analyticsService';
import type { WardrobeStatistics as StatsType } from '../types';
import { Icon } from '../components/common/Icon';
import { getErrorMessage } from '../lib/utils';

/** Wardrobe Statistics - totals, favorites, most/least worn, and monthly usage chart. */
export default function Statistics() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .statistics()
      .then((res) => setStats(res.data.data.statistics))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <AppShell>
        <div className="animate-pulse h-96 glass-surface rounded-lg" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
          Wardrobe Statistics
        </h1>
        <p className="text-on-surface-variant font-body-sm">Your closet, by the numbers.</p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="checkroom" label="Total Clothes" value={String(stats.totalClothes)} />
        <StatCard icon="palette" label="Favorite Color" value={stats.favoriteColor || '—'} />
        <StatCard icon="sell" label="Favorite Brand" value={stats.favoriteBrand || '—'} />
        <StatCard icon="calendar_month" label="Months Tracked" value={String(stats.monthlyUsage.length)} />
      </section>

      <section className="glass-surface p-gutter rounded-lg">
        <h3 className="font-title-md text-title-md mb-4">Monthly Usage</h3>
        {stats.monthlyUsage.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">Wear outfits over time to see your usage trend here.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e2" />
                <XAxis dataKey="month" fontSize={12} stroke="#494552" />
                <YAxis fontSize={12} stroke="#494552" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#674bb5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="glass-surface p-gutter rounded-lg">
          <h3 className="font-title-md text-title-md mb-4">Most Worn Items</h3>
          <ItemList items={stats.mostWornItems} />
        </div>
        <div className="glass-surface p-gutter rounded-lg">
          <h3 className="font-title-md text-title-md mb-4">Least Worn Items</h3>
          <ItemList items={stats.leastWornItems} />
        </div>
      </section>
    </AppShell>
  );
}

function ItemList({ items }: { items: StatsType['mostWornItems'] }) {
  if (items.length === 0) return <p className="text-body-sm text-on-surface-variant">No data yet.</p>;
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item._id} className="flex items-center gap-3 bg-white/50 rounded-lg p-2">
          <img src={item.imageUrl} className="w-12 h-12 rounded-md object-cover" alt={item.color} />
          <div className="flex-1">
            <div className="text-body-sm font-medium capitalize">{item.color} {item.category}</div>
            <div className="text-[10px] text-on-surface-variant">{item.timesWorn} wears</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="glass-surface p-4 rounded-lg flex flex-col items-center text-center gap-1">
      <Icon name={icon} className="text-primary text-2xl" />
      <span className="text-xl font-bold capitalize truncate max-w-full">{value}</span>
      <span className="text-[10px] font-label-caps text-on-surface-variant uppercase">{label}</span>
    </div>
  );
}

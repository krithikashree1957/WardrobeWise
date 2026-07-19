import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { analyticsService } from '../services/analyticsService';
import type { SustainabilityDashboard as SustainabilityData } from '../types';
import { Icon } from '../components/common/Icon';
import { getErrorMessage, formatCurrency } from '../lib/utils';

/** Sustainability Dashboard - cost-per-wear, usage extremes, and donation suggestions. */
export default function Sustainability() {
  const [data, setData] = useState<SustainabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .sustainability()
      .then((res) => setData(res.data.data.sustainability))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
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
          Sustainability Dashboard
        </h1>
        <p className="text-on-surface-variant font-body-sm">Understand your wardrobe's real value and impact.</p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="payments" label="Highest Cost/Wear" value={formatCurrency(data.costPerWear[0]?.costPerWear ?? 0)} />
        <StatCard icon="trending_up" label="Most Used" value={String(data.mostUsed.length)} />
        <StatCard icon="trending_down" label="Least Used" value={String(data.leastUsed.length)} />
        <StatCard icon="inventory_2" label="Unused Items" value={String(data.unusedCount)} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="glass-surface p-gutter rounded-lg">
          <h3 className="font-title-md text-title-md mb-4">Most Used</h3>
          <div className="space-y-2">
            {data.mostUsed.map((item) => (
              <div key={item._id} className="flex items-center gap-3 bg-white/50 rounded-lg p-2">
                <img src={item.imageUrl} className="w-12 h-12 rounded-md object-cover" alt={item.color} />
                <div className="flex-1">
                  <div className="text-body-sm font-medium capitalize">{item.color} {item.category}</div>
                  <div className="text-[10px] text-on-surface-variant">{item.timesWorn} wears</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-surface p-gutter rounded-lg">
          <h3 className="font-title-md text-title-md mb-4">Least Used</h3>
          <div className="space-y-2">
            {data.leastUsed.map((item) => (
              <div key={item._id} className="flex items-center gap-3 bg-white/50 rounded-lg p-2">
                <img src={item.imageUrl} className="w-12 h-12 rounded-md object-cover" alt={item.color} />
                <div className="flex-1">
                  <div className="text-body-sm font-medium capitalize">{item.color} {item.category}</div>
                  <div className="text-[10px] text-on-surface-variant">{item.timesWorn} wears</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-surface p-gutter rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="volunteer_activism" className="text-primary" />
          <h3 className="font-title-md text-title-md">Donation Suggestions</h3>
        </div>
        {data.donationSuggestions.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">No stale items right now - great job keeping your wardrobe active!</p>
        ) : (
          <div className="space-y-2">
            {data.donationSuggestions.map((d) => (
              <div key={d.item._id} className="flex items-center gap-3 bg-white/50 rounded-lg p-3">
                <img src={d.item.imageUrl} className="w-12 h-12 rounded-md object-cover" alt={d.item.color} />
                <div className="flex-1">
                  <div className="text-body-sm font-medium capitalize">{d.item.color} {d.item.category}</div>
                  <div className="text-[11px] text-on-surface-variant">{d.reason}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="glass-surface p-4 rounded-lg flex flex-col items-center text-center gap-1">
      <Icon name={icon} className="text-primary text-2xl" />
      <span className="text-xl font-bold">{value}</span>
      <span className="text-[10px] font-label-caps text-on-surface-variant uppercase">{label}</span>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { packingService } from '../services/packingService';
import type { PackingList } from '../types';
import { Icon } from '../components/common/Icon';
import { EmptyState } from '../components/common/EmptyState';
import { getErrorMessage } from '../lib/utils';

/** Packing Assistant - destination + days -> AI-generated packing checklist. */
export default function Packing() {
  const [lists, setLists] = useState<PackingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);

  const load = async () => {
    try {
      const res = await packingService.list();
      setLists(res.data.data.packingLists);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    if (!destination) {
      toast.error('Enter a destination first.');
      return;
    }
    setGenerating(true);
    try {
      const res = await packingService.create({ destination, days });
      setLists((prev) => [res.data.data.packingList, ...prev]);
      toast.success('Packing checklist generated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const toggle = async (listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l._id === listId
          ? { ...l, items: l.items.map((it) => (it._id === itemId ? { ...it, packed: !it.packed } : it)) }
          : l
      )
    );
    try {
      await packingService.toggleItem(listId, itemId!);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AppShell>
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
          Packing Assistant
        </h1>
        <p className="text-on-surface-variant font-body-sm">Weather-aware checklists for your next trip.</p>
      </section>

      <section className="glass-surface p-gutter rounded-lg space-y-stack-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-end">
          <div className="space-y-unit md:col-span-2">
            <label className="font-label-caps text-label-caps text-outline uppercase">Destination</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tokyo, Japan"
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
            />
          </div>
          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Days</label>
            <input
              type="number"
              min={1}
              max={60}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
            />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="w-full lavender-gradient text-on-primary font-title-md text-title-md py-4 rounded-xl button-glow disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {generating ? <Icon name="progress_activity" className="animate-spin" /> : <Icon name="luggage" />}
          {generating ? 'Building checklist...' : 'Generate Checklist'}
        </button>
      </section>

      <section className="space-y-stack-md">
        {loading ? (
          <div className="animate-pulse h-40 glass-surface rounded-lg" />
        ) : lists.length === 0 ? (
          <EmptyState icon="luggage" title="No trips yet" description="Generate your first packing checklist above." />
        ) : (
          lists.map((list) => (
            <div key={list._id} className="glass-surface p-gutter rounded-lg space-y-stack-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-title-md text-title-md">{list.destination}</h3>
                <span className="text-body-sm text-on-surface-variant">{list.days} days</span>
              </div>
              {list.expectedWeather && (
                <p className="text-body-sm text-on-surface-variant">
                  Expect {list.expectedWeather.tempMinC?.toFixed(0)}°–{list.expectedWeather.tempMaxC?.toFixed(0)}°C,{' '}
                  {list.expectedWeather.condition}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {list.items.map((item) => (
                  <label
                    key={item._id}
                    className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => toggle(list._id, item._id!)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className={`text-body-sm ${item.packed ? 'line-through text-on-surface-variant' : ''}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </AppShell>
  );
}

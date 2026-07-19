import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { laundryService } from '../services/laundryService';
import { wardrobeService } from '../services/wardrobeService';
import type { ClothingItem, LaundryStatus } from '../types';
import { Icon } from '../components/common/Icon';
import { getErrorMessage } from '../lib/utils';

const COLUMNS: { id: LaundryStatus; label: string; icon: string }[] = [
  { id: 'clean', label: 'Clean', icon: 'checkroom' },
  { id: 'worn-once', label: 'Worn Once', icon: 'history' },
  { id: 'needs-washing', label: 'Needs Washing', icon: 'local_laundry_service' },
  { id: 'ironed', label: 'Ironed', icon: 'iron' },
];

/** Laundry Manager - kanban-style board across clean / worn-once / needs-washing / ironed. */
export default function Laundry() {
  const [data, setData] = useState<Record<LaundryStatus, ClothingItem[]>>({
    clean: [], 'worn-once': [], 'needs-washing': [], ironed: [],
  });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await laundryService.overview();
      setData({
        clean: res.data.data.clean,
        'worn-once': res.data.data.wornOnce,
        'needs-washing': res.data.data.needsWashing,
        ironed: res.data.data.ironed,
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const moveItem = async (item: ClothingItem, to: LaundryStatus) => {
    try {
      await wardrobeService.updateLaundry(item._id, to);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AppShell>
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
          Laundry Manager
        </h1>
        <p className="text-on-surface-variant font-body-sm">Track what's clean, worn, or needs a wash.</p>
      </section>

      {loading ? (
        <div className="animate-pulse h-64 glass-surface rounded-lg" />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {COLUMNS.map((col) => (
            <div key={col.id} className="glass-surface p-gutter rounded-lg space-y-stack-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={col.icon} className="text-primary" />
                <h3 className="font-title-md text-title-md">{col.label}</h3>
                <span className="ml-auto text-body-sm text-on-surface-variant">{data[col.id].length}</span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data[col.id].length === 0 && (
                  <p className="text-body-sm text-on-surface-variant text-center py-4">Nothing here</p>
                )}
                {data[col.id].map((item) => (
                  <div key={item._id} className="bg-white/60 rounded-lg p-2 flex items-center gap-2">
                    <img src={item.imageUrl} alt={item.color} className="w-10 h-10 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-body-sm font-medium truncate capitalize">
                        {item.color} {item.category}
                      </div>
                    </div>
                    <select
                      value={item.laundryStatus}
                      onChange={(e) => moveItem(item, e.target.value as LaundryStatus)}
                      className="text-[10px] bg-surface-container-low rounded-md px-1 py-1 border-none"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </AppShell>
  );
}

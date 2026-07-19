import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { wardrobeService } from '../services/wardrobeService';
import type { ClothingItem, LaundryStatus } from '../types';
import { Icon } from '../components/common/Icon';
import { getErrorMessage } from '../lib/utils';

const LAUNDRY_OPTIONS: { id: LaundryStatus; label: string; icon: string }[] = [
  { id: 'clean', label: 'Clean', icon: 'checkroom' },
  { id: 'worn-once', label: 'Worn Once', icon: 'history' },
  { id: 'needs-washing', label: 'Needs Washing', icon: 'local_laundry_service' },
  { id: 'ironed', label: 'Ironed', icon: 'iron' },
];

/** Item Detail - full attribute view, laundry status control, favorite/delete/mark-worn actions. */
export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await wardrobeService.get(id);
      setItem(res.data.data.item);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLaundry = async (status: LaundryStatus) => {
    if (!item) return;
    try {
      const res = await wardrobeService.updateLaundry(item._id, status);
      setItem(res.data.data.item);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleFavorite = async () => {
    if (!item) return;
    const res = await wardrobeService.toggleFavorite(item._id);
    setItem(res.data.data.item);
  };

  const handleWorn = async () => {
    if (!item) return;
    const res = await wardrobeService.markWorn(item._id);
    setItem(res.data.data.item);
    toast.success('Marked as worn today');
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm('Remove this item from your wardrobe?')) return;
    try {
      await wardrobeService.remove(item._id);
      toast.success('Item removed');
      navigate('/wardrobe');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading || !item) {
    return (
      <AppShell>
        <div className="animate-pulse h-96 glass-surface rounded-lg" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass-surface flex items-center justify-center">
            <Icon name="arrow_back" />
          </button>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile capitalize">{item.category}</h1>
        </div>
        <button onClick={handleFavorite} className="w-10 h-10 rounded-full glass-surface flex items-center justify-center">
          <Icon name="favorite" filled={item.isFavorite} className={item.isFavorite ? 'text-primary' : ''} />
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="rounded-lg overflow-hidden h-96">
          <img src={item.imageUrl} alt={item.color} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-stack-md">
          <div className="glass-surface p-gutter rounded-lg grid grid-cols-2 gap-stack-md">
            <Field label="Color" value={item.color} />
            <Field label="Material" value={item.material || '—'} />
            <Field label="Brand" value={item.brand || '—'} />
            <Field label="Pattern" value={item.pattern || '—'} />
            <Field label="Sleeve Length" value={item.sleeveLength || '—'} />
            <Field label="Times Worn" value={String(item.timesWorn)} />
            <Field label="Season" value={item.season.join(', ')} />
            <Field label="Occasion" value={item.occasion.join(', ')} />
            {item.price !== undefined && <Field label="Price" value={`$${item.price}`} />}
          </div>

          {item.aiDetection?.confidenceScore !== undefined && (
            <div className="glass-surface p-gutter rounded-lg flex items-center gap-3">
              <Icon name="auto_awesome" className="text-primary" />
              <div>
                <div className="text-body-sm font-semibold">AI Detection Confidence</div>
                <div className="text-2xl font-bold text-primary">{item.aiDetection.confidenceScore}%</div>
              </div>
            </div>
          )}

          {item.notes && (
            <div className="glass-surface p-gutter rounded-lg">
              <div className="text-label-caps font-label-caps text-on-surface-variant mb-1">NOTES</div>
              <p className="text-body-lg">{item.notes}</p>
            </div>
          )}

          <button
            onClick={handleWorn}
            className="w-full lavender-gradient text-on-primary font-title-md text-title-md py-3 rounded-xl button-glow flex items-center justify-center gap-2"
          >
            <Icon name="check_circle" /> Mark as Worn Today
          </button>
        </div>
      </section>

      {/* Laundry Status */}
      <section className="glass-surface p-gutter rounded-lg">
        <h3 className="font-title-md text-title-md mb-4">Laundry Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LAUNDRY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleLaundry(opt.id)}
              className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                item.laundryStatus === opt.id
                  ? 'bg-primary-container/20 border-primary/20 text-primary'
                  : 'border-outline-variant hover:bg-primary-container/10'
              }`}
            >
              <Icon name={opt.icon} className="text-2xl mb-1" />
              <span className="text-[10px] font-label-caps uppercase text-center">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <button onClick={handleDelete} className="text-error font-body-sm flex items-center gap-1 mx-auto">
        <Icon name="delete" className="text-sm" /> Remove from wardrobe
      </button>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-label-caps text-on-surface-variant uppercase">{label}</div>
      <div className="text-body-lg font-medium capitalize">{value}</div>
    </div>
  );
}

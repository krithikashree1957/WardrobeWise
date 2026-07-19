import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { outfitService } from '../services/outfitService';
import type { Outfit, Mood, Occasion } from '../types';
import { Icon } from '../components/common/Icon';
import { EmptyState } from '../components/common/EmptyState';
import { getErrorMessage } from '../lib/utils';

const MOODS: Mood[] = ['happy', 'confident', 'professional', 'romantic', 'creative', 'casual', 'relaxed', 'energetic'];
const OCCASIONS: Occasion[] = ['college', 'office', 'interview', 'party', 'wedding', 'festival', 'vacation', 'gym', 'casual'];

/** Outfits - AI Outfit Generator (mood + occasion inputs) and saved outfit history. */
export default function Outfits() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mood, setMood] = useState<Mood | ''>('');
  const [occasion, setOccasion] = useState<Occasion | ''>('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await outfitService.list();
      setOutfits(res.data.data.outfits);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await outfitService.generate({ mood: mood || undefined, occasion: occasion || undefined });
      setOutfits((prev) => [res.data.data.outfit, ...prev]);
      toast.success('New outfit generated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (id: string) => {
    await outfitService.save(id);
    setOutfits((prev) => prev.map((o) => (o._id === id ? { ...o, isSaved: true } : o)));
  };

  return (
    <AppShell>
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
          Outfit Generator
        </h1>
        <p className="text-on-surface-variant font-body-sm">AI-curated looks based on your wardrobe, mood & the weather.</p>
      </section>

      {/* Generator Controls */}
      <section className="glass-surface p-gutter rounded-lg space-y-stack-md">
        <div className="space-y-unit">
          <label className="font-label-caps text-label-caps text-outline uppercase">Mood</label>
          <div className="flex flex-wrap gap-stack-sm">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(mood === m ? '' : m)}
                className={`px-4 py-2 rounded-full border text-body-sm font-medium capitalize transition-all ${
                  mood === m ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-white/50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-unit">
          <label className="font-label-caps text-label-caps text-outline uppercase">Occasion</label>
          <div className="flex flex-wrap gap-stack-sm">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                onClick={() => setOccasion(occasion === o ? '' : o)}
                className={`px-4 py-2 rounded-full border text-body-sm font-medium capitalize transition-all ${
                  occasion === o ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-white/50'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full lavender-gradient text-on-primary font-title-md text-title-md py-4 rounded-xl button-glow flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {generating ? (
            <Icon name="progress_activity" className="animate-spin" />
          ) : (
            <Icon name="auto_awesome" filled />
          )}
          {generating ? 'Styling your look...' : 'Generate Outfit'}
        </button>
      </section>

      {/* Outfit history */}
      <section className="space-y-stack-md">
        <h3 className="font-title-md text-title-md">Your Outfits</h3>
        {loading ? (
          <div className="animate-pulse h-64 glass-surface rounded-lg" />
        ) : outfits.length === 0 ? (
          <EmptyState icon="auto_awesome" title="No outfits yet" description="Generate your first AI-styled outfit above." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {outfits.map((outfit) => (
              <div key={outfit._id} className="glass-surface p-gutter rounded-lg space-y-stack-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-title-md text-title-md">{outfit.name}</h4>
                  <div className="flex items-center gap-1 text-primary font-bold">
                    {outfit.confidenceScore}%
                    <Icon name="verified" className="text-lg" />
                  </div>
                </div>

                <div className="flex gap-2">
                  {[outfit.top, outfit.bottom, outfit.shoes, ...outfit.accessories].filter(Boolean).map((it: any) => (
                    <div key={it._id} className="w-16 h-16 rounded-md overflow-hidden bg-surface-container-high flex-none">
                      <img src={it.imageUrl} alt={it.color} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 text-body-sm">
                  {outfit.mood && (
                    <span className="bg-primary-container/10 text-primary px-3 py-1 rounded-full capitalize">
                      {outfit.mood}
                    </span>
                  )}
                  {outfit.occasion && (
                    <span className="bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full capitalize">
                      {outfit.occasion}
                    </span>
                  )}
                  {outfit.colorTheoryScheme && (
                    <span className="bg-surface-container-highest px-3 py-1 rounded-full capitalize">
                      {outfit.colorTheoryScheme}
                    </span>
                  )}
                </div>

                <p className="text-body-sm text-on-surface-variant">{outfit.reasoning?.overallReasoning}</p>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-label-caps text-on-surface-variant">
                  <div>
                    <div className="text-body-lg font-bold text-on-surface">{outfit.reasoning?.comfortScore ?? '—'}</div>
                    COMFORT
                  </div>
                  <div>
                    <div className="text-body-lg font-bold text-on-surface">{outfit.weatherContext?.tempC ?? '—'}°</div>
                    WEATHER
                  </div>
                  <div>
                    <div className="text-body-lg font-bold text-on-surface">{outfit.isWorn ? 'Worn' : 'New'}</div>
                    STATUS
                  </div>
                </div>

                {!outfit.isSaved && (
                  <button
                    onClick={() => handleSave(outfit._id)}
                    className="w-full border border-primary text-primary font-title-md py-2 rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="bookmark" /> Save Outfit
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

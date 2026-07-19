import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { shoppingService } from '../services/shoppingService';
import type { ShoppingSuggestion } from '../types';
import { Icon } from '../components/common/Icon';
import { EmptyState } from '../components/common/EmptyState';
import { getErrorMessage } from '../lib/utils';

const VERDICT_STYLES: Record<string, string> = {
  'worth-it': 'bg-emerald-100 text-emerald-700',
  redundant: 'bg-red-100 text-red-700',
  situational: 'bg-amber-100 text-amber-700',
};

/** Shopping Assistant - upload a potential purchase; AI checks fit against existing wardrobe. */
export default function Shopping() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<ShoppingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const load = async () => {
    try {
      const res = await shoppingService.list();
      setSuggestions(res.data.data.suggestions);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvaluating(true);
    try {
      const res = await shoppingService.evaluate(file);
      setSuggestions((prev) => [res.data.data.suggestion, ...prev]);
      toast.success('Purchase evaluated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEvaluating(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <AppShell>
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
          Shopping Assistant
        </h1>
        <p className="text-on-surface-variant font-body-sm">Considering a purchase? Check if it's worth it first.</p>
      </section>

      <section className="glass-surface p-gutter rounded-lg">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={evaluating}
          className="w-full h-40 rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-70"
        >
          {evaluating ? (
            <>
              <Icon name="progress_activity" className="animate-spin text-3xl text-primary" />
              <span className="font-body-sm">Analyzing against your wardrobe...</span>
            </>
          ) : (
            <>
              <Icon name="add_a_photo" className="text-3xl text-primary" />
              <span className="font-title-md text-title-md">Upload a potential purchase</span>
            </>
          )}
        </button>
      </section>

      <section className="space-y-stack-md">
        {loading ? (
          <div className="animate-pulse h-40 glass-surface rounded-lg" />
        ) : suggestions.length === 0 ? (
          <EmptyState icon="shopping_bag" title="No evaluations yet" description="Upload a photo of an item you're considering buying." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {suggestions.map((s) => (
              <div key={s._id} className="glass-surface p-gutter rounded-lg flex gap-4">
                <img src={s.imageUrl} alt={s.detectedColor} className="w-24 h-24 rounded-lg object-cover flex-none" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md capitalize">
                      {s.detectedColor} {s.detectedCategory}
                    </span>
                    <span className={`text-[10px] font-label-caps px-2 py-1 rounded-full uppercase ${VERDICT_STYLES[s.verdict]}`}>
                      {s.verdict.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">{s.reasoning}</p>
                  <div className="flex items-center gap-4 text-body-sm pt-1">
                    <span>
                      <strong>{s.worthBuyingScore}%</strong> match score
                    </span>
                    <span>
                      <strong>{s.completesOutfits}</strong> new outfits
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

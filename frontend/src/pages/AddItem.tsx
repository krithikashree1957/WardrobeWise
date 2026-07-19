import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { wardrobeService } from '../services/wardrobeService';
import { Icon } from '../components/common/Icon';
import { getErrorMessage } from '../lib/utils';
import type { ClothingCategory, Occasion, Season } from '../types';

const CATEGORIES: ClothingCategory[] = [
  'top', 'shirt', 'pants', 'jeans', 'dress', 'saree', 'shoes', 'bag', 'watch', 'jewellery', 'jacket', 'accessory',
];
const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter', 'all-season'];
const OCCASIONS: Occasion[] = ['college', 'office', 'interview', 'party', 'wedding', 'festival', 'vacation', 'gym', 'casual'];

// Gemini returns natural-language clothing names (e.g. "sweater", "blouse",
// "trousers") that don't always match our 12-value category enum exactly.
// This maps common synonyms to the closest valid category before we ever
// set it into state, so validation never rejects an AI-detected item.
const CATEGORY_SYNONYMS: Record<string, ClothingCategory> = {
  sweater: 'top', hoodie: 'top', blouse: 'top', tshirt: 'top', 't-shirt': 'top',
  tee: 'top', tank: 'top', camisole: 'top', cardigan: 'top',
  trousers: 'pants', slacks: 'pants', chinos: 'pants', shorts: 'pants',
  denim: 'jeans',
  gown: 'dress', frock: 'dress',
  sneakers: 'shoes', heels: 'shoes', boots: 'shoes', sandals: 'shoes', flats: 'shoes',
  handbag: 'bag', purse: 'bag', backpack: 'bag', tote: 'bag',
  necklace: 'jewellery', earrings: 'jewellery', bracelet: 'jewellery', ring: 'jewellery',
  coat: 'jacket', blazer: 'jacket', parka: 'jacket', windbreaker: 'jacket',
  scarf: 'accessory', belt: 'accessory', hat: 'accessory', sunglasses: 'accessory', tie: 'accessory',
};

function normalizeCategory(raw: string | undefined): ClothingCategory {
  if (!raw) return 'top';
  const key = raw.toLowerCase().trim();
  if (CATEGORIES.includes(key as ClothingCategory)) return key as ClothingCategory;
  return CATEGORY_SYNONYMS[key] || 'top';
}

/**
 * Add Item - upload flow with AI Clothing Detection.
 * Step 1: pick an image -> POST /wardrobe/detect (Gemini vision attribute extraction).
 * Step 2: user reviews/edits the AI-suggested fields before saving.
 */
export default function AddItem() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detected, setDetected] = useState(false);

  const [category, setCategory] = useState<ClothingCategory>('top');
  const [material, setMaterial] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [pattern, setPattern] = useState('');
  const [sleeveLength, setSleeveLength] = useState('');
  const [season, setSeason] = useState<Season[]>(['all-season']);
  const [occasion, setOccasion] = useState<Occasion[]>(['casual']);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setDetecting(true);
    try {
      const res = await wardrobeService.detect(selected);
      const { detection } = res.data.data as any;
      setCategory(normalizeCategory(detection.clothingType));
      setMaterial(detection.fabric || '');
      setColor(detection.color || '');
      setPattern(detection.pattern || '');
      setSleeveLength(detection.sleeveLength || '');
      setConfidence(detection.confidenceScore ?? null);
      setDetected(true);
      if (detection.note) toast.info(detection.note);
      else toast.success('AI detection complete - review the fields below.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDetecting(false);
    }
  };

  const toggleSeason = (s: Season) =>
    setSeason((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleOccasion = (o: Occasion) =>
    setOccasion((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]));

  const handleSave = async () => {
    if (!file) {
      toast.error('Please upload an image first.');
      return;
    }
    if (!color) {
      toast.error('Please specify a color.');
      return;
    }
    setSaving(true);
    try {
      await wardrobeService.create(file, {
        category, material, brand, color, pattern, sleeveLength,
        season, occasion, price: price ? Number(price) : undefined, notes,
      });
      toast.success('Item added to your wardrobe!');
      navigate('/wardrobe');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <section className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass-surface flex items-center justify-center">
          <Icon name="arrow_back" />
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile">Add to Wardrobe</h1>
      </section>

      {/* Upload area */}
      <section className="glass-surface p-gutter rounded-lg">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        {!preview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-64 rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Icon name="add_a_photo" className="text-4xl text-primary" />
            <span className="font-title-md text-title-md">Upload a photo</span>
            <span className="text-body-sm text-on-surface-variant">AI will auto-detect type, fabric, color & more</span>
          </button>
        ) : (
          <div className="relative">
            <img src={preview} alt="preview" className="w-full h-80 object-cover rounded-lg" />
            {detecting && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center gap-2 text-white">
                <Icon name="progress_activity" className="animate-spin text-3xl" />
                <span className="font-body-sm">AI is analyzing your item...</span>
              </div>
            )}
            {confidence !== null && !detecting && (
              <div className="absolute top-4 right-4 glass-surface px-3 py-2 rounded-xl flex flex-col items-center">
                <span className="text-xl font-bold text-primary">{confidence}%</span>
                <span className="text-[9px] font-label-caps text-on-surface-variant">CONFIDENCE</span>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 glass-surface px-4 py-2 rounded-xl text-body-sm font-semibold"
            >
              Change photo
            </button>
          </div>
        )}
      </section>

      {/* Edit fields (only meaningful once an image is chosen) */}
      {preview && (
        <section className="glass-surface p-gutter rounded-lg space-y-stack-md">
          {detected && (
            <div className="bg-primary-container/10 text-primary px-4 py-2 rounded-full text-body-sm inline-flex items-center gap-2 border border-primary-container/20">
              <Icon name="auto_awesome" className="text-sm" /> AI-detected — feel free to edit before saving
            </div>
          )}

          <div className="grid grid-cols-2 gap-gutter">
            <div className="space-y-unit">
              <label className="font-label-caps text-label-caps text-outline uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-unit">
              <label className="font-label-caps text-label-caps text-outline uppercase">Color</label>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Indigo"
                className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
              />
            </div>
            <div className="space-y-unit">
              <label className="font-label-caps text-label-caps text-outline uppercase">Material</label>
              <input
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Cotton"
                className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
              />
            </div>
            <div className="space-y-unit">
              <label className="font-label-caps text-label-caps text-outline uppercase">Brand</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Levi's"
                className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
              />
            </div>
            <div className="space-y-unit">
              <label className="font-label-caps text-label-caps text-outline uppercase">Pattern</label>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. Solid"
                className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
              />
            </div>
            <div className="space-y-unit">
              <label className="font-label-caps text-label-caps text-outline uppercase">Sleeve Length</label>
              <input
                value={sleeveLength}
                onChange={(e) => setSleeveLength(e.target.value)}
                placeholder="e.g. Long"
                className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
              />
            </div>
            <div className="space-y-unit">
              <label className="font-label-caps text-label-caps text-outline uppercase">Purchase Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder="e.g. 89"
                className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
              />
            </div>
          </div>

          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Season</label>
            <div className="flex flex-wrap gap-stack-sm">
              {SEASONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSeason(s)}
                  className={`px-4 py-2 rounded-full border text-body-sm font-medium capitalize transition-all ${
                    season.includes(s) ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-white/50'
                  }`}
                >
                  {s}
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
                  type="button"
                  onClick={() => toggleOccasion(o)}
                  className={`px-4 py-2 rounded-full border text-body-sm font-medium capitalize transition-all ${
                    occasion.includes(o) ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-white/50'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any extra notes..."
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary px-4 py-3 font-body-lg"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-16 rounded-lg bg-gradient-to-r from-primary to-[#8b72d1] text-white font-title-md shadow-[0px_10px_30px_rgba(103,75,181,0.3)] hover:shadow-[0px_15px_40px_rgba(103,75,181,0.4)] transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {saving ? 'Saving...' : 'Save to Wardrobe'}
            {!saving && <Icon name="check_circle" />}
          </button>
        </section>
      )}
    </AppShell>
  );
}
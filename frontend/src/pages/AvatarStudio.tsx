import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { profileService } from '../services/profileService';
import type { Avatar } from '../types';
import { Icon } from '../components/common/Icon';
import { getErrorMessage } from '../lib/utils';

const HAIR_STYLES = ['short-straight', 'short-wavy', 'long-straight', 'long-wavy', 'curly', 'bald'];
const HAIR_COLORS = ['#2D1F1A', '#5F3E2F', '#9B6A45', '#D2A578', '#1a1c1c', '#674bB5'];
const SKIN_TONES = ['#F9EBD3', '#EFD1B1', '#D2A578', '#9B6A45', '#5F3E2F', '#2D1F1A'];
const BODY_SHAPES = ['athletic', 'rectangular', 'inverted-triangle', 'oval', 'pear', 'hourglass'];

/**
 * Virtual Avatar Studio - lets users customize hair, skin tone, height, and
 * body shape, with a live simplified SVG preview.
 *
 * Architecture note: the avatar record stores a `provider` field
 * ('internal' | 'ready-player-me') plus reserved `externalAvatarId` /
 * `externalAvatarUrl` fields (see backend/src/models/Avatar.ts). Swapping
 * this in-house SVG renderer for a Ready Player Me iframe/3D viewer later
 * only requires branching on `avatar.provider` here - no schema changes.
 */
export default function AvatarStudio() {
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await profileService.getAvatar();
      setAvatar(res.data.data.avatar);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (fields: Partial<Avatar>) => {
    if (!avatar) return;
    const next = { ...avatar, ...fields };
    setAvatar(next);
    setSaving(true);
    try {
      await profileService.updateAvatar(fields);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !avatar) {
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
          Virtual Avatar
        </h1>
        <p className="text-on-surface-variant font-body-sm">
          Customize your avatar to preview outfits before you wear them.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Live preview */}
        <div className="glass-surface rounded-lg flex items-center justify-center p-gutter">
          <svg viewBox="0 0 200 340" width="220" height="374">
            {/* Simplified silhouette avatar - swap for a 3D/Ready Player Me viewer later */}
            <ellipse cx="100" cy="60" rx="38" ry="42" fill={avatar.skinTone} />
            {avatar.hairStyle !== 'bald' && (
              <path
                d={
                  avatar.hairStyle.startsWith('long')
                    ? 'M60 40 Q100 -10 140 40 L145 140 Q100 120 55 140 Z'
                    : 'M62 40 Q100 5 138 40 L138 55 Q100 30 62 55 Z'
                }
                fill={avatar.hairColor}
              />
            )}
            <rect
              x="60"
              y="100"
              width="80"
              height={avatar.bodyShape === 'hourglass' ? 130 : 120}
              rx="30"
              fill="#a78bfa"
              opacity="0.85"
            />
            <rect x="70" y="230" width="25" height="90" rx="10" fill={avatar.skinTone} />
            <rect x="105" y="230" width="25" height="90" rx="10" fill={avatar.skinTone} />
          </svg>
        </div>

        {/* Controls */}
        <div className="space-y-stack-md">
          <div className="glass-surface p-gutter rounded-lg space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Hair Style</label>
            <div className="flex flex-wrap gap-stack-sm">
              {HAIR_STYLES.map((h) => (
                <button
                  key={h}
                  onClick={() => update({ hairStyle: h })}
                  className={`px-3 py-2 rounded-full border text-body-sm capitalize ${
                    avatar.hairStyle === h ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-white/50'
                  }`}
                >
                  {h.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-surface p-gutter rounded-lg space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Hair Color</label>
            <div className="flex gap-stack-sm">
              {HAIR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => update({ hairColor: c })}
                  style={{ backgroundColor: c }}
                  className={`w-9 h-9 rounded-full border-2 border-white ring-1 ${
                    avatar.hairColor === c ? 'ring-2 ring-primary' : 'ring-outline-variant'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="glass-surface p-gutter rounded-lg space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Skin Tone</label>
            <div className="flex gap-stack-sm">
              {SKIN_TONES.map((c) => (
                <button
                  key={c}
                  onClick={() => update({ skinTone: c })}
                  style={{ backgroundColor: c }}
                  className={`w-9 h-9 rounded-full border-2 border-white ring-1 ${
                    avatar.skinTone === c ? 'ring-2 ring-primary' : 'ring-outline-variant'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="glass-surface p-gutter rounded-lg space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">
              Height: {avatar.heightCm}cm
            </label>
            <input
              type="range"
              min={140}
              max={210}
              value={avatar.heightCm}
              onChange={(e) => update({ heightCm: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          <div className="glass-surface p-gutter rounded-lg space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Body Shape</label>
            <div className="flex flex-wrap gap-stack-sm">
              {BODY_SHAPES.map((b) => (
                <button
                  key={b}
                  onClick={() => update({ bodyShape: b })}
                  className={`px-3 py-2 rounded-full border text-body-sm capitalize ${
                    avatar.bodyShape === b ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-white/50'
                  }`}
                >
                  {b.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {saving && <p className="text-body-sm text-on-surface-variant flex items-center gap-1"><Icon name="cloud_sync" className="text-sm animate-spin" /> Saving...</p>}
        </div>
      </section>
    </AppShell>
  );
}

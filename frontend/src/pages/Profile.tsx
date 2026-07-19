import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import type { Avatar } from '../types';
import { Icon } from '../components/common/Icon';
import { getErrorMessage } from '../lib/utils';

const SKIN_TONES = ['#F9EBD3', '#EFD1B1', '#D2A578', '#9B6A45', '#5F3E2F', '#2D1F1A'];
const HAIR_STYLES = ['short-straight', 'short-wavy', 'long-straight', 'long-wavy', 'curly', 'bald'];
const BODY_SHAPES = ['athletic', 'rectangular', 'inverted-triangle', 'oval', 'pear', 'hourglass'];

const NAV_LINKS = [
  { to: '/statistics', icon: 'bar_chart', label: 'Wardrobe Statistics' },
  { to: '/sustainability', icon: 'eco', label: 'Sustainability Dashboard' },
  { to: '/laundry', icon: 'local_laundry_service', label: 'Laundry Manager' },
  { to: '/packing', icon: 'luggage', label: 'Packing Assistant' },
  { to: '/shopping', icon: 'shopping_bag', label: 'Shopping Assistant' },
  { to: '/search', icon: 'search', label: 'Search Wardrobe' },
  { to: '/avatar', icon: 'face', label: 'Virtual Avatar' },
];

/** Profile - editable personal/style attributes, virtual avatar preview, and app navigation hub. */
export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [city, setCity] = useState(user?.city || '');
  const [bodyShape, setBodyShape] = useState(user?.bodyShape || '');
  const [skinTone, setSkinTone] = useState(user?.skinTone || '');

  useEffect(() => {
    profileService.getAvatar().then((res) => setAvatar(res.data.data.avatar)).catch(() => undefined);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.update({ fullName, city, bodyShape: bodyShape as any, skinTone });
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <section className="flex items-center justify-between">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
          Profile
        </h1>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-2 text-error font-body-sm"
        >
          <Icon name="logout" /> Logout
        </button>
      </section>

      {/* Identity card */}
      <section className="glass-surface p-gutter rounded-lg flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.fullName} />
          ) : (
            <Icon name="person" className="text-primary text-4xl" />
          )}
        </div>
        <div>
          <div className="font-title-md text-title-md">{user?.fullName}</div>
          <div className="text-body-sm text-on-surface-variant">{user?.email}</div>
          {user?.fashionPreferences && user.fashionPreferences.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {user.fashionPreferences.map((p) => (
                <span key={p} className="text-[10px] bg-primary-container/10 text-primary px-2 py-0.5 rounded-full">
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick links to all feature areas */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {NAV_LINKS.map((link) => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className="glass-surface p-4 rounded-lg flex flex-col items-center gap-2 hover:-translate-y-1 transition-all"
          >
            <Icon name={link.icon} className="text-primary text-2xl" />
            <span className="text-body-sm text-center font-medium">{link.label}</span>
          </button>
        ))}
      </section>

      {/* Editable profile fields */}
      <section className="glass-surface p-gutter rounded-lg space-y-stack-md">
        <h3 className="font-title-md text-title-md">Style Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
            />
          </div>
          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
            />
          </div>
        </div>

        <div className="space-y-unit">
          <label className="font-label-caps text-label-caps text-outline uppercase">Body Shape</label>
          <div className="flex flex-wrap gap-stack-sm">
            {BODY_SHAPES.map((shape) => (
              <button
                key={shape}
                onClick={() => setBodyShape(shape)}
                className={`px-4 py-2 rounded-full border text-body-sm capitalize transition-all ${
                  bodyShape === shape ? 'bg-primary text-white border-primary' : 'border-outline-variant bg-white/50'
                }`}
              >
                {shape.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-unit">
          <label className="font-label-caps text-label-caps text-outline uppercase">Skin Tone</label>
          <div className="flex gap-stack-sm">
            {SKIN_TONES.map((tone) => (
              <button
                key={tone}
                onClick={() => setSkinTone(tone)}
                style={{ backgroundColor: tone }}
                className={`w-10 h-10 rounded-full border-2 border-white ring-1 transition-transform hover:scale-110 ${
                  skinTone === tone ? 'ring-2 ring-primary scale-110' : 'ring-outline-variant'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full lavender-gradient text-on-primary font-title-md text-title-md py-3 rounded-xl button-glow disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </section>

      {avatar && (
        <section className="glass-surface p-gutter rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="face" className="text-primary text-2xl" />
            <div>
              <div className="font-title-md text-title-md">Virtual Avatar</div>
              <div className="text-body-sm text-on-surface-variant capitalize">
                {avatar.hairStyle.replace('-', ' ')} · {avatar.bodyShape}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/avatar')} className="text-primary font-label-caps text-label-caps">
            CUSTOMIZE
          </button>
        </section>
      )}
    </AppShell>
  );
}

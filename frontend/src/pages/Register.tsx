import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/utils';

const BODY_SHAPES = [
  { id: 'athletic', label: 'Athletic', icon: 'accessibility_new' },
  { id: 'rectangular', label: 'Rectangular', icon: 'man' },
  { id: 'inverted-triangle', label: 'Inverted Triangle', icon: 'stat_3' },
  { id: 'oval', label: 'Oval', icon: 'circle' },
];

const SKIN_TONES = ['#F9EBD3', '#EFD1B1', '#D2A578', '#9B6A45', '#5F3E2F', '#2D1F1A'];

const FASHION_STYLES = ['Minimal', 'Streetwear', 'Chic', 'Avant Garde', 'Retro', 'Business'];

const COUNTRIES = ['United States', 'United Kingdom', 'France', 'Japan', 'South Korea', 'India'];

/**
 * User Registration - ported 1:1 from Stitch export
 * (stitch_wardrobewise_ai_fashion_studio/user_registration/code.html).
 * Multi-section glass-panel form: identity/physicals, body shape + skin
 * tone, fashion style chips, and location - matching spacing/shape exactly.
 */
export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'men' | 'women' | 'non-binary' | ''>('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bodyShape, setBodyShape] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [styles, setStyles] = useState<string[]>([]);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleStyle = (style: string) => {
    setStyles((prev) => (prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Full name, email, and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      await registerUser({
        fullName,
        email,
        password,
        age: age ? Number(age) : undefined,
        gender: gender || undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        bodyShape: bodyShape || undefined,
        skinTone: skinTone || undefined,
        fashionPreferences: styles,
        country,
        city,
      });
      toast.success('Profile created! Welcome to WardrobeWise.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex flex-col items-center">
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/20 bg-surface/10 flex items-center justify-center h-[64px]">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight">WardrobeWise</h1>
      </header>

      <main className="w-full max-w-2xl px-container-padding-mobile md:px-container-padding-desktop pt-24 pb-32">
        <div className="mb-stack-lg text-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Tell us about your style.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            We'll use these details to create your bespoke AI closet.
          </p>
        </div>

        <form className="space-y-stack-lg" onSubmit={handleSubmit}>
          {/* Section 0: Account */}
          <section className="glass-panel p-gutter rounded-lg space-y-gutter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="space-y-unit">
                <label className="font-label-caps text-label-caps text-outline uppercase">Email</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-unit">
                <label className="font-label-caps text-label-caps text-outline uppercase">Password</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
                  placeholder="Min. 8 characters"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>
          </section>

          {/* Section 1: Identity & Physicals */}
          <section className="glass-panel p-gutter rounded-lg space-y-gutter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="space-y-unit">
                <label className="font-label-caps text-label-caps text-outline uppercase">Full Name</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
                  placeholder="John Doe"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-unit">
                <label className="font-label-caps text-label-caps text-outline uppercase">Age</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
                  placeholder="25"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-unit">
              <label className="font-label-caps text-label-caps text-outline uppercase">Gender</label>
              <div className="flex gap-stack-sm">
                {(['men', 'women', 'non-binary'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 h-12 rounded-DEFAULT font-title-md capitalize border transition-colors ${
                      gender === g
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-transparent bg-surface-container-low text-on-surface hover:border-primary-container'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-gutter">
              <div className="space-y-unit">
                <label className="font-label-caps text-label-caps text-outline uppercase">Height (cm)</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
                  placeholder="180"
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
              </div>
              <div className="space-y-unit">
                <label className="font-label-caps text-label-caps text-outline uppercase">Weight (kg)</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
                  placeholder="75"
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Body Shape & Skin Tone */}
          <section className="glass-panel p-gutter rounded-lg space-y-gutter">
            <div className="space-y-stack-md">
              <label className="font-label-caps text-label-caps text-outline uppercase">Body Shape</label>
              <div className="grid grid-cols-4 gap-stack-sm">
                {BODY_SHAPES.map((shape) => (
                  <button
                    type="button"
                    key={shape.id}
                    onClick={() => setBodyShape(shape.id)}
                    className={`flex flex-col items-center p-stack-sm border rounded-DEFAULT transition-all cursor-pointer hover:bg-surface-container-low ${
                      bodyShape === shape.id
                        ? 'border-primary bg-primary/5 scale-105'
                        : 'border-outline-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[32px] text-primary">{shape.icon}</span>
                    <span className="font-label-caps text-[10px] mt-1 text-center">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-stack-md">
              <label className="font-label-caps text-label-caps text-outline uppercase">Skin Tone</label>
              <div className="flex flex-wrap gap-stack-sm">
                {SKIN_TONES.map((tone) => (
                  <button
                    type="button"
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
          </section>

          {/* Section 3: Fashion Style */}
          <section className="glass-panel p-gutter rounded-lg space-y-gutter">
            <div className="space-y-stack-md">
              <label className="font-label-caps text-label-caps text-outline uppercase">Preferred Fashion Style</label>
              <div className="flex flex-wrap gap-stack-sm">
                {FASHION_STYLES.map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`px-4 py-2 rounded-full border text-body-sm font-medium cursor-pointer transition-all ${
                      styles.includes(style)
                        ? 'bg-primary text-white border-primary'
                        : 'border-outline-variant bg-white/50 hover:bg-surface-container-high'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4: Location */}
          <section className="glass-panel p-gutter rounded-lg space-y-gutter overflow-hidden relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter relative z-10">
              <div className="space-y-unit">
                <label className="font-label-caps text-label-caps text-outline uppercase">Country</label>
                <select
                  className="w-full bg-white/60 border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg appearance-none"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-unit">
                <label className="font-label-caps text-label-caps text-outline uppercase">City</label>
                <input
                  className="w-full bg-white/60 border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
                  placeholder="New York"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Complete Profile Button */}
          <div className="pt-stack-lg">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-16 rounded-lg bg-gradient-to-r from-primary to-[#8b72d1] text-white font-title-md shadow-[0px_10px_30px_rgba(103,75,181,0.3)] hover:shadow-[0px_15px_40px_rgba(103,75,181,0.4)] transition-all active:scale-95 group overflow-hidden relative disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {submitting ? 'Creating your profile...' : 'Complete Profile'}
                {!submitting && <span className="material-symbols-outlined">arrow_forward</span>}
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <p className="text-center mt-stack-md text-on-surface-variant font-body-sm">
              By completing, you agree to our{' '}
              <a className="text-primary font-medium underline underline-offset-4" href="#">
                Fashion Data Policy
              </a>
              .
            </p>
          </div>
        </form>
      </main>

      <footer className="w-full max-w-2xl px-container-padding-mobile pb-12 opacity-50 text-center">
        <p className="font-label-caps text-label-caps text-outline">WardrobeWise AI v2.4 • Styled for You</p>
      </footer>
    </div>
  );
}

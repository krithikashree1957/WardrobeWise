/**
 * Pure, dependency-free color theory engine.
 * Works with HSL to compute harmonious color relationships and
 * produce a plain-English explanation for the UI.
 */

export type ColorScheme =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'monochromatic'
  | 'split-complementary';

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToHsl(hex: string): HSL {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

function hslToHex({ h, s, l }: HSL): string {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;
  let [r, g, b] = [0, 0, 0];

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rotate(hsl: HSL, degrees: number): HSL {
  return { ...hsl, h: (hsl.h + degrees + 360) % 360 };
}

const EXPLANATIONS: Record<ColorScheme, string> = {
  complementary:
    'Complementary colors sit opposite each other on the color wheel, creating high contrast and vibrant energy - great for statement pieces.',
  analogous:
    'Analogous colors sit next to each other on the wheel, producing a calm, cohesive palette that feels naturally put-together.',
  triadic:
    'Triadic colors are evenly spaced around the wheel, offering bold contrast while staying balanced - ideal for playful, confident looks.',
  monochromatic:
    'A monochromatic palette uses different shades and tints of a single hue, creating an elegant, elongating, editorial silhouette.',
  'split-complementary':
    'Split-complementary pairs a base color with the two colors adjacent to its complement, giving strong contrast with less tension than a pure complementary pair.',
};

/** Generates a color scheme + explanation from a base hex color. */
export function generateColorScheme(baseHex: string, scheme: ColorScheme) {
  const base = hexToHsl(baseHex);
  let palette: string[] = [];

  switch (scheme) {
    case 'complementary':
      palette = [baseHex, hslToHex(rotate(base, 180))];
      break;
    case 'analogous':
      palette = [hslToHex(rotate(base, -30)), baseHex, hslToHex(rotate(base, 30))];
      break;
    case 'triadic':
      palette = [baseHex, hslToHex(rotate(base, 120)), hslToHex(rotate(base, 240))];
      break;
    case 'monochromatic':
      palette = [10, 30, 50, 70, 90].map((l) => hslToHex({ ...base, l }));
      break;
    case 'split-complementary':
      palette = [baseHex, hslToHex(rotate(base, 150)), hslToHex(rotate(base, 210))];
      break;
  }

  return { scheme, baseColor: baseHex, palette, explanation: EXPLANATIONS[scheme] };
}

/** Suggests the best-fitting scheme for a given pair of garment colors. */
export function suggestScheme(colorA: string, colorB: string): ColorScheme {
  const a = hexToHsl(colorA);
  const b = hexToHsl(colorB);
  const diff = Math.abs(a.h - b.h);
  const normalizedDiff = Math.min(diff, 360 - diff);

  if (normalizedDiff < 20) return 'monochromatic';
  if (normalizedDiff < 60) return 'analogous';
  if (normalizedDiff < 150) return 'split-complementary';
  if (normalizedDiff < 200) return 'complementary';
  return 'triadic';
}

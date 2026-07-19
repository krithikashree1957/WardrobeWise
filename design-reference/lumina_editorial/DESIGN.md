---
name: Lumina Editorial
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#494552'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#7a7583'
  outline-variant: '#cac4d4'
  surface-tint: '#674bb5'
  primary: '#674bb5'
  on-primary: '#ffffff'
  primary-container: '#a78bfa'
  on-primary-container: '#3c1989'
  inverse-primary: '#cebdff'
  secondary: '#396477'
  on-secondary: '#ffffff'
  secondary-container: '#bae6fd'
  on-secondary-container: '#3d687c'
  tertiary: '#555f6f'
  on-tertiary: '#ffffff'
  tertiary-container: '#939daf'
  on-tertiary-container: '#2b3543'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cebdff'
  on-primary-fixed: '#21005e'
  on-primary-fixed-variant: '#4f319c'
  secondary-fixed: '#bee9ff'
  secondary-fixed-dim: '#a1cde3'
  on-secondary-fixed: '#001f2a'
  on-secondary-fixed-variant: '#1e4c5f'
  tertiary-fixed: '#d9e3f6'
  tertiary-fixed-dim: '#bdc7d9'
  on-tertiary-fixed: '#121c2a'
  on-tertiary-fixed-variant: '#3d4756'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system embodies the intersection of high-fashion editorial and advanced artificial intelligence. The aesthetic is rooted in **Minimalism** with a heavy influence of **Glassmorphism**, creating a sense of digital lightness and physical depth. 

The personality is sophisticated yet approachable—acting as a high-end personal stylist that is both intelligent and intuitive. The UI prioritizes negative space and high-contrast typography to ensure that the user's clothing items and AI-generated outfits remain the focal point. Visual hierarchy is maintained through translucent layering and soft, ambient shadows that mimic the lighting of a boutique showroom.

## Colors

The palette is anchored by **Lavender (#A78BFA)** for primary actions and AI-driven insights, symbolizing creativity and intuition. **Soft Sky Blue (#BAE6FD)** serves as an accent for secondary feedback and highlights. 

**Crisp White** and **Charcoal** provide the structural foundation for high-legibility text and deep-contrast elements. In Dark Mode, the charcoal shifts toward a deep midnight navy, allowing the lavender glass effects to glow subtly without causing eye strain. All colors should be applied with a focus on accessibility, maintaining a minimum 4.5:1 contrast ratio for all functional text.

## Typography

The design system utilizes **Inter** exclusively to achieve a clean, systematic, and premium look. The typographic scale is aggressive for headlines to create an editorial feel, while body text remains grounded and highly legible.

- **Display & Headlines:** Use Bold (700) weight with tight letter-spacing to command attention.
- **Body:** Use Regular (400) weight with generous line height (1.5x) to ensure breathability and comfort during long browsing sessions.
- **Labels:** Use Semibold (600) and uppercase styling for micro-copy and metadata to differentiate from standard content.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with a maximum content width of 1440px. The system relies on an 8px base unit to ensure perfect alignment and mathematical harmony.

- **Desktop:** 12-column grid, 24px gutters, 40px outer margins.
- **Mobile:** 4-column grid, 16px gutters, 20px outer margins.
- **Sectioning:** Use generous vertical padding (stack-lg) to separate distinct AI modules, such as "Outfit Recommendations" from "Wardrobe Analytics."

## Elevation & Depth

Depth is conveyed through **Glassmorphism** and multi-layered shadows. Unlike traditional flat designs, surfaces in this design system appear as physical objects floating in a 3D space.

- **Base Layer:** A subtle neutral tint or blurred background image.
- **Glass Surfaces:** Containers use `backdrop-filter: blur(20px)` with a 10% white (light mode) or 5% white (dark mode) opacity fill.
- **Shadows:** Use a "Natural Ambient" shadow: `0px 10px 30px rgba(0, 0, 0, 0.04)` for light mode and `0px 10px 40px rgba(0, 0, 0, 0.2)` for dark mode.
- **Borders:** Glass containers must have a 1px solid white border with 20% opacity to define edges against varied backgrounds.

## Shapes

The shape language is defined by extreme roundedness, creating a friendly and modern silhouette. 

- **Cards & Major Containers:** 24px corner radius (rounded-xl) is the standard for wardrobe items and main interface panels.
- **Buttons & Inputs:** 16px corner radius (rounded-lg) provides a cohesive look that is softer than industry standard but remains functional.
- **Interactive States:** On hover, cards should subtly scale (1.02x) rather than changing border colors, maintaining the premium feel.

## Components

### Buttons
Primary buttons use a subtle linear gradient from **Lavender** to a slightly deeper violet. They feature a soft shadow of the button's own color to create a "glow" effect. Secondary buttons are ghost-styled with a glass background and a 1px border.

### Glassy Cards
The primary container for clothing items. Cards should have no solid background; they rely on `backdrop-filter` and a thin "hairline" stroke. Product imagery inside cards should have a 16px radius to sit comfortably within the 24px card radius.

### Input Fields
Inputs are clean and understated. They use a light grey tint (5% opacity) and transition to a Lavender border on focus. Icons should be used sparingly, primarily for functional clarity (e.g., a search magnifying glass).

### Navigation Bar
The top navigation is a floating glass element that stays pinned to the top of the viewport. It should be narrow (64px - 72px) with centered or split-justified links to mimic luxury fashion site layouts.

### AI Suggestions (Chips)
Small, pill-shaped tags used for "Style Tags" or "Weather Recommendations." These use the **Soft Sky Blue** with a 10% opacity background and 100% opacity text for high readability.
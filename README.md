# WardrobeWise — AI Fashion Studio

An AI-powered Smart Virtual Wardrobe and Personal Fashion Assistant. Digitize your closet, get AI-detected clothing attributes, generate outfits based on mood/occasion/weather/color theory, preview looks on a virtual avatar, chat with an AI stylist, manage laundry, pack for trips, evaluate potential purchases, and track wardrobe sustainability.

The UI is a pixel-accurate implementation of the **"Lumina Editorial"** design system exported from Stitch (glassmorphism, lavender/sky-blue palette, Inter typeface, 24px card radii). Four screens (Splash, Login, Registration, Dashboard) were provided as source-of-truth exports and were ported line-for-line; every additional screen this feature set requires (Wardrobe, Outfit Generator, Assistant, Profile, Avatar, Laundry, Packing, Shopping, Sustainability, Statistics, Search) extends the exact same design tokens, spacing scale, and component patterns for visual consistency.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, React Router, React Hook Form, Axios |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh), bcrypt, Google Sign-In |
| Image Storage | Cloudinary |
| AI | Google Gemini API (vision + chat) |
| Weather | OpenWeather API |
| State | React Context API |
| Validation | Zod |
| Charts | Recharts |
| Animations | Framer Motion / native CSS keyframes ported from Stitch |
| Icons | Material Symbols (Google Fonts) — matches the Stitch exports exactly |
| Notifications | Sonner |

---

## 2. Folder Structure

```
wardrobewise/
├── backend/
│   ├── src/
│   │   ├── config/          # env, db, cloudinary
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # request handlers
│   │   ├── routes/          # Express routers
│   │   ├── middleware/      # auth, validate, rateLimiter, upload, errorHandler
│   │   ├── services/        # gemini, weather, colorTheory, outfit, shopping, packing, analytics, upload
│   │   ├── validations/     # Zod schemas
│   │   ├── utils/           # ApiError, ApiResponse, asyncHandler, jwt
│   │   ├── seed/            # seed.ts (demo data)
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Icon, Button, GlassCard, Skeleton, EmptyState
│   │   │   └── layout/      # TopNavBar, BottomNavBar, AppShell
│   │   ├── pages/           # one file per screen
│   │   ├── context/         # AuthContext
│   │   ├── services/        # per-domain API wrappers (axios)
│   │   ├── lib/              # axios instance, utils
│   │   ├── routes/          # ProtectedRoute
│   │   ├── types/           # shared TS types (mirrors backend models)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js   # exact Lumina Editorial design tokens
│   ├── index.html
│   └── package.json
├── package.json             # root convenience scripts
└── README.md
```

---

## 3. Getting Started

### Prerequisites
- Node.js 18+ and npm
- A MongoDB instance (local or Atlas)
- (Optional but recommended) API keys for Gemini, OpenWeather, Cloudinary, Google OAuth — see §5. The app runs without them using safe stub fallbacks, but AI detection, weather, and image upload need real keys to work end-to-end.

### Install
```bash
# from the repo root
npm run install:all
```

### Configure environment variables
```bash
cp backend/.env.example backend/.env
# edit backend/.env with your MongoDB URI and API keys
```
The frontend needs no `.env` — it proxies `/api` to `http://localhost:5000` in dev (see `frontend/vite.config.ts`).

### Seed demo data (optional but recommended)
```bash
npm run seed
```
This creates a demo user with a starter wardrobe and one saved outfit:
```
email:    demo@wardrobewise.app
password: Password123!
```

### Run in development
```bash
npm run dev
```
This runs the backend (port 5000) and frontend (port 5173) concurrently. Visit **http://localhost:5173**.

Alternatively run them separately:
```bash
npm run dev:backend
npm run dev:frontend
```

### Build for production
```bash
npm run build
# backend -> backend/dist
# frontend -> frontend/dist (serve as static files behind any web server / CDN)
```

---

## 4. API Overview

Base URL: `http://localhost:5000/api/v1`

| Domain | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/google`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/me` |
| Profile | `PATCH /profile`, `GET/PATCH /profile/avatar` |
| Wardrobe | `POST /wardrobe/detect` (AI detection), `POST /wardrobe`, `GET /wardrobe`, `GET/PATCH/DELETE /wardrobe/:id`, `PATCH /wardrobe/:id/laundry`, `PATCH /wardrobe/:id/favorite`, `PATCH /wardrobe/:id/worn` |
| Outfits | `POST /outfits/generate`, `GET /outfits`, `GET /outfits/:id`, `PATCH /outfits/:id/save`, `PATCH /outfits/:id/worn`, `DELETE /outfits/:id` |
| Colors | `GET /colors/scheme?color=674bb5&scheme=analogous`, `GET /colors/schemes?color=674bb5` |
| Weather | `GET /weather?city=London` |
| Assistant | `POST /assistant/chat`, `GET /assistant/history` |
| Laundry | `GET /laundry` |
| Packing | `POST /packing`, `GET /packing`, `PATCH /packing/:id/items/:itemId/toggle` |
| Shopping | `POST /shopping/evaluate`, `GET /shopping` |
| Analytics | `GET /analytics/statistics`, `GET /analytics/sustainability` |
| Dashboard | `GET /dashboard` |

All routes except `/auth/*` and `/colors/*` and `/weather` require `Authorization: Bearer <accessToken>`.

### Example: Generate an outfit
```
POST /api/v1/outfits/generate
Authorization: Bearer <token>
Content-Type: application/json

{ "mood": "confident", "occasion": "office" }
```
```json
{
  "success": true,
  "message": "Outfit generated",
  "data": {
    "outfit": {
      "_id": "...",
      "name": "AI Generated Outfit",
      "top": { "_id": "...", "color": "black", "category": "top", "imageUrl": "..." },
      "bottom": { "_id": "...", "color": "indigo", "category": "jeans" },
      "shoes": { "_id": "...", "color": "white", "category": "shoes" },
      "confidenceScore": 88,
      "colorTheoryScheme": "monochromatic",
      "reasoning": {
        "weatherSuitability": "Suited for 22°C, clear conditions.",
        "occasionSuitability": "Appropriate formality level for office.",
        "colorHarmony": "Uses a monochromatic color relationship for visual balance.",
        "comfortScore": 82,
        "overallReasoning": "This combination balances color harmony, comfort, and occasion appropriateness."
      }
    }
  }
}
```

---

## 5. Environment Variables

See `backend/.env.example` for the full list. Never commit real secrets.

```
PORT, NODE_ENV, CLIENT_URL
MONGODB_URI
JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
GOOGLE_CLIENT_ID
GEMINI_API_KEY, GEMINI_MODEL
OPENWEATHER_API_KEY
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX
```

**Graceful degradation:** if `GEMINI_API_KEY`, `OPENWEATHER_API_KEY`, or Cloudinary keys are missing, the corresponding services return clearly-labeled stub data instead of crashing, so the rest of the app (auth, CRUD, statistics, etc.) stays usable while you wire up keys.

---

## 6. Security

- Passwords hashed with bcrypt (12 rounds).
- JWT access + refresh tokens; access token required on all protected routes via `requireAuth` middleware.
- `express-rate-limit` on all `/api` routes, with a stricter limiter on `/auth/*`.
- Zod validation on every mutating request body.
- `helmet` for secure HTTP headers, CORS locked to `CLIENT_URL`.
- File uploads restricted to images, 8MB limit, streamed directly to Cloudinary (never written to disk).
- No secrets hardcoded — everything flows through `backend/src/config/env.ts`.

---

## 7. Design System Fidelity

Source: Stitch project **"WardrobeWise AI Fashion Studio"** (Lumina Editorial design system), screens: Splash, Login, User Registration, Dashboard, plus the logo mark.

- `frontend/tailwind.config.js` reproduces the exported color tokens, border radii, spacing scale, and type scale **verbatim** (e.g. `primary: #674bb5`, `rounded-lg: 2rem`, `stack-lg: 32px`, `headline-lg: 32px/40px/700`).
- `.glass-surface` / `.glass-panel` / `.lavender-gradient` / `.bg-mesh` utility classes are ported from the exported `<style>` blocks exactly (same blur radii, opacity, shadow values).
- Splash, Login, Register, and Dashboard pages reproduce the exported markup structure, copy, spacing, and micro-interactions (mood-selector toggle, animated gradient background, cursor-follow glow, shine-sweep CTA).
- All additional screens (Wardrobe, Outfit Generator, Assistant, Profile, Avatar, Laundry, Packing, Shopping, Sustainability, Statistics, Search) reuse the same `glass-surface` cards, pill chips, Material Symbols icon set, and top/bottom nav bars for full consistency, since Stitch source designs weren't provided for those screens.

---

## 8. Virtual Avatar — Future Ready Player Me Integration

The `Avatar` model (`backend/src/models/Avatar.ts`) intentionally separates the in-house customization fields (hair, skin tone, height, body shape) from a reserved `provider` + `externalAvatarId` / `externalAvatarUrl` pair. The frontend `AvatarStudio` page renders a simplified SVG preview today; swapping it for a Ready Player Me iframe/3D viewer later only requires branching on `avatar.provider` — no schema or API changes needed.

---

## 9. Testing Instructions

No automated test suite is included yet (out of scope for this pass), but the app is structured for easy testing:

- **Backend**: controllers are thin and call pure `services/*` functions (outfit generation, color theory, packing checklist, shopping evaluation) — these are ideal unit test targets (e.g. with Jest/Vitest + `supertest` for route-level tests).
- **Frontend**: components consume typed service wrappers (`src/services/*`) that can be mocked in React Testing Library tests.

Manual smoke test checklist:
1. `npm run seed`, then `npm run dev`.
2. Visit `/`, click **Get Started** → Login with `demo@wardrobewise.app` / `Password123!`.
3. Dashboard should show weather, the seeded outfit, wardrobe stats, and recently-worn items.
4. Wardrobe → confirm 6 seeded items render with filters/search working.
5. Add Item → upload any image → (with `GEMINI_API_KEY` set) confirm AI-detected fields populate; save → item appears in Wardrobe.
6. Outfits → Generate → confirm a new outfit card appears with confidence score + reasoning.
7. Assistant → send "What should I wear today?" → confirm a reply appears (stub or real, depending on `GEMINI_API_KEY`).
8. Laundry / Packing / Shopping / Sustainability / Statistics / Search → confirm each loads without errors.

---

## 10. Deployment Guide

**Backend** (any Node host — Render, Railway, Fly.io, EC2, etc.):
1. Set all env vars from `.env.example` in your host's dashboard.
2. `npm install --prefix backend && npm run build --prefix backend`
3. Start with `node backend/dist/index.js` (or `npm start --prefix backend`).
4. Point `CLIENT_URL` at your deployed frontend origin for CORS.

**Frontend** (Vercel, Netlify, Cloudflare Pages, or any static host):
1. `npm install --prefix frontend && npm run build --prefix frontend`
2. Deploy the `frontend/dist` folder.
3. Configure your host to proxy/rewrite `/api/*` to your backend URL (or set an absolute API base URL in `frontend/src/lib/axios.ts` if not using a proxy).

**Database**: use MongoDB Atlas for production; set `MONGODB_URI` accordingly.

**Images**: Cloudinary works identically in prod — no code changes needed, just valid credentials.

---

## 11. Known Scope Notes

This is a comprehensive, runnable full-stack scaffold covering every feature area requested. A few areas are intentionally implemented as solid, extensible foundations rather than exhaustive production systems, clearly marked in code comments:
- **Email delivery** for password reset is stubbed (the reset token is logged/returned in dev mode) — wire up a provider like Resend or SendGrid in `authController.forgotPassword`.
- **Virtual Avatar** renders as a simplified in-house SVG today; the data model is ready for a Ready Player Me swap (see §8).
- **AI outfit selection** is deterministic/rule-based (fast, free, reliable); Gemini is used specifically for natural-language reasoning and image attribute detection, keeping core UX functional even without an API key.

---

Built with the **Lumina Editorial** design system. Styled for you. 💜

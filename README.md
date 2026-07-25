# 👗 WardrobeWise

**An AI-powered virtual wardrobe and personal fashion assistant, built as a full-stack MERN + TypeScript application.**

WardrobeWise lets users digitize their closet, get AI-generated clothing attributes from a single photo, and receive outfit recommendations driven by mood, occasion, live weather, and color theory. Beyond styling, it functions as a practical wardrobe management system — tracking laundry status, cost-per-wear, packing lists for trips, and a sustainability dashboard that surfaces underused items.

The UI is a pixel-accurate implementation of a design system exported from Stitch (glassmorphism cards, a lavender/sky-blue palette, and the Inter typeface). Four core screens were ported directly from that export; every additional screen extends the same design tokens and component patterns for full visual consistency across the app.

---

## ✨ Features

- **AI Clothing Detection** — upload a photo and Gemini Vision extracts type, fabric, color, pattern, and formality automatically
- **Smart Outfit Generation** — rule-based selection engine scored against comfort, weather suitability, and color harmony, with AI-generated reasoning
- **Color Theory Engine** — computes complementary, analogous, triadic, monochromatic, and split-complementary palettes from any base color
- **Weather-Aware Recommendations** — pulls live conditions via OpenWeather and suggests fabrics, layers, and footwear accordingly
- **Conversational AI Stylist** — a Gemini-backed chat assistant with wardrobe and weather context baked into every response
- **Virtual Avatar Studio** — customizable hair, skin tone, height, and body shape, with an architecture pre-wired for a future Ready Player Me integration
- **Laundry Manager** — track items across clean / worn-once / needs-washing / ironed states
- **Packing Assistant** — generates a weather-adjusted packing checklist from a destination and trip length
- **Shopping Assistant** — evaluates a potential purchase against your existing wardrobe before you buy
- **Sustainability Dashboard** — cost-per-wear, most/least-used items, and donation suggestions for unworn pieces
- **Wardrobe Statistics** — usage trends, favorite colors/brands, and most/least-worn items visualized with Recharts
- **Full Authentication** — email/password with JWT (access + refresh tokens), plus Google Sign-In

---

## 🛠 Tech Stack

**Frontend**
React 19 · Vite · TypeScript · Tailwind CSS · React Router · React Hook Form · Axios · Recharts · Sonner

**Backend**
Node.js · Express.js · TypeScript

**Database**
MongoDB · Mongoose

**AI & APIs**
Google Gemini API (vision + chat) · OpenWeather API

**Authentication**
JWT (access + refresh tokens) · bcrypt · Google Sign-In

**Libraries & Tools**
Zod (validation) · Cloudinary SDK (image storage) · Multer (uploads) · Helmet · express-rate-limit · Material Symbols

---

## 📂 Project Structure

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
│   ├── tailwind.config.js   # design system tokens
│   ├── index.html
│   └── package.json
├── package.json             # root convenience scripts
└── README.md
```

---

## 🚀 Installation

**1. Clone the repository**
```bash
git clone https://github.com/krithikashree1957/wardrobewise.git
cd wardrobewise
```

**2. Install dependencies**
```bash
npm run install:all
```

**3. Create your environment file**
```bash
cp backend/.env.example backend/.env
```

**4. Configure environment variables**

Open `backend/.env` and fill in your values — see the [Environment Variables](#-environment-variables) section below for the full list.

**5. (Optional) Seed demo data**
```bash
npm run seed
```
Creates a demo account with a starter wardrobe:
```
email:    demo@wardrobewise.app
password: Password123!
```

**6. Run the app**
```bash
npm run dev
```
Runs both servers concurrently:
- Backend → `http://localhost:5000`
- Frontend → `http://localhost:5173`

Or run them separately:
```bash
npm run dev:backend
npm run dev:frontend
```

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `MONGODB_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Secrets for signing access/refresh tokens |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes |
| `GOOGLE_CLIENT_ID` | OAuth Client ID, required only for Google Sign-In |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Model name, e.g. `gemini-flash-latest` |
| `OPENWEATHER_API_KEY` | OpenWeather API key |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials for image storage |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | API rate limiting configuration |

The full template lives in `backend/.env.example`.

> **⚠️ `.env` must never be committed to GitHub.** It's already listed in `.gitignore`. If `GEMINI_API_KEY`, `OPENWEATHER_API_KEY`, or Cloudinary credentials are left unset, those specific features fall back to clearly-labeled stub data rather than crashing the app.

---

## 📡 API Overview

Base URL: `http://localhost:5000/api/v1`

All routes require `Authorization: Bearer <accessToken>` **except** `/auth/*`, `/colors/*`, and `/weather`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Email/password login |
| POST | `/auth/google` | Google Sign-In |
| POST | `/auth/forgot-password` | Request a password reset |
| POST | `/auth/reset-password` | Complete a password reset |
| GET | `/auth/me` | Get the current authenticated user |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| PATCH | `/profile` | Update profile fields |
| GET / PATCH | `/profile/avatar` | Get or update virtual avatar |

### Wardrobe
| Method | Endpoint | Description |
|---|---|---|
| POST | `/wardrobe/detect` | AI attribute detection from an uploaded image |
| POST | `/wardrobe` | Add a new item |
| GET | `/wardrobe` | List items (supports filters) |
| GET / PATCH / DELETE | `/wardrobe/:id` | Get, update, or delete an item |
| PATCH | `/wardrobe/:id/laundry` | Update laundry status |
| PATCH | `/wardrobe/:id/favorite` | Toggle favorite |
| PATCH | `/wardrobe/:id/worn` | Mark as worn today |

### Outfits
| Method | Endpoint | Description |
|---|---|---|
| POST | `/outfits/generate` | Generate an AI-scored outfit |
| GET | `/outfits` | List saved/generated outfits |
| GET | `/outfits/:id` | Get a single outfit |
| PATCH | `/outfits/:id/save` | Save an outfit |
| PATCH | `/outfits/:id/worn` | Mark an outfit as worn |
| DELETE | `/outfits/:id` | Delete an outfit |

### Other domains
| Method | Endpoint | Description |
|---|---|---|
| GET | `/colors/scheme?color=674bb5&scheme=analogous` | Generate a single color scheme |
| GET | `/colors/schemes?color=674bb5` | Generate all color schemes for a base color |
| GET | `/weather?city=London` | Current weather + styling recommendations |
| POST | `/assistant/chat` | Send a message to the AI stylist |
| GET | `/assistant/history` | Get chat history |
| GET | `/laundry` | Laundry overview across all statuses |
| POST / GET | `/packing` | Create or list packing checklists |
| PATCH | `/packing/:id/items/:itemId/toggle` | Toggle a packed item |
| POST | `/shopping/evaluate` | Evaluate a potential purchase against your wardrobe |
| GET | `/shopping` | List past shopping evaluations |
| GET | `/analytics/statistics` | Wardrobe statistics |
| GET | `/analytics/sustainability` | Sustainability dashboard |
| GET | `/dashboard` | Aggregated home dashboard data |

### Example — Generate an outfit
```http
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
      "top": { "_id": "...", "color": "black", "category": "top" },
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

## 🔒 Security Features

- **JWT Authentication** — short-lived access tokens + long-lived refresh tokens
- **Password Hashing** — bcrypt with 12 salt rounds
- **Helmet** — secure HTTP headers by default
- **Rate Limiting** — `express-rate-limit` on all `/api` routes, with a stricter limiter on `/auth/*`
- **Input Validation** — Zod schemas on every mutating request
- **Protected Routes** — `requireAuth` middleware enforced on all non-public endpoints
- **Cloudinary Uploads** — images streamed directly to Cloudinary, never written to disk
- **Environment Variables** — no secrets hardcoded; everything flows through a single validated config module

---

## 🧪 Testing

No automated test suite is included yet. The codebase is structured to make adding one straightforward: controllers are thin and delegate to pure `services/*` functions (outfit generation, color theory, packing logic, shopping evaluation) that are natural targets for unit tests, while frontend components consume typed service wrappers that are easy to mock in React Testing Library.

**Recommended next step:** Jest or Vitest for services, `supertest` for API route tests, and React Testing Library for component tests.

### Manual testing checklist

| Area | Steps | Expected result |
|---|---|---|
| **Authentication** | Register → log out → log in with the same credentials | Account persists; JWT issued; redirected to Dashboard |
| **Wardrobe CRUD** | Add an item with an image → edit a field → delete it | Item appears, updates, and is removed correctly |
| **AI Detection** | Upload a clothing photo on the Add Item screen | Category, color, fabric, and pattern are pre-filled for review |
| **Outfit Generation** | Select a mood/occasion → Generate | Returns an outfit with confidence score and reasoning |
| **Weather Recommendation** | Load the Dashboard | Shows live temperature and condition-based styling tips |
| **Avatar** | Change hair, skin tone, height, or body shape | Preview updates and persists on reload |
| **Packing Planner** | Enter a destination and trip length | Returns a weather-adjusted checklist with toggleable items |

---

## 🚀 Deployment

**Backend** — any Node host (Render, Railway, Fly.io, EC2, etc.)
```bash
npm install --prefix backend
npm run build --prefix backend
node backend/dist/index.js
```
Set all variables from `.env.example` in your host's environment config, and point `CLIENT_URL` at your deployed frontend origin.

**Frontend** — Vercel, Netlify, Cloudflare Pages, or any static host
```bash
npm install --prefix frontend
npm run build --prefix frontend
```
Deploy the `frontend/dist` folder, and configure your host to proxy `/api/*` to the backend (or set an absolute API base URL in `frontend/src/lib/axios.ts`).

**MongoDB Atlas** — create a free cluster, whitelist your deployment host's IP (or `0.0.0.0/0` for early-stage projects), and set `MONGODB_URI` accordingly.

**Cloudinary** — works identically in production; no code changes required, just valid credentials.

---

## 🔧 Troubleshooting

**`MongoNetworkError` / `querySrv ECONNREFUSED ...mongodb.net`**
- IP not whitelisted — add it under Atlas → Network Access.
- Some networks (notably university/corporate Wi-Fi) block DNS SRV lookups entirely. Fix: in Atlas → Connect → Drivers, toggle **off** "SRV Connection String" to get a standard `mongodb://` URI with explicit hostnames.
- Free-tier clusters auto-pause after inactivity — resume it from the Atlas dashboard.
- Always fully restart (`Ctrl+C` → `npm run dev`) after editing `.env` — variables only load at process startup.

**`Gemini API error (404): ... is not found for API version v1beta`**
Google frequently retires specific model versions ahead of their published shutdown dates. Use the rolling alias instead of a pinned version:
```
GEMINI_MODEL=gemini-flash-latest
```
To check which models your key currently supports:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"
```

**`Invalid cloud_name used for ...` (Cloudinary)**
`CLOUDINARY_CLOUD_NAME` must be the actual Cloud Name from your Cloudinary dashboard (a short slug, not a project name).

**`400 Validation failed` on `POST /wardrobe`**
Inspect `details.fieldErrors` in the response body (DevTools → Network tab) to see which field failed. Common causes already handled in this codebase:
- `price` arrives as a string from multipart form data — coerced automatically via `z.coerce.number()`.
- `season` / `occasion` arrive as a plain string (not an array) when only one value is selected — normalized automatically before validation.
- An AI-detected `category` (e.g. `"sweater"`) not matching the 12-value enum — mapped via `CATEGORY_SYNONYMS` in `frontend/src/pages/AddItem.tsx`.

**Login/register intermittently failing with 500**
Check `backend/.env` line-by-line for a missing newline between variables — this can silently merge two values into one and corrupt both.

**General tip:** the line directly above any `POST ... 500 ...` summary in the backend terminal — `[unhandled error] ...` — contains the real exception and is the fastest way to diagnose any of the above.

---

## 🎨 Design System

The UI follows a design system exported from Stitch — a lavender/sky-blue glassmorphism aesthetic built on the Inter typeface. Color tokens, spacing scale, border radii, and typography are reproduced verbatim in `frontend/tailwind.config.js`, and the core visual components (`glass-surface`, `glass-panel`, gradient buttons, pill chips) are shared across every screen to keep the app visually consistent end to end.

---

## 🧍 Future Avatar Integration

The `Avatar` model is deliberately structured to support a future upgrade path: in-house customization fields (hair, skin tone, height, body shape) are kept separate from a reserved `provider` field plus `externalAvatarId` / `externalAvatarUrl`. The current avatar renders as a lightweight in-house SVG preview; swapping it for a full **Ready Player Me** 3D avatar later only requires branching on `avatar.provider` in the frontend — no schema or API changes needed.

---

## 📈 Future Enhancements

- [ ] Automated test suite (Jest/Vitest + Supertest + React Testing Library)
- [ ] Transactional email integration for password reset (Resend/SendGrid)
- [ ] Ready Player Me 3D avatar integration
- [ ] CI/CD pipeline (GitHub Actions) for lint, build, and test on every PR
- [ ] Push notifications for laundry reminders and packing checklists
- [ ] Social/sharing features for outfits

---

## 🤝 Contributing

Contributions are welcome. To propose a change:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request describing your change

This project welcomes improvements, bug fixes, and documentation updates — please keep new code consistent with the existing structure and TypeScript conventions.

---

## 📜 License

This project was built for educational and research purposes.

---

## 👩‍💻 Author

**Krithika Shree K**
M.Tech Integrated Software Engineering — VIT Vellore
GitHub: [@krithikashree1957](https://github.com/krithikashree1957)

**S.Venikalaxmi**
M.Tech Integrated Software Engineering — VIT Vellore
GitHub:[@venikalaxmisaravanan](https://gitub.com/venikalaxmisaravanan)

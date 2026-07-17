# ShankoFIT — WHOOP Performance Experience

Full-stack **Next.js** app that connects to the WHOOP API via **OAuth 2.0**, with a cinematic scroll-driven dashboard for recovery / sleep / strain, body vitals, and a recovery-aware training split.

**Visual direction:** Equinox-style full-bleed backgrounds + Serval-like dynamic motion (Framer Motion parallax / scroll reveals). Dense glass panels — no empty whitespace voids.

| Choice | Value |
| --- | --- |
| Backend | Next.js App Router (API routes + route handlers) |
| Frontend | Next.js + React + Tailwind CSS |
| Charts | Recharts |
| Redirect URI | `http://localhost:3000/auth/whoop/callback` |
| Token storage | Encrypted httpOnly session cookie (`iron-session`) |
| Body vitals | Height 6'0 · Weight tracked in browser (starts at 160 lb) |
| Split | Back & Bis + Cardio → Chest/Shoulders/Tris + Cardio → Legs + Core → Stretch / Mobility → repeat |

---

## File structure

```
.
├── .env.example                 # Template for secrets (copy to .env.local)
├── package.json
├── next.config.ts
├── README.md
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout + fonts
    │   ├── page.tsx             # Landing page (Connect WHOOP)
    │   ├── page-client.tsx
    │   ├── globals.css
    │   ├── dashboard/page.tsx   # Dashboard UI
    │   ├── auth/whoop/
    │   │   ├── route.ts         # GET /auth/whoop → redirect to WHOOP
    │   │   └── callback/route.ts# GET /auth/whoop/callback
    │   └── api/
    │       ├── auth/
    │       │   ├── status/route.ts
    │       │   └── logout/route.ts
    │       └── whoop/
    │           ├── recovery/route.ts   # GET /api/whoop/recovery
    │           ├── sleep/route.ts      # GET /api/whoop/sleep
    │           ├── strain/route.ts     # GET /api/whoop/strain
    │           ├── workouts/route.ts   # GET /api/whoop/workouts
    │           └── dashboard/route.ts  # Aggregated dashboard + plan
    ├── components/
    │   ├── DashboardClient.tsx
    │   ├── TodayCard.tsx
    │   ├── TrendsChart.tsx
    │   ├── TrainingPlanCard.tsx
    │   └── WorkoutsList.tsx
    └── lib/
        ├── session.ts
        ├── get-session.ts
        ├── workout-plan.ts      # Heavy / Moderate / Hypertrophy / Conditioning / Rest
        └── whoop/
            ├── oauth.ts         # Auth URL, token exchange, refresh
            ├── client.ts        # Bearer API calls + auto-refresh
            ├── types.ts
            └── dashboard.ts     # Maps WHOOP records → UI payload
```

---

## 1. Register the Redirect URI in WHOOP

In the [WHOOP Developer Dashboard](https://developer.whoop.com), add this **exact** Redirect URL:

```
http://localhost:3000/auth/whoop/callback
```

If you change the port or path, update both the dashboard **and** `WHOOP_REDIRECT_URI`.

---

## 2. Set environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` (never commit this file):

```bash
WHOOP_CLIENT_ID=your_client_id_here
WHOOP_CLIENT_SECRET=your_client_secret_here
WHOOP_REDIRECT_URI=http://localhost:3000/auth/whoop/callback
SESSION_SECRET=paste_a_long_random_secret_here_min_32_chars
```

Generate a session secret:

```bash
openssl rand -base64 32
```

---

## 3. Install dependencies

```bash
npm install
```

---

## 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 5. Test the full OAuth flow

1. Click **Connect WHOOP** on the landing page.
2. You are redirected to WHOOP login / consent (`/auth/whoop` builds the authorize URL).
3. Grant access for recovery, sleep, cycles, workout, profile, and offline.
4. WHOOP redirects to `/auth/whoop/callback` with `code` + `state`.
5. The app exchanges the code for tokens, stores them in an encrypted cookie, and sends you to `/dashboard`.
6. The dashboard loads live data via `/api/whoop/dashboard`.

---

## OAuth scopes used

Space-delimited list sent to WHOOP:

```
read:recovery read:sleep read:cycles read:workout read:profile offline
```

- `offline` is required so WHOOP returns a **refresh token**.
- Strain comes from **cycles** (`read:cycles`), not a separate “strain” scope.

---

## WHOOP API endpoints this app calls

| Data | Method | Path |
| --- | --- | --- |
| Recovery | `GET` | `/developer/v2/recovery` |
| Sleep | `GET` | `/developer/v2/activity/sleep` |
| Strain (daily) | `GET` | `/developer/v2/cycle` → `score.strain` |
| Workouts | `GET` | `/developer/v2/activity/workout` |
| Profile | `GET` | `/developer/v2/user/profile/basic` |

Base URL: `https://api.prod.whoop.com`

OAuth:

- Authorize: `https://api.prod.whoop.com/oauth/oauth2/auth`
- Token / refresh: `https://api.prod.whoop.com/oauth/oauth2/token`

---

## Token refresh (long-lived sessions)

WHOOP uses **rotating refresh tokens**:

1. When the access token is within ~60s of expiry, the app POSTs `grant_type=refresh_token`.
2. The response includes a **new** `access_token` **and** a **new** `refresh_token`.
3. The previous refresh token is invalidated — we always overwrite both in the session.

See `src/lib/whoop/oauth.ts` (`refreshAccessToken`) and `src/lib/whoop/client.ts` (`getValidAccessToken`).

---

## Training plan logic

`src/lib/workout-plan.ts` maps WHOOP metrics → day type:

| Recovery | Intensity |
| --- | --- |
| ≥ 70 | Heavy |
| 40–69 | Moderate |
| &lt; 40 | Light / Rest |

Sleep quality and recent workout frequency nudge Heavy → Hypertrophy, or Moderate → Conditioning / Rest. Each day type includes example compound lifts + accessories for a **muscle gain + fat loss** goal.

---

## Dashboard sections

1. **Today** — Recovery Score, HRV, resting HR, sleep duration, day strain  
2. **Recovery / Sleep / Strain** — focused metric panels  
3. **Last 7–30 days** — Recharts trends  
4. **Training Plan Recommendation** — Heavy strength / Moderate / Hypertrophy / Conditioning / Rest  
5. **Workouts** — recent activity list  

---

## Follow-up notes (best practices & pitfalls)

### Storing OAuth tokens securely

This beginner-friendly app stores tokens in an **encrypted httpOnly cookie** (`iron-session`). For production multi-user apps:

- Store tokens **encrypted at rest** in a database keyed by user id.
- Never expose `access_token` / `refresh_token` to the browser as readable JS state.
- On every refresh, **persist the new refresh token** immediately (rotation).
- Support revoke / logout that deletes server-side tokens.

### Displaying health metrics in React

- Prefer one “Today” summary, then separate Recovery / Sleep / Strain sections.
- Chart trends with null-safe series (`connectNulls`) — WHOOP days can be missing.
- Color-code recovery (green / amber / red) for quick scanning.
- Label units clearly (ms HRV, bpm RHR, hours sleep, 0–21 strain).

### Common WHOOP OAuth pitfalls

1. **Redirect URI mismatch** — must match the Developer Dashboard character-for-character (including trailing slash / http vs https).
2. **Forgetting `offline` scope** — no refresh token without it.
3. **Not validating `state`** — CSRF risk; always compare callback `state` to the value you stored.
4. **Ignoring refresh rotation** — keeping the old refresh token causes sudden auth failures.
5. **Calling data endpoints before sleep scores** — recovery is tied to completed sleep; morning data may still be `PENDING_SCORE`.
6. **Wrong API base path** — use `/developer/v2/...` on `api.prod.whoop.com`.

---

## Scripts

```bash
npm run dev      # local development (http://localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint
```

---

## License

MIT — use freely for your WHOOP Developer app experiments.

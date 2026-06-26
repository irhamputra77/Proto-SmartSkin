# SmartSkin Frontend

React 19 + Vite frontend for the SmartSkin mannequin sensor monitoring system.

---

## Tech Stack

| Item | Value |
|------|-------|
| **Framework** | React 19 |
| **Bundler** | Vite (rolldown-vite / Rust bundler) |
| **Styling** | TailwindCSS v4 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Routing** | React Router v7 |

---

## Quick Start

```bash
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

Backend must be running at the URL defined in `VITE_API_BASE_URL` (default: `https://api-ss.stas-rg.com`).

---

## Environment Variables

The app reads `VITE_API_BASE_URL` (falls back to `https://api-ss.stas-rg.com` if unset). You don't need to edit code or copy folders to switch backends — Vite picks the right `.env` file per mode:

| File | Used by | `VITE_API_BASE_URL` |
|------|---------|---------------------|
| `.env.development` | `npm run dev` | `http://localhost:3000` |
| `.env.production` | `npm run build` / `npm run dev:deploy` | `https://api-ss.stas-rg.com` |
| `.env.example` | docs only (not loaded) | reference template |
| `.env.local` | any mode (overrides all, git-ignored) | your temporary override |

### Switching backend (no code edits)

| Command | Backend | Use for |
|---------|---------|---------|
| `npm run dev` | Local (`localhost:3000`) | Daily dev against local backend |
| `npm run dev:deploy` | Deploy | Check local FE against production backend |
| `npm run build` | Deploy | Production build (default) |
| `npm run build:local` | Local | Build pointing at local backend |

For a one-off override, create `.env.local` (overrides everything, never committed).

---

## Authentication

Since the backend added a **JWT gate** (API v7.0), the app is login-protected.

- **`/login`** — username + password form (`src/pages/LoginPage.jsx`). On success it stores the token + user in `localStorage` (`smartskin_token` / `smartskin_user`).
- **`RequireAuth`** (`src/components/RequireAuth.jsx`) wraps `/dashboard`, `/logs`, `/sensor/:sensorKey`. No session → redirect to `/login` (remembers where you were headed).
- **`src/lib/api.js`** — `apiFetch()` attaches `Authorization: Bearer <token>` to every data request and, on `401`, clears the session and bounces to `/login`. `apiUrl()` centralizes the API base URL.
- **`src/lib/auth.js`** — token/user helpers (`getToken`, `setSession`, `getUser`, `clearSession`, `isLoggedIn`).
- **Logout** button + logged-in user label live in the Dashboard header.
- CSV export (Logs page) downloads via `apiFetch` → `blob` (a plain `<a href>` can't carry the auth header).

> Accounts: 2 seeded admins (`stas-rg`, `pindad`) — created on the backend via `npm run seed:admin`. Landing page `/` stays public.

---

## Pages

### `/` — Landing Page (`src/pages/LandingPage.jsx`)

Marketing page. No API calls. Static content only.

---

### `/dashboard` — Dashboard Page (`src/pages/DashboardPage.jsx`)

Displays the latest reading for each of the 5 sensor types.

**Sensor cards:**

| Key | Label | Unit | Hardware | Locations |
|-----|-------|------|----------|-----------|
| `temp` | Temperature | °C | MCP9808 | Arm, Back, Leg |
| `press` | Pressure | N | FSR RP-S40-ST | Arm, Back, Leg |
| `vib` | Vibration | V | Piezoelectric | Arm, Back, Leg |
| `flex` | Flex | Ω | Flex Sensor | Elbow, Knee |
| `strain` | Strain | µε | Strain Gauge | Elbow, Knee |

**API call:**
```
GET /sensor-reading/latest?mannequin_id={id}
```

**Behavior:**
- Polls every **3 seconds**
- Mannequin selector dropdown (top-right) — switches between Mannequin 1 and 2
- Switching mannequin resets the summary and triggers an immediate re-fetch
- Click a sensor card → navigates to `/sensor/{key}`

**State:**
| Variable | Type | Description |
|---|---|---|
| `mannequinId` | number | Active mannequin (1 or 2) |
| `summary` | object | Latest values per sensor type (5 keys) |
| `loading` | boolean | True until first fetch completes |

---

### `/sensor/:sensorKey` — Detail Page (`src/pages/DetailPage.jsx`)

Time-series chart view for one sensor type across its body locations.

`sensorKey` values: `temp`, `press`, `vib`, `flex`, `strain`

**Locations per sensor type:**

| sensorKey | Body parts | Sensor points |
|-----------|-----------|---------------|
| `temp`, `press`, `vib` | left arm, right arm, back, left leg, right leg | 2 / 2 / 4 / 3 / 3 |
| `flex`, `strain` | left elbow, right elbow, left knee, right knee | 1 each |

**Threshold / warning line:**

| sensorKey | Warning line value |
|-----------|--------------------|
| `temp` | 38 °C |
| `press` | 70 N |
| `vib` | 3 V |
| `flex` | 105 000 Ω |
| `strain` | 20 000 µε |

**API call:**
```
GET /sensor-reading/paginated?sensorType={type}&location={loc}&page=1&limit=21&mannequin_id={id}
```

**Behavior:**
- Polls every **1 second**, fetching all active parts in parallel (`Promise.allSettled`)
- Mannequin selector dropdown (top-right) — same as Dashboard, resets chart data on switch
- Click a body part on the mannequin SVG → focuses that part's chart
- Tabs at the bottom of the chart → switch between sensor point numbers
- MannequinSVG shows only hotspots relevant to the active sensor type
- Live status badge: **ACTIVE** (≤5s), **DELAY** (≤15s), **OFFLINE** (>15s), **NO DATA**
- **Log Preview** panel below the location grid: last 10 readings (`No · Timestamp · Value · Status`) for the active sensor, fetched from `/sensor-reading/paginated?...&sensorNumber={id}&limit=10` (server-truth from DB, not the WebSocket stream). Includes a **"Lihat semua log →"** link to `/logs`.

**State:**
| Variable | Type | Description |
|---|---|---|
| `mannequinId` | number | Active mannequin (1 or 2) |
| `parts` | string[] | Active location set derived from `sensorKey` |
| `activePart` | string | Focused body part (defaults to first in `parts`) |
| `activeSensorId` | number | Focused sensor point number |
| `sensorData` | object | Time-series data per part and sensor point |
| `loading` | boolean | True until first fetch completes |

---

### `/logs` — Logs Page (`src/pages/LogsPage.jsx`)

Browse and export sensor readings for a chosen day. Reached via the **"Logs"** button in the Dashboard header (and the "Lihat semua log →" link on Detail).

**Filters:**
- Date picker (defaults to today, `max=today`)
- Sensor type — `All` + the 5 types
- Location — `All` + the 9 locations
- Mannequin selector (1 or 2)

**Behavior:**
- **Preview table** is paginated, fetched from `GET /sensor-reading/paginated` (the chosen date is sent as `startDate`/`endDate`)
- **Export CSV** button triggers a browser download from `GET /sensor-reading/export?date=...` via an anchor — the server sets the filename through `Content-Disposition`, and the CSV carries a UTF-8 BOM so Excel renders `°C`/`µε`/`Ω` correctly
- Export returns the **whole day** (no pagination cap), ordered chronologically, with an `OK`/`OVER` status column per reading

---

## Components

### `src/components/MannequinSVG.jsx`

Interactive SVG of the mannequin back with up to 9 clickable hotspots. Highlights the active body part. No API calls — pure UI.

**Hotspots (all 9):** back, left arm, right arm, left leg, right leg, left elbow, right elbow, left knee, right knee

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `activePart` | string | — | Currently focused part |
| `visibleParts` | string[] \| null | `null` | Parts to render; `null` = show all 9 |
| `onClickPart` | function | — | Called with part key when hotspot clicked |
| `onHoverPart` | function | — | Called on mouse enter |
| `onLeavePart` | function | — | Called on mouse leave |
| `imageHref` | string | `/mannequin-back.png` | URL of mannequin background image |

DetailPage passes `visibleParts={parts}` so only relevant hotspots are shown per sensor type (e.g. flex/strain shows only elbows/knees).

---

### `src/components/StatusBadge.jsx`

Colored status chip.

**Props:** `tone` (`"ok"` / `"warn"` / `"danger"` / `"info"`) + `children`

---

### `src/components/NeoButton.jsx`

Neumorphic-styled button. Used for the "Last active" timestamp display on Detail page.

---

## Routing (`src/App.jsx`)

```
/                   → LandingPage                       (public)
/login              → LoginPage                         (public)
/dashboard          → DashboardPage   [RequireAuth]
/dashboard/:sensor  → DashboardPage   [RequireAuth]     (param unused — reserved)
/logs               → LogsPage        [RequireAuth]
/sensor/:sensorKey  → DetailPage      [RequireAuth]     (sensorKey: temp | press | vib | flex | strain)
```

---

## Multi-Mannequin Feature

Both DashboardPage and DetailPage support switching between **Mannequin 1** and **Mannequin 2** via a `<select>` dropdown in the header.

**How it works:**
1. `mannequinId` state (default: `1`) stored in each page component
2. On change → reset display data + set loading → useEffect dependency triggers re-fetch
3. All API calls append `mannequin_id=<id>` as a query parameter
4. Backend defaults to mannequin 1 if the param is omitted (backward compatible)

**Adding more mannequins:** Update the `<select>` options in both pages and seed additional mannequins via `npm run seeder` in the backend.

---

## Data Flow

```
Hardware / LoRa device
    ↓ POST /sensor-reading/batch?mannequinId=1
    ↓ POST /lora?mid=1
Backend API
    ↓ GET /sensor-reading/latest?mannequin_id=1     (every 3s)
DashboardPage → summary cards
    ↓ click card
    ↓ GET /sensor-reading/paginated?...&mannequin_id=1   (every 1s)
DetailPage → recharts line chart
```

---

## Changelog

### v5.0 — Login Gate (2026-06-26)
- Added **Login page** (`/login`) + `RequireAuth` guard on Dashboard/Logs/Detail
- New `src/lib/auth.js` (token storage) + `src/lib/api.js` (`apiFetch` with Bearer token & 401 redirect, `apiUrl`)
- All data fetches routed through `apiFetch`; CSV export switched to fetch+blob download
- Logout button + logged-in user label in Dashboard header

### v4.0 — Sensor Logs + Backend Switching (2026-06-25)
- Added **Logs page** (`/logs`) — pick a date + filters, preview the table, and **Export CSV** for the whole day via `GET /sensor-reading/export`
- Added **Log Preview** panel on the Detail page — last 10 readings for the active sensor (server-truth from DB), with a link to `/logs`
- Added **"Logs"** button in the Dashboard header
- Backend switching without code edits: `.env.development` / `.env.production` files + `dev:deploy` and `build:local` npm scripts (see Environment Variables)

### v3.0 — Hardware Spec v2: New Sensors + Locations (May 2026)
- Updated pressure unit `kPa` → `N`, vibration unit `g` → `V` across Dashboard and Detail pages
- Added **Flex** sensor card (Ω) and **Strain** sensor card (µε) to DashboardPage
- Added `flex` and `strain` entries to `SENSOR_META` with hardware-accurate limits and yRanges
- Added 4 new body locations: left elbow, right elbow, left knee, right knee
- `SENSOR_PARTS` mapping: `flex`/`strain` routes to elbow/knee parts; `temp`/`press`/`vib` routes to original 5 parts
- `MannequinSVG` now accepts `visibleParts` prop — hotspots rendered = sensor type's active parts only
- `activePart` resets to first part of active sensor type on `sensorKey` route change
- Dashboard grid updated to accommodate 5 sensor cards

### v2.0 — Multi-Mannequin Support (May 2026)
- Added mannequin selector dropdown to DashboardPage and DetailPage
- All API calls now include `mannequin_id` query parameter
- Switching mannequin resets display state and triggers immediate re-fetch
- useEffect dependency arrays updated to include `mannequinId`

### v1.0 — Initial Release
- Landing page, Dashboard, Detail page with real-time polling
- Interactive mannequin SVG with 5 body part hotspots
- Recharts line chart with threshold coloring
- Live status badge (ACTIVE / DELAY / OFFLINE / NO DATA)
- Neumorphic design system with TailwindCSS

---

**Last Updated:** June 26, 2026

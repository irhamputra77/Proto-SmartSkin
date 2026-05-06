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

Create `.env.local` in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

If not set, the app defaults to `https://api-ss.stas-rg.com`.

---

## Pages

### `/` — Landing Page (`src/pages/LandingPage.jsx`)

Marketing page. No API calls. Static content only.

---

### `/dashboard` — Dashboard Page (`src/pages/DashboardPage.jsx`)

Displays the latest reading for each of the 3 sensor types (Temperature, Pressure, Vibration).

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
| `summary` | object | Latest values per sensor type |
| `loading` | boolean | True until first fetch completes |

---

### `/sensor/:sensorKey` — Detail Page (`src/pages/DetailPage.jsx`)

Time-series chart view for one sensor type across all 5 body locations.

`sensorKey` values: `temp`, `press`, `vib`

**API call:**
```
GET /sensor-reading/paginated?sensorType={type}&location={loc}&page=1&limit=21&mannequin_id={id}
```

**Behavior:**
- Polls every **1 second**, fetching all 5 body parts in parallel (`Promise.allSettled`)
- Mannequin selector dropdown (top-right) — same as Dashboard, resets chart data on switch
- Click a body part on the mannequin SVG → focuses that part's chart
- Tabs at the bottom of the chart → switch between sensor point numbers (1–4)
- Live status badge: **ACTIVE** (≤5s), **DELAY** (≤15s), **OFFLINE** (>15s), **NO DATA**

**State:**
| Variable | Type | Description |
|---|---|---|
| `mannequinId` | number | Active mannequin (1 or 2) |
| `activePart` | string | Focused body part (e.g. `"back"`) |
| `activeSensorId` | number | Focused sensor point number |
| `sensorData` | object | Time-series data per part and sensor point |
| `loading` | boolean | True until first fetch completes |

---

## Components

### `src/components/MannequinSVG.jsx`

Interactive SVG of the mannequin back with 5 clickable hotspots. Highlights the active body part. No API calls — pure UI.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `activePart` | string | Currently focused part |
| `onPartClick` | function | Called with part key when hotspot clicked |
| `imageHref` | string | URL of mannequin background image |

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
/                   → LandingPage
/dashboard          → DashboardPage
/dashboard/:sensor  → DashboardPage (param unused — reserved)
/sensor/:sensorKey  → DetailPage  (sensorKey: temp | press | vib)
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

**Last Updated:** May 6, 2026

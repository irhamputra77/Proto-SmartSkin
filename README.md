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
/                   → LandingPage
/dashboard          → DashboardPage
/dashboard/:sensor  → DashboardPage (param unused — reserved)
/sensor/:sensorKey  → DetailPage  (sensorKey: temp | press | vib | flex | strain)
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

**Last Updated:** May 8, 2026

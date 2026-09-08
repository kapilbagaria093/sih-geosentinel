# GeoSentinel — Landslide Risk Management Portal (Frontend)

A React + Vite web frontend for the GeoSentinel landslide monitoring and
early-warning system, built for the North Eastern Region (NER) prototype
covering **Sikkim**. It talks to the Express/PostgreSQL backend described in
`geosentinel_backend_description.md`.

## Stack

- **React 19 + Vite** — SPA, client-side routed with `react-router-dom`
- **Tailwind CSS v4** — utility styling, theme driven by CSS custom properties
- **Leaflet + react-leaflet** — interactive map
- **geotiff.js** — decodes the raw GeoTIFF rasters served by `/layers/:id/file`
  directly in the browser and paints them onto canvas overlays with custom
  colour ramps (no server-side tile rendering needed for this prototype)
- **jsPDF** — generates the "Daily Hazard Bulletin" PDF client-side
- **axios** — API client with automatic JWT refresh

## Getting started

```bash
npm install
cp .env.example .env   # edit VITE_API_BASE_URL if your backend isn't on :8080
npm run dev
```

The app expects the backend from `geosentinel_backend_description.md` running
at the URL in `VITE_API_BASE_URL` (defaults to `http://localhost:8080`).
There is no `/api` or `/api/v1` prefix, matching the backend doc.

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run lint      # oxlint
```

## Pages

- `/` — Landing page: hero, module overview, and the three entry points
  (View Live Dashboard, Login to Report Incident, Get Alert)
- `/dashboard` — Live monitoring dashboard: GIS layer controls, interactive
  map, weather/rainfall, district risk, incident feed, and PDF bulletin
- `/report` — Phone-verified incident report submission (multipart upload)

## Assumptions made (per the project brief) and other adjustments

The brief explicitly asked us to assume two routes that don't exist on the
backend yet, plus we made a few pragmatic calls to keep the dashboard fully
functional against the **current** backend. All of these are called out in
code comments at the point of use — this section just collects them:

1. **`POST /alerts/register`** (`src/api/alerts.js`) — the brief's assumed
   route. Implemented with a JSON body `{ phoneNumber, districtIds }`. If the
   backend returns 404 (not implemented yet), the UI tells the user their
   preferences were captured but not yet sent, instead of pretending to
   succeed.

2. **Predicted landslide-risk raster** (`src/api/layers.js`) — assumed as
   `GET /layers/landslide-risk` / `GET /layers/landslide-risk/file`,
   mirroring the shape of the five real layers. The metadata for this one
   layer is declared locally (not fetched) since there's nothing to fetch
   yet; delete the local stub once the backend adds a real entry.

3. **`GET /reports` (incident feed listing)** — the backend doc itself
   proposes this as the "next endpoint" for the web dashboard but marks it
   as not implemented. The frontend calls it optimistically and degrades to
   an honest empty state ("live feed not available yet") plus a working
   "track a report by ID" tool (using the real `GET /reports/:id`) rather
   than showing fabricated incidents.

4. **OTP length: 6 digits, not 4.** The design brief mocks a 4-digit OTP
   input, but the backend's own examples (`"otp": "123456"`) are 6-digit.
   The real contract was followed; `OTP_LENGTH` in
   `src/components/common/AuthModal.jsx` is a single constant if this needs
   to change.

5. **Live weather & rainfall widget** — the backend has no weather module at
   all. `src/hooks/useWeather.js` calls the free, key-less
   [Open-Meteo](https://open-meteo.com) API directly from the browser for
   real current conditions and 24h cumulative rainfall at the map's current
   center. This never touches the GeoSentinel backend.

6. **District risk levels** are computed on the frontend
   (`src/hooks/useDistricts.js`) by bucketing `GET /landslides` records into
   districts via point-in-polygon against the Sikkim GeoJSON, then applying
   a simple, documented threshold (0–2 events = Low, 3–7 = Moderate, 8+ =
   High). This is a transparent placeholder heuristic, not a model output —
   swap it out once the backend exposes real aggregated/predicted risk per
   district.

7. **"Download Daily Hazard Bulletin (PDF)"** has no backend endpoint either;
   it's generated client-side (`src/utils/bulletin.js`) from whatever data is
   currently loaded in the dashboard (district risk, rainfall, incidents).

8. **GeoTIFF rendering** happens entirely client-side: `src/utils/decodeGeoTiff.js`
   fetches the raw `.tif` bytes, decodes them with `geotiff.js`, computes a
   min/max, applies a per-layer colour ramp (`src/utils/colorScales.js`), and
   hands Leaflet a canvas-rendered PNG as an image overlay. Rasters are
   downsampled to a max dimension of 900px for prototype-grade performance —
   raise `MAX_DIMENSION` in that file if you need higher fidelity.

## Project structure

```
src/
  api/            One file per backend module (auth, landslides, layers, reports, alerts)
  components/     UI components: common/, map/, dashboard/
  context/        ThemeContext (light/dark/hc), AuthContext (OTP session)
  data/           sikkim.geojson (district boundaries, bundled with the app)
  hooks/          useDistricts, useDashboardData, useWeather
  pages/          LandingPage, DashboardPage, ReportIncidentPage
  utils/          geo (point-in-polygon), colorScales, decodeGeoTiff, bulletin
```

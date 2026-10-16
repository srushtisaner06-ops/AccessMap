# AccessMap AI — "Know before you go."

Sociothon'26 · PS 09 · AI-Powered Accessibility Mapping (frontend MVP, ~50–60% of the envisioned product).

**All places and reports are fictional demonstration data. Nothing is verified in the real world.** Trust levels are transparent heuristics, not probabilities, and never guarantee a facility is accessible now.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # trust-engine unit tests (node:test, no extra deps)
npm run build && npm run preview
```
No API keys needed. The basemap uses public CARTO/OpenStreetMap raster tiles; if they cannot load, markers stay positioned and a notice appears. If WebGL is unavailable, a schematic fallback map is shown (search, filters, cards still work).

## Demo script (≈3 min)
1. Landing → **Explore Accessibility Map**.
2. Search "Kothrud" / "cafe"; tick **Lift availability** + **Accessible toilets**; try **Near me** (or choose an area if denied).
3. Open **Cafe Central**: entrance = High trust (photo, 2 reports); lift = **Needs Recheck / Low** with both conflicting reports; toilet = single 3-week-old report, Medium.
4. Expand "How trust was calculated" on any feature; open **All reports**.
5. Click **Try conflict demo** (adds a contradicting lift report to City Hospital) → lift flips to **Needs Recheck** immediately.
6. **Report an Issue** → submit with a photo → see before/after status, new report in history.
7. **Admin (DEMO)** → mark reviewed / flag / reject (reason required) → decision history. Reload: everything persists.
8. **Reset demo data** (navbar) restores the seed set.

## Trust rules (`src/lib/trustEngine.js`, config in `CONFIG`)
- **Freshness**: per-feature windows (lift 30d, crowd 14d, noise 45d, toilet 90d, wheelchair/parking 120d, entrance/signage 180d); weight steps down as a report ages.
- **Evidence**: photo = 2 pts, description (≥15 chars) = 1, none = 0. A photo is supporting evidence, not proof.
- **Agreement**: 1 recent report = 0 pts, 2 = 1, 3+ = 2.
- **Conflict**: recent definite reports (Accessible vs Not Accessible) disagree → **Needs Recheck**, Low trust, both shown.
- **Stale only** → Needs Recheck; **none / "Unable to confirm" only** → Limited Information.
- **Trust**: total ≥5 High, ≥3 Medium, else Low. High additionally needs a fresh report plus a photo or ≥2 agreeing reports. A flagged report caps trust at Medium.
- **Rejected** reports are excluded from calculation but kept visible. Nothing is deleted.
- **Place status** uses core features (entrance, wheelchair, lift, toilet): Needs Recheck > Barrier Reported > Limited Information > Confirmed Accessible. Place trust = weakest core feature. No single accessibility score.

## Structure
```
src/lib/        trustEngine.js (pure rules) · mockData.js · storage.js · validation.js · assistant.js · store.jsx · features.js
src/components/ MapView, SchematicMap, LocationCard, LocationDetails, FeatureStatusCard, ReportHistory, AccessibilityFilters, AccessibilityAssistant, TrustBadge, Legend, Layout
src/pages/      LandingPage, MapDashboard, ReportForm, AdminDashboard
```

## Where future integrations belong
- **FastAPI + PostgreSQL/PostGIS**: replace `storage.js` (load/save) with API calls (`GET /places?bbox=`, `POST /reports`, `POST /reports/{id}/review`); store places as PostGIS points; port `assessFeature` to Python with the same `CONFIG` (its return shape is the API contract); `store.jsx` is the only consumer.
- **IBM watsonx.ai / Granite**: add a provider in `src/lib/assistant.js` (`providers` registry) that calls a backend endpoint; keys stay server-side; ground prompts on the same report data. Currently **no AI model is connected**; the assistant is rule-based.
- **OpenCV / vision checks**: backend job on uploaded photos producing advisory evidence tags on a report (still not proof).
- **IBM Cloud Object Storage**: replace `src/lib/image.js` data-URL storage with pre-signed uploads; keep only the object reference in `report.photo`.
- **OpenRouteService**: add routing from the reference location to a selected place in `MapDashboard`/`LocationDetails`, filtering by the user's needs.

## Known limitations
- Data lives in browser localStorage (per browser; photos are downscaled; quota errors are surfaced).
- Admin sign-in is a mock; no real auth or roles. Review decisions are not real-world inspection.
- A conflict persists until older reports age out of the feature's window or a reviewer rejects one; there is no "resolution" workflow yet.
- Seed photos are placeholders, not images. Report authorship, spam control and moderation at scale are not implemented.
- Place-level status adds a fourth state, "Barrier Reported", so a reported barrier is not hidden under "Limited Information".
- Basemap tiles require internet access; no routing or navigation.
- Bundle is a single ~1 MB chunk (MapLibre); code-splitting is a quick later win.

## Map troubleshooting
- Default basemap: OpenStreetMap standard tiles (no key). To use another provider set `VITE_MAP_TILE_URL` (e.g. a MapTiler/Stadia/self-hosted XYZ URL including its key) in a `.env` file. Do not commit keys.
- If tiles fail or show an access/"API required" message, click **Use simple map** (remembered); it also switches automatically after repeated tile errors.

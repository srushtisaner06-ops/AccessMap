# AccessMap AI — Know before you go

AccessMap AI is an accessible Pune place-discovery application. It combines a map of sourced real places with user-submitted accessibility reports, feature-level evidence, freshness rules, and conflict detection.

The place list contains 10 Pune hospitals, cafés, colleges, parks, and public facilities. Place identity and location metadata include a public source link. Accessibility is not inferred from a place listing: new places begin with **Limited information** until a user submits evidence.

## Run

```bash
npm install
npm run dev
npm test
npm run build
```

The map uses public OpenStreetMap tiles. If tiles or WebGL are unavailable, the app keeps the place list and switches to a schematic map. The curated place list is cached locally for offline reuse.

## Demo access

- User: `user@accessmap.demo` / `user123`
- Admin: `admin@accessmap.demo` / `admin123`

The login is client-side demo authentication only. It is not production security.

## User workflow

1. Log in as a user and open the Accessibility Map.
2. Search places or areas and filter by category or accessibility feature.
3. Open a place to view its source, evidence status, feature details, and report history.
4. Submit a report based on a personal observation. Reports remain unverified community evidence until reviewed.

## Admin workflow

Admins can filter submissions, inspect evidence, mark reports reviewed, flag them for investigation, reject them with a reason, and view decision history. Admin review records moderation activity; it does not claim an independent physical inspection.

## Evidence rules

- No accessibility claims are seeded into the application.
- A missing report is shown as **Limited information**.
- Feature-specific freshness windows mark old information as needing recheck.
- Contradictory recent reports are marked **Needs Recheck** and both reports remain visible.
- Photos and descriptions support a report but do not prove accessibility.
- Rejected reports remain in history but are excluded from trust calculations.

## Structure

`src/lib/mockData.js` contains the curated sourced places. `trustEngine.js` contains pure freshness, evidence, trust, and conflict rules. `storage.js` persists reports and caches places. `store.jsx` is the single consumer-facing state layer.

The application intentionally has no backend, AI model, or production authentication. A future backend can replace the storage seam without changing the map, report, or trust-engine interfaces.

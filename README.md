# AccessMap AI — Know before you go

AccessMap AI is a hackathon demonstration of an accessibility evidence map for Pune. It contains 20 clearly labeled illustrative locations and seeded accessibility reports covering freshness, trust, conflicts, barriers, evidence quality, and moderation workflows.

**All locations, reports, timestamps, review decisions, and photos in the seeded dataset are demonstration data. They are not independently verified and do not guarantee current accessibility.** Seed photos are placeholders, not authentic photographs.

## Run

```bash
npm install
npm run dev
npm test
npm run build
```

The map uses public OpenStreetMap tiles and includes a keyboard-friendly list and schematic fallback when interactive map tiles or WebGL are unavailable.

## Demo access

- User: `user@accessmap.demo` / `user123`
- Admin: `admin@accessmap.demo` / `admin123`

## Demo walkthrough

1. Log in as the user and open the map. All 20 illustrative Pune locations are available in the list and map.
2. Use search, category, accessibility-feature, status, and trust filters.
3. Open **Explore Demo Scenarios** and try:
   - High trust entrance evidence
   - Conflicting lift reports
   - Outdated entrance evidence
   - Limited accessible-toilet information
   - Recently fixed entrance barrier
   - Pending admin review
4. Open a location to inspect feature-level status, trust explanation, timestamps, report counts, evidence, and history.
5. Use **Try Conflict Demo** on a suitable lift to add one controlled illustrative contradiction. Repeated clicks are prevented until the demo is reset.
6. Log in as admin to inspect pending, reviewed, flagged, rejected, and seeded reports. Review actions are stored locally and update the trust engine.
7. Use **Reset Demo Data** to restore the original 20 locations, 35 seeded reports, review decisions, and scenario states.

## Trust and evidence rules

- `trustEngine.js` is the only source of truth for freshness, trust, status, and conflict calculations.
- Feature freshness windows differ: lift 30 days, crowd 14 days, noise 45 days, toilet 90 days, wheelchair/parking 120 days, and entrance/signage 180 days.
- Recent contradictory definite reports produce **Needs Recheck** and remain visible together.
- Missing or unusable evidence produces **Limited Information**.
- Photos and descriptions support evidence but do not prove accessibility.
- Rejected reports remain in history but are excluded from current assessment.
- Place status and trust remain separate from individual feature statuses.

## Architecture

- `src/lib/mockData.js`: 20 demo places, deterministic seeded reports, reviews, and scenario registry.
- `src/lib/trustEngine.js`: pure freshness, evidence, trust, and conflict rules.
- `src/lib/storage.js`: localStorage persistence and schema-safe reset/migration.
- `src/lib/store.jsx`: report, review, scenario-conflict, reset, and toast actions.
- Existing React components continue to provide the map, fallback map, details panel, reporting workflow, assistant, and admin review.

No backend, additional dependency, or production authentication is used. The login is client-side demo authentication only.

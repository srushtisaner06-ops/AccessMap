// Persistence layer (localStorage). This is the seam for a future backend:
// replace load/save with calls to a FastAPI + PostgreSQL/PostGIS service
// (GET/POST /reports, POST /reports/{id}/review) and keep the same shapes.

const KEY = 'accessmap-ai:v1';
const PLACE_CACHE_KEY = 'accessmap-ai:places:v1';
export const SCHEMA_VERSION = 2;

function validPlace(p) {
  return p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.category === 'string'
    && typeof p.address === 'string' && Number.isFinite(p.lat) && Number.isFinite(p.lng)
    && Array.isArray(p.features) && typeof p.sourceUrl === 'string';
}

export function loadCachedPlaces(fallback) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PLACE_CACHE_KEY) || 'null');
    if (parsed && Array.isArray(parsed.places) && parsed.places.every(validPlace)) return parsed;
  } catch { /* use bundled curated places */ }
  return { places: fallback, cachedAt: null };
}

export function cachePlaces(places) {
  try {
    window.localStorage.setItem(PLACE_CACHE_KEY, JSON.stringify({ places, cachedAt: new Date().toISOString() }));
  } catch { /* place cache is best effort */ }
}

export function freshState(now = Date.now()) {
  return { version: SCHEMA_VERSION, seededAt: now, reports: [], reviews: [] };
}

function isValidReport(r) {
  return r && typeof r === 'object' && typeof r.id === 'string' && typeof r.placeId === 'string'
    && typeof r.featureId === 'string' && ['accessible', 'not_accessible', 'unable'].includes(r.status)
    && Number.isFinite(r.visitedAt) && Number.isFinite(r.submittedAt);
}

export function loadState() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { state: freshState(), error: null, fresh: true };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.reports)) throw new Error('Unrecognised saved data');
    const reports = parsed.reports.filter(isValidReport).map((r) => ({ reviewState: 'pending', reviewReason: '', description: '', photo: null, source: 'community', ...r }));
    const reviews = Array.isArray(parsed.reviews) ? parsed.reviews.filter((x) => x && typeof x.reportId === 'string') : [];
    return { state: { ...parsed, reports, reviews }, error: reports.length !== parsed.reports.length ? 'Some saved reports were malformed and were skipped.' : null, fresh: false };
  } catch (e) {
    return { state: freshState(), error: 'Saved report data could not be read, so the empty evidence state was restored.', fresh: true };
  }
}

/** @returns {{ok:boolean, error?:string}} */
export function saveState(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return { ok: true };
  } catch (e) {
    const quota = e && (e.name === 'QuotaExceededError' || e.code === 22);
    return { ok: false, error: quota ? 'Browser storage is full (photos are large). The latest change was not saved.' : 'Browser storage is unavailable. Changes will be lost on reload.' };
  }
}

export function clearState() {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}

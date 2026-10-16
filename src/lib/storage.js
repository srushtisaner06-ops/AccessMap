// Persistence layer (localStorage). This is the seam for a future backend:
// replace load/save with calls to a FastAPI + PostgreSQL/PostGIS service
// (GET/POST /reports, POST /reports/{id}/review) and keep the same shapes.

import { buildSeedReports, buildSeedReviews } from './mockData.js';

const KEY = 'accessmap-ai:v1';
export const SCHEMA_VERSION = 1;

export function freshState(now = Date.now()) {
  const reports = buildSeedReports(now);
  return { version: SCHEMA_VERSION, seededAt: now, reports, reviews: buildSeedReviews(reports, now) };
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
    return { state: freshState(), error: 'Saved demo data could not be read, so the sample data was restored.', fresh: true };
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

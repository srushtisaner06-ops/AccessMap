import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadState, saveState, freshState, clearState, loadCachedPlaces, cachePlaces } from './storage.js';
import { DEMO_SCENARIOS, PLACE_BY_ID, PLACES } from './mockData.js';
import { assessAll, assessFeature } from './trustEngine.js';
import { validateReportInput } from './validation.js';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

let toastId = 0;

export function StoreProvider({ children }) {
  const initial = useRef(null);
  if (!initial.current) initial.current = loadState();
  const placeCache = useRef(loadCachedPlaces(PLACES));
  const places = placeCache.current.places;
  const [state, setState] = useState(initial.current.state);
  const [storageError, setStorageError] = useState(initial.current.error);
  const [toasts, setToasts] = useState([]);
  const [tick, setTick] = useState(() => Date.now()); // "now" used for freshness
  const skipSave = useRef(initial.current.fresh ? false : true);

  // Persist after every change
  useEffect(() => {
    if (skipSave.current) { skipSave.current = false; return; }
    const res = saveState(state);
    setStorageError(res.ok ? null : res.error);
  }, [state]);
  // Save the initial empty report state once so reload persistence is established.
  useEffect(() => { if (initial.current.fresh) saveState(initial.current.state); }, []);
  useEffect(() => { cachePlaces(PLACES); }, []);

  // Keep freshness current while the tab is open and sync across tabs
  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 60000);
    const onStorage = (e) => { if (e.key === 'accessmap-ai:v1') { const { state: s } = loadState(); skipSave.current = true; setState(s); } };
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(t); window.removeEventListener('storage', onStorage); };
  }, []);

  const now = tick;
  const assessments = useMemo(() => assessAll(places, state.reports, now), [places, state.reports, now]);

  const toast = useCallback((message, kind = 'success') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const addReport = useCallback((input) => {
    const t = Date.now();
    const errors = validateReportInput(input, t);
    if (Object.keys(errors).length) return { ok: false, errors };
    const visitedAt = typeof input.visitedAt === 'number' ? input.visitedAt : new Date(input.visitedAt).getTime();
    const report = {
      id: `r-${t.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      placeId: input.placeId, featureId: input.featureId, status: input.status,
      visitedAt, submittedAt: t,
      description: (input.description || '').trim(),
      photo: input.photo ? { dataUrl: input.photo, caption: 'Photo supplied by visitor (not independently verified)' } : null,
      source: input.source || 'community',
      sourceLabel: input.sourceLabel || (input.source === 'demo' ? 'Demo scenario report' : 'Community report (unverified)'),
      reviewState: 'pending', reviewReason: '',
    };
    const before = assessFeature(input.placeId, input.featureId, state.reports, t);
    const after = assessFeature(input.placeId, input.featureId, [...state.reports, report], t);
    setState((s) => ({ ...s, reports: [...s.reports, report] }));
    setTick(t);
    return { ok: true, report, before, after };
  }, [state.reports]);

  const runConflictDemo = useCallback((placeId, featureId) => {
    const place = PLACE_BY_ID[placeId];
    const assessment = assessments[placeId]?.byId?.[featureId];
    if (!place || !assessment) return { ok: false, error: 'That demo scenario is unavailable.' };
    if (assessment.agreement === 'conflict') return { ok: false, error: 'This feature already shows conflicting reports. Reset demo data to repeat the demo.' };
    if (!['accessible', 'not_accessible'].includes(assessment.state)) return { ok: false, error: 'Select a feature with a current accessible or not accessible report.' };
    const opposite = assessment.state === 'accessible' ? 'not_accessible' : 'accessible';
    const res = addReport({
      placeId, featureId, status: opposite, visitedAt: Date.now() - 60000,
      description: 'Demo-generated report added to illustrate conflict detection.', confirmed: true, source: 'demo', sourceLabel: 'Demo scenario report',
    });
    return { ...res, place };
  }, [assessments, addReport]);

  const reviewReport = useCallback((reportId, decision, reason = '') => {
    if (!['reviewed', 'flagged', 'rejected'].includes(decision)) return { ok: false, error: 'Unknown decision.' };
    if (decision === 'rejected' && !reason.trim()) return { ok: false, error: 'A reason is required to reject a report.' };
    const at = Date.now();
    setState((s) => ({
      ...s,
      reports: s.reports.map((r) => (r.id === reportId ? { ...r, reviewState: decision, reviewReason: reason.trim() } : r)),
      reviews: [...s.reviews, { id: `rv-${at.toString(36)}-${Math.random().toString(36).slice(2, 5)}`, reportId, decision, reason: reason.trim(), reviewer: 'Demo admin', at }],
    }));
    setTick(at);
    return { ok: true };
  }, []);

  const resetDemo = useCallback(() => {
    clearState();
    const s = freshState();
    setState(s); setTick(Date.now());
    saveState(s);
  }, []);

  const value = useMemo(() => ({
    places, reports: state.reports, reviews: state.reviews, assessments, now, demoScenarios: DEMO_SCENARIOS,
    addReport, reviewReport, runConflictDemo, resetDemo,
    toast, toasts, dismissToast, storageError, dismissStorageError: () => setStorageError(null),
  }), [state, assessments, now, addReport, reviewReport, runConflictDemo, resetDemo, toast, toasts, dismissToast, storageError]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

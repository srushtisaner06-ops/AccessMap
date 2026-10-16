import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadState, saveState, freshState, clearState } from './storage.js';
import { PLACES, PLACE_BY_ID } from './mockData.js';
import { assessAll, assessFeature } from './trustEngine.js';
import { validateReportInput } from './validation.js';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

let toastId = 0;

export function StoreProvider({ children }) {
  const initial = useRef(null);
  if (!initial.current) initial.current = loadState();
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
  // Save the initial seed once so "reload keeps data" holds even before any edit
  useEffect(() => { if (initial.current.fresh) saveState(initial.current.state); }, []);

  // Keep freshness current while the tab is open and sync across tabs
  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 60000);
    const onStorage = (e) => { if (e.key === 'accessmap-ai:v1') { const { state: s } = loadState(); skipSave.current = true; setState(s); } };
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(t); window.removeEventListener('storage', onStorage); };
  }, []);

  const now = tick;
  const assessments = useMemo(() => assessAll(PLACES, state.reports, now), [state.reports, now]);

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
      reviewState: 'pending', reviewReason: '',
    };
    const before = assessFeature(input.placeId, input.featureId, state.reports, t);
    const after = assessFeature(input.placeId, input.featureId, [...state.reports, report], t);
    setState((s) => ({ ...s, reports: [...s.reports, report] }));
    setTick(t);
    return { ok: true, report, before, after };
  }, [state.reports]);

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

  /** Adds a conflicting report to the first place whose lift is currently consistent. */
  const conflictDemoTarget = useMemo(() => {
    const order = ['city-hospital', ...PLACES.map((p) => p.id)];
    for (const id of order) {
      const p = PLACE_BY_ID[id]; const a = assessments[id]?.byId?.lift;
      if (p?.features.includes('lift') && a && (a.state === 'accessible' || a.state === 'not_accessible')) return { place: p, assessment: a };
    }
    return null;
  }, [assessments]);

  const runConflictDemo = useCallback((placeId) => {
    const target = placeId ? { place: PLACE_BY_ID[placeId], assessment: assessments[placeId]?.byId?.lift } : conflictDemoTarget;
    if (!target?.place || !target.assessment || !['accessible', 'not_accessible'].includes(target.assessment.state)) return { ok: false, error: 'No place with a consistent lift status is available. Reset demo data to repeat the demo.' };
    const opposite = target.assessment.state === 'accessible' ? 'not_accessible' : 'accessible';
    const res = addReport({
      placeId: target.place.id, featureId: 'lift', status: opposite, visitedAt: Date.now() - 60000,
      description: 'Demo-generated report added by the "Try conflict demo" control to illustrate conflict detection.',
      confirmed: true, source: 'demo',
    });
    return { ...res, place: target.place };
  }, [assessments, conflictDemoTarget, addReport]);

  const resetDemo = useCallback(() => {
    clearState();
    const s = freshState();
    setState(s); setTick(Date.now());
    saveState(s);
  }, []);

  const value = useMemo(() => ({
    places: PLACES, reports: state.reports, reviews: state.reviews, assessments, now,
    addReport, reviewReport, runConflictDemo, conflictDemoTarget, resetDemo,
    toast, toasts, dismissToast, storageError, dismissStorageError: () => setStorageError(null),
  }), [state, assessments, now, addReport, reviewReport, runConflictDemo, conflictDemoTarget, resetDemo, toast, toasts, dismissToast, storageError]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

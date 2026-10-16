// Trust & conflict engine — deterministic, UI-free, unit-testable.
//
// IMPORTANT: Trust levels are transparent heuristics, NOT statistically
// validated probabilities. Status (what was reported) and trust (how much
// supporting information exists) are kept separate on purpose.
//
// To port this to a backend (FastAPI), re-implement `assessFeature` with the
// same CONFIG; the shapes returned here are the API contract.

import { FEATURES, FEATURE_BY_ID } from './features.js';
import { ageDays } from './format.js';

export const CONFIG = {
  // Feature-specific freshness windows come from features.js (freshnessDays).
  defaultFreshnessDays: 90,

  // Weight of a report by age, as a fraction of the feature's freshness window.
  // Reports older than 2x the window have almost no weight.
  freshnessBands: [
    { upTo: 0.25, weight: 1.0 },
    { upTo: 0.5, weight: 0.75 },
    { upTo: 1.0, weight: 0.5 },
    { upTo: 2.0, weight: 0.2 },
    { upTo: Infinity, weight: 0.05 },
  ],

  // Trust points (max total = 6)
  freshnessMaxPoints: 2, // freshnessMaxPoints * weight of the newest agreeing report
  evidencePoints: { photo: 2, description: 1, none: 0 },
  descriptionMinChars: 15,
  agreementPoints: { 1: 0, 2: 1, 3: 2 }, // by number of agreeing recent reports (3 = 3 or more)

  thresholds: { high: 5, medium: 3 }, // total >= high -> High; >= medium -> Medium; else Low

  // Extra guards: High trust additionally requires ALL of these.
  highRequires: { minFreshnessWeight: 0.75, photoOrMultipleReports: true },

  // A report flagged for investigation caps trust at this level.
  flaggedCap: 'medium',
};

export const TRUST_ORDER = { low: 0, medium: 1, high: 2 };
export const TRUST_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };
export const STATE_LABEL = {
  accessible: 'Accessible',
  not_accessible: 'Not accessible',
  needs_recheck: 'Needs Recheck',
  limited: 'Limited Information',
};
export const PLACE_STATUS_LABEL = {
  confirmed: 'Confirmed Accessible',
  needs_recheck: 'Needs Recheck',
  limited: 'Limited Information',
  barrier: 'Barrier Reported',
};

const DEFINITIVE = new Set(['accessible', 'not_accessible']);

export function windowDaysFor(featureId, config = CONFIG) {
  return FEATURE_BY_ID[featureId]?.freshnessDays ?? config.defaultFreshnessDays;
}

export function freshnessWeight(ageInDays, windowDays, config = CONFIG) {
  const frac = ageInDays / windowDays;
  for (const band of config.freshnessBands) if (frac <= band.upTo) return band.weight;
  return 0.05;
}

export function evidenceOf(report, config = CONFIG) {
  const photo = Boolean(report?.photo);
  const description = typeof report?.description === 'string' && report.description.trim().length >= config.descriptionMinChars;
  return { photo, description, level: photo ? 'photo' : description ? 'description' : 'none' };
}

function pickTrust(total) {
  if (total >= CONFIG.thresholds.high) return 'high';
  if (total >= CONFIG.thresholds.medium) return 'medium';
  return 'low';
}

const byVisitDesc = (a, b) => b.visitedAt - a.visitedAt || b.submittedAt - a.submittedAt;

/**
 * Assess one feature of one place.
 * @returns {{
 *  featureId, state, reportedStatus, trust, reason, trustExplanation, factors,
 *  notes, lastConfirmedAt, latestReport, history, reportCount, activeCount,
 *  rejectedCount, agreement, conflictingReports, hasPhoto, windowDays, score
 * }}
 */
export function assessFeature(placeId, featureId, reports, now = Date.now(), config = CONFIG) {
  const windowDays = windowDaysFor(featureId, config);
  const history = (reports || [])
    .filter((r) => r && r.placeId === placeId && r.featureId === featureId && Number.isFinite(r.visitedAt))
    .sort(byVisitDesc);
  const active = history.filter((r) => r.reviewState !== 'rejected');
  const rejectedCount = history.length - active.length;
  const definitive = active.filter((r) => DEFINITIVE.has(r.status));
  const recent = definitive.filter((r) => ageDays(r.visitedAt, now) <= windowDays);

  const base = {
    featureId, windowDays, history, reportCount: history.length, activeCount: active.length, rejectedCount,
    latestReport: active[0] || null,
    lastConfirmedAt: definitive[0]?.visitedAt ?? null,
    hasPhoto: active.some((r) => r.photo),
    conflictingReports: [], factors: [], notes: [], score: 0, reportedStatus: null,
  };
  if (rejectedCount) base.notes.push(`${rejectedCount} rejected report(s) are kept in history but ignored in the calculation.`);

  // Rule 5a — nothing usable
  if (active.length === 0) {
    return { ...base, state: 'limited', trust: 'low', agreement: 'none',
      reason: history.length ? 'Every report for this feature was rejected on review.' : 'No reports yet for this feature.',
      trustExplanation: 'Low trust: there is no usable evidence.' };
  }
  if (definitive.length === 0) {
    return { ...base, state: 'limited', trust: 'low', agreement: 'none',
      reason: 'Visitors could not confirm this feature; there is no definite report either way.',
      trustExplanation: 'Low trust: only "Unable to confirm" reports exist.' };
  }

  // Rule 5b — only stale information
  if (recent.length === 0) {
    const last = definitive[0];
    const d = Math.floor(ageDays(last.visitedAt, now));
    const only = definitive.length === 1 ? 'Only one older report is available' : 'Only older reports are available';
    return { ...base, state: 'needs_recheck', trust: 'low', agreement: 'stale', reportedStatus: last.status,
      reason: `${only}: the latest was ${d} days ago, beyond the ${windowDays}-day freshness window for this feature.`,
      trustExplanation: 'Low trust: the newest information is outside the freshness window, so it may be out of date.' };
  }

  // Rule 3 & 4 — agreement / conflict among recent definite reports
  const acc = recent.filter((r) => r.status === 'accessible');
  const notAcc = recent.filter((r) => r.status === 'not_accessible');
  if (acc.length && notAcc.length) {
    return { ...base, state: 'needs_recheck', trust: 'low', agreement: 'conflict',
      reportedStatus: recent[0].status, conflictingReports: recent,
      reason: `Recent reports disagree: ${acc.length} ${acc.length === 1 ? 'says' : 'say'} accessible, ${notAcc.length} ${notAcc.length === 1 ? 'says' : 'say'} not accessible (all within the last ${windowDays} days). Nobody can tell which is current until it is rechecked.`,
      trustExplanation: 'Low trust: conflicting recent reports. Both sides stay visible in the history.' };
  }

  // Agreeing recent reports -> compute trust
  const status = recent[0].status;
  const newest = recent[0];
  const w = freshnessWeight(ageDays(newest.visitedAt, now), windowDays, config);
  const fPts = config.freshnessMaxPoints * w;
  const bestEvidence = recent.map((r) => evidenceOf(r, config).level);
  const evLevel = bestEvidence.includes('photo') ? 'photo' : bestEvidence.includes('description') ? 'description' : 'none';
  const ePts = config.evidencePoints[evLevel];
  const n = Math.min(recent.length, 3);
  const aPts = config.agreementPoints[n];
  const total = fPts + ePts + aPts;

  let trust = pickTrust(total);
  const notes = [...base.notes];
  if (trust === 'high') {
    const okFresh = w >= config.highRequires.minFreshnessWeight;
    const okEvidence = !config.highRequires.photoOrMultipleReports || evLevel === 'photo' || recent.length >= 2;
    if (!okFresh || !okEvidence) {
      trust = 'medium';
      notes.push('Capped at Medium: High trust needs a recent report plus a photo or at least two agreeing reports.');
    }
  }
  if (recent.some((r) => r.reviewState === 'flagged') && TRUST_ORDER[trust] > TRUST_ORDER[config.flaggedCap]) {
    trust = config.flaggedCap;
    notes.push('Capped at Medium: a report for this feature is flagged for further investigation.');
  }
  const older = definitive.filter((r) => !recent.includes(r) && r.status !== status);
  if (older.length) notes.push(`${older.length} older report(s) said the opposite; they are outside the freshness window but remain in history.`);

  const dNewest = Math.floor(ageDays(newest.visitedAt, now));
  const factors = [
    { key: 'freshness', label: 'Freshness', points: +fPts.toFixed(2), max: config.freshnessMaxPoints,
      detail: `Newest agreeing report is ${dNewest === 0 ? 'from today' : `${dNewest} day(s) old`} (window ${windowDays} days).` },
    { key: 'evidence', label: 'Evidence', points: ePts, max: config.evidencePoints.photo,
      detail: evLevel === 'photo' ? 'A photo was supplied (supporting evidence, not proof).'
        : evLevel === 'description' ? 'Written description, but no photo.' : 'No photo or description.' },
    { key: 'agreement', label: 'Agreement', points: aPts, max: config.agreementPoints[3],
      detail: recent.length === 1 ? 'Only one recent report.' : `${recent.length} recent reports agree.` },
  ];

  const reason = `${recent.length === 1 ? 'One recent report says' : `${recent.length} recent reports agree:`} ${status === 'accessible' ? 'accessible' : 'not accessible'}.`
    + (recent.length === 1 ? ' Only a single report is available.' : '');
  const why = [];
  if (w < 0.75) why.push('the newest report is getting old');
  if (evLevel === 'none') why.push('no photo or description');
  else if (evLevel === 'description') why.push('no photo');
  if (recent.length === 1) why.push('only one report');
  const trustExplanation = trust === 'high'
    ? 'High trust: recent, supported by evidence, and reports agree.'
    : `${trust === 'medium' ? 'Medium' : 'Low'} trust${why.length ? `: ${why.join(', ')}` : ''}.`;

  return { ...base, state: status, trust, agreement: recent.length > 1 ? 'agree' : 'single', reportedStatus: status,
    reason, trustExplanation, factors, notes, score: +total.toFixed(2) };
}

/** Assess a whole place. Place status is about the INFORMATION available for core features. */
export function assessPlace(place, reports, now = Date.now(), config = CONFIG) {
  const features = place.features.map((id) => assessFeature(place.id, id, reports, now, config));
  const byId = Object.fromEntries(features.map((f) => [f.featureId, f]));
  const core = features.filter((f) => FEATURE_BY_ID[f.featureId]?.core);

  let status = 'confirmed';
  let reason;
  if (core.some((f) => f.state === 'needs_recheck')) {
    status = 'needs_recheck';
    const names = core.filter((f) => f.state === 'needs_recheck').map((f) => FEATURE_BY_ID[f.featureId].label.toLowerCase());
    reason = `Needs recheck: ${names.join(', ')} ${names.length > 1 ? 'have' : 'has'} conflicting or outdated reports.`;
  } else if (core.some((f) => f.state === 'not_accessible')) {
    status = 'barrier';
    const names = core.filter((f) => f.state === 'not_accessible').map((f) => FEATURE_BY_ID[f.featureId].label.toLowerCase());
    reason = `Barrier reported: ${names.join(', ')}.`;
  } else if (core.some((f) => f.state === 'limited')) {
    status = 'limited';
    const names = core.filter((f) => f.state === 'limited').map((f) => FEATURE_BY_ID[f.featureId].label.toLowerCase());
    reason = `Limited information: not enough usable reports for ${names.join(', ')}.`;
  } else {
    reason = 'All core features have recent, consistent reports. This reflects available evidence, not a guarantee.';
  }

  // Place trust = weakest-link among core features that have a reading.
  const rated = core.filter((f) => f.state !== 'limited');
  const trust = rated.length ? rated.reduce((m, f) => (TRUST_ORDER[f.trust] < TRUST_ORDER[m] ? f.trust : m), 'high') : 'low';
  const lastConfirmedAt = features.reduce((m, f) => (f.lastConfirmedAt && f.lastConfirmedAt > m ? f.lastConfirmedAt : m), 0) || null;
  const reportCount = features.reduce((s, f) => s + f.reportCount, 0);
  const conflictCount = features.filter((f) => f.agreement === 'conflict').length;

  return { placeId: place.id, status, reason, trust, features, byId, lastConfirmedAt, reportCount, conflictCount,
    trustNote: 'Place trust is the lowest trust among its core features (weakest link).' };
}

export function assessAll(places, reports, now = Date.now(), config = CONFIG) {
  const out = {};
  for (const p of places) out[p.id] = assessPlace(p, reports, now, config);
  return out;
}

/** Does this feature satisfy a user's filter? Strict: must be currently accessible. */
export function matchesFilter(assessment, featureId, { includeRecheck = false } = {}) {
  const f = assessment?.byId?.[featureId];
  if (!f) return false;
  if (f.state === 'accessible') return true;
  return includeRecheck && f.state === 'needs_recheck';
}

export const ALL_FEATURE_IDS = FEATURES.map((f) => f.id);

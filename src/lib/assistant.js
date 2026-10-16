// Deterministic, rule-based assistant grounded in the displayed dataset.
// NOT an AI model. The `providers` registry shows where a watsonx.ai / Granite
// provider would plug in: implement `answer(question, context)` server-side
// (never call the model with a secret key from the browser) and return the
// same { text, sources } shape.

import { FEATURES, FEATURE_BY_ID } from './features.js';
import { STATE_LABEL, TRUST_LABEL, PLACE_STATUS_LABEL } from './trustEngine.js';
import { relTime, absDate } from './format.js';
import { formatDistance } from './geo.js';

export const providers = [
  { id: 'rules', label: 'Rule-based demo assistant', ready: true },
  { id: 'watsonx-granite', label: 'IBM watsonx.ai / Granite', ready: false, note: 'Not connected. Planned: server-side call grounded on the same report data.' },
];

const KEYWORDS = {
  entrance: ['entrance', 'step-free', 'step free', 'steps', 'ramp', 'door', 'enter', 'entry'],
  wheelchair: ['wheelchair', 'inside', 'aisle', 'corridor', 'navigate'],
  lift: ['lift', 'elevator'],
  toilet: ['toilet', 'restroom', 'washroom', 'bathroom', 'loo'],
  parking: ['parking', 'park my', 'bay'],
  signage: ['sign', 'signage', 'signs', 'wayfinding'],
  noise: ['noise', 'noisy', 'loud', 'quiet', 'sensory'],
  crowd: ['crowd', 'crowded', 'queue', 'busy'],
};

function findFeature(q) {
  for (const [id, words] of Object.entries(KEYWORDS)) if (words.some((w) => q.includes(w))) return id;
  return null;
}
function findPlace(q, places) {
  return places.find((p) => {
    const words = p.name.toLowerCase().split(' ');
    const keys = [p.name.toLowerCase(), words.slice(0, 2).join(' ')];
    if (!['city', 'cafe'].includes(words[0])) keys.push(words[0]);
    return keys.some((k) => q.includes(k));
  });
}

function featureSummary(place, a, now) {
  const f = FEATURE_BY_ID[a.featureId];
  const label = f.label;
  if (a.state === 'limited') return `${label}: Limited Information. ${a.reason}`;
  if (a.state === 'needs_recheck') {
    if (a.agreement === 'conflict') {
      const lines = a.conflictingReports.map((r) => `  - ${r.status === 'accessible' ? 'Accessible' : 'Not accessible'}, visited ${relTime(r.visitedAt, now)}${r.photo ? ', with photo' : ', no photo'}`);
      return `${label}: Needs Recheck. ${a.reason}\n${lines.join('\n')}`;
    }
    return `${label}: Needs Recheck. ${a.reason}`;
  }
  return `${label}: ${STATE_LABEL[a.state]} (${TRUST_LABEL[a.trust]} trust). Last visit ${relTime(a.lastConfirmedAt, now)}${a.hasPhoto ? ', photo available' : ', no photo'}. ${a.trustExplanation}`;
}

export function answer(question, ctx) {
  const { places, assessments, place: selected, now, ref } = ctx;
  const q = (question || '').toLowerCase().trim();
  const disclaimer = 'This reflects available reports, not a guarantee that a facility is currently accessible.';
  if (!q) return { text: 'Ask a question about a place, for example "Is the entrance step-free?"', sources: [] };

  const mentioned = findPlace(q, places);
  const place = mentioned || selected;
  const featureId = findFeature(q);

  // Nearby / which places have X
  if (/(which|what|any|list|find).*(place|nearby|near|have|has|with)/.test(q) || q.includes('nearby') || q.includes('near me')) {
    if (!featureId) return { text: 'Tell me which feature you need (entrance, lift, toilet, wheelchair access, parking, signage, noise, crowd) and I will list places from the demo dataset.', sources: [] };
    const f = FEATURE_BY_ID[featureId];
    const rows = places.filter((p) => p.features.includes(featureId)).map((p) => ({ p, a: assessments[p.id].byId[featureId], d: p.distanceKm }))
      .sort((x, y) => (x.d ?? 99) - (y.d ?? 99));
    const ok = rows.filter((r) => r.a.state === 'accessible');
    const recheck = rows.filter((r) => r.a.state === 'needs_recheck');
    const nope = rows.filter((r) => r.a.state === 'not_accessible');
    const unk = rows.filter((r) => r.a.state === 'limited');
    const fmt = (r) => `${r.p.name}${r.d != null ? ` (${formatDistance(r.d)})` : ''} - ${TRUST_LABEL[r.a.trust]} trust`;
    const parts = [`Demo places with "${f.filterLabel.toLowerCase()}" information, distances from ${ref}:`];
    parts.push(ok.length ? `Reported accessible:\n${ok.map((r) => `  - ${fmt(r)}`).join('\n')}` : 'None currently reported accessible.');
    if (recheck.length) parts.push(`Needs Recheck (do not rely on these):\n${recheck.map((r) => `  - ${fmt(r)}`).join('\n')}`);
    if (nope.length) parts.push(`Reported not accessible:\n${nope.map((r) => `  - ${r.p.name}`).join('\n')}`);
    if (unk.length) parts.push(`No usable information: ${unk.map((r) => r.p.name).join(', ')}.`);
    parts.push(disclaimer);
    return { text: parts.join('\n\n'), sources: rows.map((r) => r.p.id) };
  }

  if (!place) return { text: 'Select a place on the map first, or mention one by name (for example "Cafe Central"). I only answer from the sample reports shown in this app.', sources: [] };
  const pa = assessments[place.id];

  // Why is X marked ...
  if (featureId && /(why|reason|explain|how come|mark)/.test(q)) {
    if (!place.features.includes(featureId)) return { text: `${FEATURE_BY_ID[featureId].label} is not tracked for ${place.name} in this dataset.`, sources: [place.id] };
    const a = pa.byId[featureId];
    const factors = a.factors.length ? `\n\nHow trust was derived:\n${a.factors.map((x) => `  - ${x.label}: ${x.points}/${x.max} - ${x.detail}`).join('\n')}` : '';
    const notes = a.notes.length ? `\n\nNotes:\n${a.notes.map((n) => `  - ${n}`).join('\n')}` : '';
    return { text: `${place.name} - ${FEATURE_BY_ID[featureId].label} is "${STATE_LABEL[a.state]}" with ${TRUST_LABEL[a.trust]} trust.\n\nReason: ${a.reason}\n${a.trustExplanation}${factors}${notes}\n\n${disclaimer}`, sources: [place.id] };
  }

  if (featureId) {
    if (!place.features.includes(featureId)) return { text: `${FEATURE_BY_ID[featureId].label} is not tracked for ${place.name} in this dataset, so I cannot answer.`, sources: [place.id] };
    const a = pa.byId[featureId];
    let extra = '';
    if (a.history.length > 1) extra = `\n\n${a.history.length} reports in history; latest visit ${absDate(a.history[0].visitedAt)}.`;
    return { text: `${place.name}\n${featureSummary(place, a, now)}${extra}\n\n${disclaimer}`, sources: [place.id] };
  }

  if (/(photo|evidence|picture)/.test(q)) {
    const withPhoto = pa.features.filter((f) => f.hasPhoto).map((f) => FEATURE_BY_ID[f.featureId].label);
    const without = pa.features.filter((f) => !f.hasPhoto).map((f) => FEATURE_BY_ID[f.featureId].label);
    return { text: `${place.name}: photo evidence exists for ${withPhoto.length ? withPhoto.join(', ') : 'no features'}. No photo for: ${without.length ? without.join(', ') : 'none'}.\nA photo is supporting evidence, not proof.`, sources: [place.id] };
  }

  if (/(trust|reliable|recent|updated|fresh|confirmed|last)/.test(q)) {
    return { text: `${place.name}: ${PLACE_STATUS_LABEL[pa.status]}. ${pa.reason}\nPlace trust: ${TRUST_LABEL[pa.trust]} (${pa.trustNote})\nLast confirmed ${pa.lastConfirmedAt ? relTime(pa.lastConfirmedAt, now) : 'never'}; ${pa.reportCount} reports; ${pa.conflictCount} feature(s) with conflicting reports.\n\n${disclaimer}`, sources: [place.id] };
  }

  // Default: overview
  const lines = pa.features.map((a) => `  - ${featureSummary(place, a, now).split('\n')[0]}`);
  return { text: `${place.name} overview (${PLACE_STATUS_LABEL[pa.status]}):\n${lines.join('\n')}\n\nAsk about a specific feature, for example "Is the entrance step-free?" or "Why is the lift marked Needs Recheck?".\n\n${disclaimer}`, sources: [place.id] };
}

export const SUGGESTIONS = [
  'Is the entrance step-free?',
  'Why is the lift marked Needs Recheck?',
  'Which nearby places have accessible toilets?',
  'How recent is this information?',
];

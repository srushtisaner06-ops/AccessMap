import test from 'node:test';
import assert from 'node:assert/strict';
import { assessFeature, assessPlace } from './trustEngine.js';
import { DEMO_REFERENCE_DATE, DEMO_SCENARIOS, PLACE_BY_ID, PLACES, buildSeedReports } from './mockData.js';

const NOW = Date.UTC(2026, 9, 14, 6, 0, 0);
const D = 86400000;
const rep = (o = {}) => ({
  id: Math.random().toString(), placeId: 'ruby-hall-clinic', featureId: 'lift', status: 'accessible',
  visitedAt: NOW, submittedAt: NOW, description: 'Observed during a visit.', photo: null, reviewState: 'pending', ...o,
});
const evidence = [
  rep({ id: 'entrance-1', featureId: 'entrance', photo: { dataUrl: 'data:image/png;base64,test' } }),
  rep({ id: 'entrance-2', featureId: 'entrance', visitedAt: NOW - D }),
  rep({ id: 'lift-1', status: 'accessible', photo: { dataUrl: 'data:image/png;base64,test' } }),
  rep({ id: 'lift-2', status: 'not_accessible', visitedAt: NOW - D }),
  rep({ id: 'toilet-1', featureId: 'toilet', visitedAt: NOW - 21 * D }),
];

test('places without evidence start with limited information', () => {
  const a = assessPlace(PLACE_BY_ID['ruby-hall-clinic'], [], NOW);
  assert.equal(a.status, 'limited');
  assert.equal(a.reportCount, 0);
});

test('recent photo and agreement produce high trust', () => {
  const a = assessFeature('ruby-hall-clinic', 'entrance', evidence, NOW);
  assert.equal(a.state, 'accessible'); assert.equal(a.trust, 'high');
});

test('conflicting recent reports produce Needs Recheck', () => {
  const a = assessFeature('ruby-hall-clinic', 'lift', evidence, NOW);
  assert.equal(a.state, 'needs_recheck'); assert.equal(a.trust, 'low');
  assert.equal(a.agreement, 'conflict'); assert.equal(a.conflictingReports.length, 2);
});

test('stale-only reports produce Needs Recheck and no reports are limited', () => {
  const stale = assessFeature('ruby-hall-clinic', 'lift', [rep({ visitedAt: NOW - 60 * D })], NOW);
  assert.equal(stale.state, 'needs_recheck'); assert.match(stale.reason, /Only one older report/);
  assert.equal(assessFeature('ruby-hall-clinic', 'lift', [], NOW).state, 'limited');
});

test('unable-only reports remain limited', () => {
  assert.equal(assessFeature('ruby-hall-clinic', 'lift', [rep({ status: 'unable' })], NOW).state, 'limited');
});

test('lift freshness window is shorter than entrance window', () => {
  const lift = [rep({ visitedAt: NOW - 60 * D })];
  assert.equal(assessFeature('ruby-hall-clinic', 'lift', lift, NOW).state, 'needs_recheck');
  assert.notEqual(assessFeature('ruby-hall-clinic', 'entrance', lift.map((x) => ({ ...x, featureId: 'entrance' })), NOW).state, 'needs_recheck');
});

test('rejected reports are ignored in calculation but kept in history', () => {
  const a = assessFeature('ruby-hall-clinic', 'lift', [rep({ status: 'not_accessible', reviewState: 'rejected' })], NOW);
  assert.equal(a.state, 'limited'); assert.equal(a.rejectedCount, 1);
  assert.ok(a.history.some((r) => r.reviewState === 'rejected'));
});

test('flagged report caps trust at medium', () => {
  const rs = [rep({ photo: { dataUrl: 'data:image/png;base64,test' }, reviewState: 'flagged' }), rep({ id: 'second', visitedAt: NOW - D })];
  assert.equal(assessFeature('ruby-hall-clinic', 'lift', rs, NOW).trust, 'medium');
});

test('place status reflects submitted evidence only', () => {
  const placeEvidence = [
    ...evidence,
    rep({ id: 'toilet-2', featureId: 'toilet', status: 'accessible' }),
    rep({ id: 'wheelchair-1', featureId: 'wheelchair', status: 'accessible' }),
  ];
  assert.equal(assessPlace(PLACE_BY_ID['ruby-hall-clinic'], [], NOW).status, 'limited');
  assert.equal(assessPlace(PLACE_BY_ID['ruby-hall-clinic'], placeEvidence, NOW).status, 'needs_recheck');
});

test('demo dataset has 20 places and deterministic seeded reports', () => {
  const first = buildSeedReports();
  const second = buildSeedReports();
  assert.equal(PLACES.length, 20);
  assert.equal(first.length, 35);
  assert.deepEqual(first, second);
  assert.ok(first.every((r) => r.source === 'demo' && r.id.startsWith('r-demo-')));
});

test('demo scenario registry exercises key computed states', () => {
  const assessments = Object.fromEntries(PLACES.map((p) => [p.id, assessPlace(p, buildSeedReports(), DEMO_REFERENCE_DATE)]));
  const stateFor = (id) => { const s = DEMO_SCENARIOS.find((x) => x.id === id); return assessments[s.placeId].byId[s.featureId].state; };
  assert.equal(stateFor('high-trust'), 'accessible');
  assert.equal(stateFor('conflicting-lift'), 'needs_recheck');
  assert.equal(stateFor('outdated-evidence'), 'needs_recheck');
  assert.equal(stateFor('limited-information'), 'limited');
});

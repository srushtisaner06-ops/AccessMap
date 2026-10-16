import test from 'node:test';
import assert from 'node:assert/strict';
import { assessFeature, assessPlace } from './trustEngine.js';
import { buildSeedReports, PLACE_BY_ID } from './mockData.js';

const NOW = Date.UTC(2026, 9, 14, 6, 0, 0);
const seed = buildSeedReports(NOW);
const rep = (o) => ({ id: Math.random().toString(), placeId: 'p', featureId: 'lift', status: 'accessible', visitedAt: NOW, submittedAt: NOW, description: '', photo: null, reviewState: 'pending', ...o });
const D = 86400000;

test('Cafe Central entrance: recent photo + agreement -> High', () => {
  const a = assessFeature('cafe-central', 'entrance', seed, NOW);
  assert.equal(a.state, 'accessible'); assert.equal(a.trust, 'high');
});
test('Cafe Central lift: conflict -> Needs Recheck, Low, both reports listed', () => {
  const a = assessFeature('cafe-central', 'lift', seed, NOW);
  assert.equal(a.state, 'needs_recheck'); assert.equal(a.trust, 'low'); assert.equal(a.agreement, 'conflict');
  assert.equal(a.conflictingReports.length, 2); assert.equal(a.history.length, 3);
});
test('Cafe Central toilet: single 3-week-old report without photo -> Medium or lower', () => {
  const a = assessFeature('cafe-central', 'toilet', seed, NOW);
  assert.equal(a.state, 'accessible'); assert.notEqual(a.trust, 'high');
});
test('stale-only reports -> Needs Recheck; no reports -> Limited', () => {
  const stale = assessFeature('p', 'lift', [rep({ visitedAt: NOW - 60 * D })], NOW);
  assert.equal(stale.state, 'needs_recheck'); assert.match(stale.reason, /Only one older report/);
  assert.equal(assessFeature('p', 'lift', [], NOW).state, 'limited');
});
test('unable-only -> Limited', () => {
  assert.equal(assessFeature('p', 'lift', [rep({ status: 'unable' })], NOW).state, 'limited');
});
test('lift window (30d) is shorter than entrance window (180d)', () => {
  const r = [rep({ visitedAt: NOW - 60 * D })];
  assert.equal(assessFeature('p', 'lift', r, NOW).state, 'needs_recheck');
  assert.notEqual(assessFeature('p', 'entrance', r.map((x) => ({ ...x, featureId: 'entrance' })), NOW).state, 'needs_recheck');
});
test('new conflicting report flips hospital lift and nothing is deleted', () => {
  const before = assessFeature('city-hospital', 'lift', seed, NOW);
  assert.equal(before.state, 'accessible');
  const next = [...seed, rep({ placeId: 'city-hospital', featureId: 'lift', status: 'not_accessible', visitedAt: NOW })];
  const after = assessFeature('city-hospital', 'lift', next, NOW);
  assert.equal(after.state, 'needs_recheck'); assert.equal(after.history.length, before.history.length + 1);
});
test('rejected reports are ignored in calculation but kept in history', () => {
  const next = [...seed, rep({ placeId: 'city-hospital', featureId: 'lift', status: 'not_accessible', reviewState: 'rejected' })];
  const a = assessFeature('city-hospital', 'lift', next, NOW);
  assert.equal(a.state, 'accessible'); assert.equal(a.rejectedCount, 1); assert.ok(a.history.some((r) => r.reviewState === 'rejected'));
});
test('flagged report caps trust at Medium', () => {
  const rs = [rep({ photo: { sample: true }, reviewState: 'flagged' }), rep({ visitedAt: NOW - D })];
  assert.equal(assessFeature('p', 'lift', rs, NOW).trust, 'medium');
});
test('place statuses', () => {
  assert.equal(assessPlace(PLACE_BY_ID['cafe-central'], seed, NOW).status, 'needs_recheck');
  assert.equal(assessPlace(PLACE_BY_ID['city-hospital'], seed, NOW).status, 'confirmed');
  assert.equal(assessPlace(PLACE_BY_ID['orion-mall'], seed, NOW).status, 'barrier');
  assert.equal(assessPlace(PLACE_BY_ID['swargate-metro'], seed, NOW).status, 'limited');
});

// DEMONSTRATION DATA ONLY. Places and reports below are fictional/illustrative
// and have NOT been verified in the real world.

const DAY = 86400000;
const HOUR = 3600000;

export const PLACES = [
  { id: 'cafe-central', name: 'Cafe Central', category: 'Cafe', area: 'Koregaon Park', address: 'Lane 5, Koregaon Park (demo)', lat: 18.5362, lng: 73.894,
    features: ['entrance', 'wheelchair', 'lift', 'toilet', 'parking', 'signage', 'noise'],
    blurb: 'Two-floor cafe. Seating upstairs is reached by lift.' },
  { id: 'city-hospital', name: 'City Hospital', category: 'Hospital', area: 'Deccan', address: 'Main Road, Deccan (demo)', lat: 18.5167, lng: 73.842,
    features: ['entrance', 'wheelchair', 'lift', 'toilet', 'parking', 'signage', 'noise', 'crowd'],
    blurb: 'Multi-storey general hospital with OPD and emergency wings.' },
  { id: 'shivajinagar-library', name: 'Shivajinagar Public Library', category: 'Library', area: 'Shivajinagar', address: 'University Road (demo)', lat: 18.5308, lng: 73.8475,
    features: ['entrance', 'wheelchair', 'lift', 'toilet', 'parking', 'signage', 'noise'],
    blurb: 'Public lending library with reading rooms on three floors.' },
  { id: 'riverside-park', name: 'Riverside Public Park', category: 'Public park', area: 'Kothrud', address: 'Riverside Path (demo)', lat: 18.5074, lng: 73.8077,
    features: ['entrance', 'wheelchair', 'toilet', 'parking', 'signage', 'crowd'],
    blurb: 'Landscaped riverside park with walking paths and a children\'s area.' },
  { id: 'orion-mall', name: 'Orion Shopping Centre', category: 'Shopping centre', area: 'Viman Nagar', address: 'Nagar Road (demo)', lat: 18.5679, lng: 73.9143,
    features: ['entrance', 'wheelchair', 'lift', 'toilet', 'parking', 'signage', 'noise', 'crowd'],
    blurb: 'Four-level shopping centre with food court.' },
  { id: 'aundh-community-centre', name: 'Aundh Community Centre', category: 'Community centre', area: 'Aundh', address: 'Aundh Gaon Road (demo)', lat: 18.558, lng: 73.8075,
    features: ['entrance', 'wheelchair', 'toilet', 'signage', 'noise'],
    blurb: 'Neighbourhood hall used for classes, meetings and events.' },
  { id: 'swargate-metro', name: 'Swargate Metro Concourse', category: 'Transit station', area: 'Swargate', address: 'Swargate (demo)', lat: 18.5018, lng: 73.8636,
    features: ['entrance', 'lift', 'signage', 'crowd'],
    blurb: 'Underground station concourse (sample entry).' },
];

export const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p]));

// [placeId, featureId, status, daysAgo, photo?, description, reviewState?]
const SEED_ROWS = [
  // ---- Cafe Central (scripted demo scenario) ----
  ['cafe-central', 'entrance', 'accessible', 2, true, 'Flat entrance, wide automatic door. No steps from pavement.'],
  ['cafe-central', 'entrance', 'accessible', 40, false, 'Ramp at side was not needed, entrance is level.', 'reviewed'],
  ['cafe-central', 'lift', 'accessible', 5, true, 'Lift worked fine, buttons at wheelchair height.'],
  ['cafe-central', 'lift', 'not_accessible', 3, false, 'Out-of-order sign on the lift; staff said repair is pending.'],
  ['cafe-central', 'lift', 'accessible', 70, false, '', 'reviewed'],
  ['cafe-central', 'toilet', 'accessible', 21, false, 'Accessible toilet at the back, door wide enough for a wheelchair.'],
  ['cafe-central', 'wheelchair', 'accessible', 12, false, 'Tables on ground floor are spaced out; easy to move around.'],
  ['cafe-central', 'parking', 'unable', 30, false, 'Could not tell which bays are reserved.'],
  ['cafe-central', 'signage', 'accessible', 60, false, ''],
  ['cafe-central', 'noise', 'not_accessible', 9, false, 'Very loud at lunchtime with music and espresso machine.'],

  // ---- City Hospital ----
  ['city-hospital', 'entrance', 'accessible', 4, true, 'Ramp and level entrance at main gate.'],
  ['city-hospital', 'entrance', 'accessible', 20, false, 'Main entrance step-free.', 'reviewed'],
  ['city-hospital', 'wheelchair', 'accessible', 6, true, 'Wide corridors, wheelchairs available at reception.'],
  ['city-hospital', 'lift', 'accessible', 3, true, 'Both lifts working, voice announcements present.'],
  ['city-hospital', 'lift', 'accessible', 9, false, 'Used the lift to reach OPD, no issues.'],
  ['city-hospital', 'toilet', 'accessible', 7, true, 'Accessible toilet on each floor, grab rails fitted.'],
  ['city-hospital', 'parking', 'accessible', 15, false, 'Two reserved bays near the entrance.'],
  ['city-hospital', 'signage', 'accessible', 30, false, 'Large colour-coded signs, easy to follow.'],
  ['city-hospital', 'noise', 'not_accessible', 5, false, 'Noisy waiting area during OPD hours.'],
  ['city-hospital', 'crowd', 'not_accessible', 2, false, 'Long queue at the entrance in the morning.'],

  // ---- Shivajinagar Public Library ----
  ['shivajinagar-library', 'entrance', 'accessible', 95, false, 'Short ramp at the entrance; gentle slope.'],
  ['shivajinagar-library', 'wheelchair', 'accessible', 25, false, 'Reading room aisles are wide enough.'],
  ['shivajinagar-library', 'lift', 'accessible', 14, true, 'Lift to all floors working.'],
  ['shivajinagar-library', 'toilet', 'accessible', 30, true, 'Accessible toilet on ground floor.'],
  ['shivajinagar-library', 'parking', 'accessible', 200, false, 'Bay near the gate.'],
  ['shivajinagar-library', 'signage', 'accessible', 20, true, 'Large-print signs.'],
  ['shivajinagar-library', 'noise', 'accessible', 10, false, 'Quiet throughout.', 'reviewed'],

  // ---- Riverside Public Park ----
  ['riverside-park', 'entrance', 'accessible', 14, false, 'Main gate is level, no steps.'],
  ['riverside-park', 'wheelchair', 'accessible', 18, false, 'Paved main loop is smooth and wide.'],
  ['riverside-park', 'wheelchair', 'not_accessible', 8, true, 'Gravel on the river-side path; difficult for wheelchairs.'],
  ['riverside-park', 'toilet', 'unable', 20, false, 'Toilet block was closed when I visited.'],
  ['riverside-park', 'crowd', 'accessible', 4, false, 'Quiet on a weekday morning.'],

  // ---- Orion Shopping Centre ----
  ['orion-mall', 'entrance', 'accessible', 6, true, 'Automatic doors, level entry.'],
  ['orion-mall', 'entrance', 'accessible', 11, true, 'No steps at the main entrance.'],
  ['orion-mall', 'wheelchair', 'accessible', 11, false, 'Wide aisles on ground and first floor.'],
  ['orion-mall', 'lift', 'accessible', 4, true, 'Lifts working, large buttons.'],
  ['orion-mall', 'lift', 'accessible', 6, false, 'Used lifts to reach food court.'],
  ['orion-mall', 'toilet', 'not_accessible', 10, true, 'Accessible toilet was locked and used as storage.'],
  ['orion-mall', 'toilet', 'not_accessible', 25, false, 'Key must be fetched from security; very slow.'],
  ['orion-mall', 'parking', 'accessible', 8, false, 'Bays near the lift lobby.'],
  ['orion-mall', 'crowd', 'not_accessible', 3, false, 'Weekend crowds at the entrance.'],
  ['orion-mall', 'noise', 'not_accessible', 12, false, 'Loud announcements in the atrium.'],

  // ---- Aundh Community Centre (mostly outdated) ----
  ['aundh-community-centre', 'entrance', 'accessible', 150, false, ''],
  ['aundh-community-centre', 'toilet', 'accessible', 130, false, 'Toilet looked accessible.'],
  ['aundh-community-centre', 'signage', 'not_accessible', 40, false, 'Hall numbers hard to read.'],

  // ---- Swargate Metro Concourse (sparse) ----
  ['swargate-metro', 'entrance', 'accessible', 20, false, 'Escalator and ramp at the north entrance.'],
  ['swargate-metro', 'signage', 'accessible', 33, false, ''],
];

// Hours of the day (before "now") used so seed visits don't all land at the same clock time.
const HOUR_JITTER = [2, 5, 3, 7, 1, 6, 4, 8];

export function buildSeedReports(now = Date.now()) {
  return SEED_ROWS.map((row, i) => {
    const [placeId, featureId, status, daysAgo, photo, description, review] = row;
    const visitedAt = now - daysAgo * DAY - HOUR_JITTER[i % HOUR_JITTER.length] * HOUR;
    return {
      id: `r-seed-${String(i + 1).padStart(3, '0')}`,
      placeId, featureId, status,
      visitedAt,
      submittedAt: visitedAt + 3 * HOUR,
      description: description || '',
      photo: photo ? { sample: true, caption: 'Sample photo (illustrative placeholder, not a real photograph)' } : null,
      source: 'seed',
      reviewState: review || 'pending',
      reviewReason: '',
    };
  });
}

export function buildSeedReviews(reports, now = Date.now()) {
  return reports
    .filter((r) => r.reviewState === 'reviewed')
    .map((r, i) => ({
      id: `rv-seed-${i + 1}`, reportId: r.id, decision: 'reviewed', reason: 'Seed data: marked reviewed for the demo.',
      reviewer: 'Demo admin', at: r.submittedAt + DAY,
    }));
}

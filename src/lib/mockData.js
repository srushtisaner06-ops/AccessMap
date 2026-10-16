// Illustrative demo dataset only. Locations, reports, timestamps and evidence
// below are fictional demonstration records and are not independently verified.

export const DEMO_REFERENCE_DATE = Date.UTC(2026, 9, 15, 12, 0, 0);
const DAY = 86400000;
const HOUR = 3600000;
const DEMO_SOURCE = 'Illustrative demo dataset (not independently verified)';
const COMMON = ['entrance', 'wheelchair', 'toilet', 'parking', 'signage', 'noise', 'crowd'];
const VERTICAL = [...COMMON, 'lift'];
const demoPlace = (p) => ({ ...p, isDemo: true, demoLabel: 'Illustrative demo data', sourceName: DEMO_SOURCE, sourceUrl: null, sourceUpdatedAt: '2026-10-15' });

export const PLACES = [
  demoPlace({ id: 'ruby-hall-clinic', name: 'Ruby Hall Demo Clinic', category: 'Hospital', area: 'Sangamvadi', address: 'Sassoon Road area, Pune (demo)', lat: 18.53354, lng: 73.87715, features: VERTICAL, blurb: 'Illustrative multispeciality clinic scenario.' }),
  demoPlace({ id: 'deenanath-demo-hospital', name: 'Deenanath Demo Hospital', category: 'Hospital', area: 'Erandwane', address: 'Near Mhatre Bridge, Pune (demo)', lat: 18.50201, lng: 73.83284, features: VERTICAL, blurb: 'Illustrative hospital scenario with conflicting lift reports.' }),
  demoPlace({ id: 'goodluck-demo-cafe', name: 'Goodluck Demo Cafe', category: 'Cafe', area: 'Deccan Gymkhana', address: 'Fergusson College Road area, Pune (demo)', lat: 18.52891, lng: 73.84038, features: COMMON, blurb: 'Illustrative cafe scenario with old evidence.' }),
  demoPlace({ id: 'vaishali-demo-restaurant', name: 'Vaishali Demo Restaurant', category: 'Cafe', area: 'Shivajinagar', address: 'Fergusson College Road area, Pune (demo)', lat: 18.52916, lng: 73.84073, features: COMMON, blurb: 'Illustrative restaurant with limited toilet information.' }),
  demoPlace({ id: 'fergusson-demo-college', name: 'Fergusson Demo College', category: 'College', area: 'Shivajinagar', address: 'Fergusson College Road area, Pune (demo)', lat: 18.53082, lng: 73.84062, features: VERTICAL, blurb: 'Illustrative educational-institution scenario.' }),
  demoPlace({ id: 'symbiosis-demo-college', name: 'Symbiosis Demo College', category: 'College', area: 'Shivajinagar', address: 'Senapati Bapat Road area, Pune (demo)', lat: 18.52856, lng: 73.82958, features: VERTICAL, blurb: 'Illustrative college with conflicting toilet reports.' }),
  demoPlace({ id: 'sarasbaug-demo-park', name: 'Sarasbaug Demo Park', category: 'Park', area: 'Parvati', address: 'Sarasbaug area, Pune (demo)', lat: 18.50196, lng: 73.85819, features: ['entrance', 'wheelchair', 'toilet', 'parking', 'signage', 'crowd'], blurb: 'Illustrative park scenario showing an improvement.' }),
  demoPlace({ id: 'empress-demo-garden', name: 'Empress Demo Garden', category: 'Park', area: 'Camp', address: 'Race Course area, Pune (demo)', lat: 18.50188, lng: 73.89726, features: ['entrance', 'wheelchair', 'toilet', 'parking', 'signage', 'crowd'], blurb: 'Illustrative garden with photo-supported reports.' }),
  demoPlace({ id: 'pmc-demo-office', name: 'Pune Civic Office Demo', category: 'Government office', area: 'Shivajinagar', address: 'Congress House Road area, Pune (demo)', lat: 18.52874, lng: 73.85193, features: VERTICAL, blurb: 'Illustrative government-office scenario.' }),
  demoPlace({ id: 'pune-demo-station', name: 'Pune Junction Demo Station', category: 'Railway station', area: 'Agarkar Nagar', address: 'Aga Khan Road area, Pune (demo)', lat: 18.5288, lng: 73.87447, features: VERTICAL, blurb: 'Illustrative transport-hub scenario.' }),
  demoPlace({ id: 'central-demo-mall', name: 'Central Pune Demo Mall', category: 'Shopping centre', area: 'Viman Nagar', address: 'Nagar Road area, Pune (demo)', lat: 18.5679, lng: 73.9143, features: VERTICAL, blurb: 'Illustrative shopping-centre scenario.' }),
  demoPlace({ id: 'koregaon-demo-community', name: 'Koregaon Demo Community Centre', category: 'Community centre', area: 'Koregaon Park', address: 'Koregaon Park area, Pune (demo)', lat: 18.5362, lng: 73.894, features: COMMON, blurb: 'Illustrative community-centre improvement scenario.' }),
  demoPlace({ id: 'swargate-demo-terminal', name: 'Swargate Demo Bus Terminal', category: 'Bus terminal', area: 'Swargate', address: 'Swargate area, Pune (demo)', lat: 18.5018, lng: 73.8636, features: ['entrance', 'wheelchair', 'toilet', 'parking', 'signage', 'crowd'], blurb: 'Illustrative crowded-terminal scenario.' }),
  demoPlace({ id: 'phule-demo-museum', name: 'Mahatma Phule Demo Museum', category: 'Museum', area: 'Ghole Road', address: 'Ghole Road area, Pune (demo)', lat: 18.5294, lng: 73.8477, features: COMMON, blurb: 'Illustrative museum signage scenario.' }),
  demoPlace({ id: 'shivajinagar-demo-library', name: 'Shivajinagar Demo Library', category: 'Library', area: 'Shivajinagar', address: 'University Road area, Pune (demo)', lat: 18.5308, lng: 73.8475, features: VERTICAL, blurb: 'Illustrative single-report and pending-review scenario.' }),
  demoPlace({ id: 'aga-khan-demo-palace', name: 'Aga Khan Demo Museum', category: 'Recreation', area: 'Kalyani Nagar', address: 'Nagar Road area, Pune (demo)', lat: 18.5521, lng: 73.9016, features: COMMON, blurb: 'Illustrative low-noise freshness scenario.' }),
  demoPlace({ id: 'jm-road-demo-toilet', name: 'JM Road Demo Public Toilet', category: 'Public toilet', area: 'Shivajinagar', address: 'JM Road area, Pune (demo)', lat: 18.5236, lng: 73.8478, features: ['entrance', 'wheelchair', 'toilet', 'signage'], blurb: 'Illustrative flagged-report scenario.' }),
  demoPlace({ id: 'balewadi-demo-stadium', name: 'Balewadi Demo Stadium', category: 'Recreation', area: 'Balewadi', address: 'Balewadi area, Pune (demo)', lat: 18.5764, lng: 73.7685, features: VERTICAL, blurb: 'Illustrative venue and crowd scenario.' }),
  demoPlace({ id: 'kothrud-demo-cafe', name: 'Kothrud Demo Cafe', category: 'Cafe', area: 'Kothrud', address: 'Kothrud area, Pune (demo)', lat: 18.5074, lng: 73.8077, features: COMMON, blurb: 'Illustrative stale low-noise evidence scenario.' }),
  demoPlace({ id: 'aundh-demo-clinic', name: 'Aundh Demo Clinic', category: 'Clinic', area: 'Aundh', address: 'Aundh area, Pune (demo)', lat: 18.558, lng: 73.8075, features: VERTICAL, blurb: 'Illustrative recent-negative-report scenario.' }),
];

export const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p]));

export const DEMO_SCENARIOS = [
  { id: 'high-trust', title: 'View High Trust Example', placeId: 'ruby-hall-clinic', featureId: 'entrance', description: 'Recent agreeing entrance reports include an illustrative photo.' },
  { id: 'conflicting-lift', title: 'View Conflicting Lift Reports', placeId: 'deenanath-demo-hospital', featureId: 'lift', description: 'Recent reports disagree about whether the lift works.' },
  { id: 'outdated-evidence', title: 'View Outdated Evidence', placeId: 'goodluck-demo-cafe', featureId: 'entrance', description: 'The accessible entrance report is outside its freshness window.' },
  { id: 'limited-information', title: 'View Limited Information', placeId: 'vaishali-demo-restaurant', featureId: 'toilet', description: 'No toilet report is available for this location.' },
  { id: 'recently-fixed', title: 'View Recently Fixed Barrier', placeId: 'sarasbaug-demo-park', featureId: 'entrance', description: 'An older barrier report is followed by a newer accessible report.' },
  { id: 'pending-review', title: 'View Pending Admin Review', placeId: 'shivajinagar-demo-library', featureId: 'signage', description: 'A seeded report is waiting for admin review.' },
];

const SEED_ROWS = [
  ['ruby-hall-clinic', 'entrance', 'accessible', 2, true, 'Level entry observed during the visit; illustrative photo placeholder.', 'reviewed'],
  ['ruby-hall-clinic', 'entrance', 'accessible', 4, false, 'Entrance was step-free from the main path.', 'reviewed'],
  ['deenanath-demo-hospital', 'lift', 'accessible', 3, true, 'Lift appeared operational during the illustrative visit.', 'reviewed'],
  ['deenanath-demo-hospital', 'lift', 'not_accessible', 2, false, 'Lift displayed an out-of-service notice during the illustrative visit.', 'reviewed'],
  ['goodluck-demo-cafe', 'entrance', 'accessible', 220, true, 'Older illustrative observation described a level entrance.', 'reviewed'],
  ['goodluck-demo-cafe', 'signage', 'accessible', 220, true, 'Old illustrative photograph shows the entrance sign.', 'reviewed'],
  ['fergusson-demo-college', 'entrance', 'accessible', 8, true, 'Main entrance was described as step-free.', 'reviewed'],
  ['fergusson-demo-college', 'toilet', 'not_accessible', 6, false, 'Accessible toilet was unavailable in the illustrative observation.', 'reviewed'],
  ['symbiosis-demo-college', 'toilet', 'accessible', 5, false, 'Toilet appeared usable in one illustrative report.', 'reviewed'],
  ['symbiosis-demo-college', 'toilet', 'not_accessible', 4, false, 'A second illustrative report found the toilet unusable.', 'reviewed'],
  ['sarasbaug-demo-park', 'entrance', 'not_accessible', 120, false, 'Older report described steps at the main entry.', 'reviewed'],
  ['sarasbaug-demo-park', 'entrance', 'accessible', 6, true, 'Newer report describes a ramp installation; illustrative photo placeholder.', 'reviewed'],
  ['empress-demo-garden', 'wheelchair', 'accessible', 4, true, 'Illustrative photo-supported report describes a navigable path.', 'reviewed'],
  ['empress-demo-garden', 'wheelchair', 'accessible', 9, true, 'Second illustrative photo-supported report agrees.', 'reviewed'],
  ['pmc-demo-office', 'parking', 'accessible', 6, false, 'One text report describes a marked accessible bay.', 'pending'],
  ['pmc-demo-office', 'parking', 'unable', 5, false, 'A visitor could not confirm whether the bay was available.', 'pending'],
  ['pune-demo-station', 'crowd', 'not_accessible', 1, false, 'Recent illustrative report describes a crowded entrance.', 'pending'],
  ['pune-demo-station', 'parking', 'accessible', 10, false, 'Single text-only report describes accessible parking near the entrance.', 'pending'],
  ['central-demo-mall', 'entrance', 'accessible', 5, true, 'Step-free main entrance in an illustrative report.', 'reviewed'],
  ['central-demo-mall', 'lift', 'not_accessible', 2, false, 'Lift was unavailable in a recent illustrative report.', 'reviewed'],
  ['central-demo-mall', 'parking', 'not_accessible', 40, false, 'Older report identified a barrier at accessible parking.', 'rejected'],
  ['koregaon-demo-community', 'entrance', 'not_accessible', 150, false, 'Older report described steps at the entrance.', 'reviewed'],
  ['koregaon-demo-community', 'entrance', 'accessible', 5, false, 'Newer report describes a temporary ramp improvement.', 'reviewed'],
  ['swargate-demo-terminal', 'entrance', 'not_accessible', 1, false, 'Recent report describes crowding at the entry.', 'pending'],
  ['swargate-demo-terminal', 'signage', 'accessible', 2, false, 'Clear directional signage was noted in one report.', 'pending'],
  ['phule-demo-museum', 'signage', 'accessible', 3, false, 'One visitor found the directional signs clear.', 'reviewed'],
  ['phule-demo-museum', 'signage', 'not_accessible', 2, false, 'Another visitor could not find tactile or clear signs.', 'flagged'],
  ['shivajinagar-demo-library', 'signage', 'accessible', 3, false, 'Single recent report describes readable directional signs.', 'pending'],
  ['aga-khan-demo-palace', 'noise', 'accessible', 60, false, 'Older report described a relatively quiet environment.', 'reviewed'],
  ['jm-road-demo-toilet', 'toilet', 'not_accessible', 2, false, 'Recent report says the accessible toilet was locked.', 'flagged'],
  ['balewadi-demo-stadium', 'entrance', 'accessible', 7, false, 'Step-free entry was reported at the venue.', 'reviewed'],
  ['balewadi-demo-stadium', 'crowd', 'not_accessible', 1, false, 'Crowding was reported near the entrance.', 'pending'],
  ['kothrud-demo-cafe', 'noise', 'accessible', 60, false, 'Older report described a low-noise period.', 'reviewed'],
  ['aundh-demo-clinic', 'wheelchair', 'accessible', 200, true, 'Older illustrative report described clear internal routes.', 'reviewed'],
  ['aundh-demo-clinic', 'wheelchair', 'not_accessible', 2, false, 'Recent report identified a blocked internal route.', 'reviewed'],
];

export function buildSeedReports(referenceDate = DEMO_REFERENCE_DATE) {
  return SEED_ROWS.map(([placeId, featureId, status, daysAgo, photo, description, reviewState], i) => {
    const visitedAt = referenceDate - daysAgo * DAY - (i % 5) * HOUR;
    return {
      id: `r-demo-${String(i + 1).padStart(3, '0')}`, placeId, placeName: PLACE_BY_ID[placeId]?.name || placeId,
      featureId, status, visitedAt, submittedAt: visitedAt + 4 * HOUR, description,
      photo: photo ? { sample: true, caption: 'Illustrative demo placeholder; not an authentic photograph.' } : null,
      source: 'demo', sourceLabel: 'Demo seed data', reviewState, reviewReason: reviewState === 'rejected' ? 'Demo seed report rejected for scenario coverage.' : reviewState === 'flagged' ? 'Demo seed report flagged for investigation.' : '',
    };
  });
}

export function buildSeedReviews(reports) {
  return reports.filter((r) => r.reviewState !== 'pending').map((r, i) => ({
    id: `rv-demo-${String(i + 1).padStart(3, '0')}`, reportId: r.id,
    decision: r.reviewState, reason: r.reviewReason || 'Demo seed report reviewed for scenario coverage.', reviewer: 'Demo admin', at: r.submittedAt + 2 * HOUR,
  }));
}

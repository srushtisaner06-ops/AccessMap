// Feature catalogue. Each accessibility feature is assessed independently —
// there is deliberately no single "accessibility score".
// `core` features drive the place-level information status; the rest are
// shown and filterable but never flip the overall status on their own.

export const FEATURES = [
  {
    id: 'entrance', label: 'Entrance', filterLabel: 'Step-free entry', icon: 'DoorOpen', core: true,
    freshnessDays: 180,
    yes: 'Step-free entrance', no: 'Steps or barrier at entrance',
    hint: 'Can a wheelchair or walker user enter without steps?',
  },
  {
    id: 'wheelchair', label: 'Wheelchair access (inside)', filterLabel: 'Wheelchair access', icon: 'Accessibility', core: true,
    freshnessDays: 120,
    yes: 'Wheelchair-navigable inside', no: 'Wheelchair route blocked or too narrow',
    hint: 'Are internal routes wide, level and unobstructed?',
  },
  {
    id: 'lift', label: 'Lift', filterLabel: 'Lift availability', icon: 'ArrowUpDown', core: true,
    freshnessDays: 30,
    yes: 'Lift working', no: 'Lift out of service',
    hint: 'Lifts break often, so reports expire quickly (30 days).',
  },
  {
    id: 'toilet', label: 'Accessible toilet', filterLabel: 'Accessible toilets', icon: 'Bath', core: true,
    freshnessDays: 90,
    yes: 'Accessible toilet available', no: 'Accessible toilet unavailable or unusable',
    hint: 'Usable, unlocked, with space for a wheelchair.',
  },
  {
    id: 'parking', label: 'Accessible parking', filterLabel: 'Accessible parking', icon: 'ParkingCircle', core: false,
    freshnessDays: 120,
    yes: 'Accessible parking bay available', no: 'No accessible parking',
    hint: 'Designated bay close to the entrance.',
  },
  {
    id: 'signage', label: 'Signage', filterLabel: 'Clear signage', icon: 'Signpost', core: false,
    freshnessDays: 180,
    yes: 'Clear, readable signage', no: 'Signage unclear or missing',
    hint: 'Large, high-contrast, easy-to-follow signs.',
  },
  {
    id: 'noise', label: 'Noise level', filterLabel: 'Low noise', icon: 'Volume1', core: false,
    freshnessDays: 45,
    yes: 'Low noise environment', no: 'Loud environment',
    hint: 'Relevant for sensory sensitivity. Varies by time of day.',
  },
  {
    id: 'crowd', label: 'Crowd-free entry', filterLabel: 'Crowd-free entry', icon: 'Users', core: false,
    freshnessDays: 14,
    yes: 'Entry usually uncrowded', no: 'Entry often crowded',
    hint: 'Crowding changes quickly, so reports expire in 14 days.',
  },
];

export const FEATURE_BY_ID = Object.fromEntries(FEATURES.map((f) => [f.id, f]));

// Filters shown on the map page. Each maps to one feature.
export const FILTERS = [
  { id: 'wheelchair', featureId: 'wheelchair' },
  { id: 'entrance', featureId: 'entrance' },
  { id: 'lift', featureId: 'lift' },
  { id: 'toilet', featureId: 'toilet' },
  { id: 'noise', featureId: 'noise' },
  { id: 'crowd', featureId: 'crowd' },
  { id: 'signage', featureId: 'signage' },
];

export const REPORT_STATUSES = [
  { id: 'accessible', label: 'Accessible' },
  { id: 'not_accessible', label: 'Not Accessible' },
  { id: 'unable', label: 'Unable to Confirm' },
];

export function describeStatus(featureId, status) {
  const f = FEATURE_BY_ID[featureId];
  if (!f) return status;
  if (status === 'accessible') return f.yes;
  if (status === 'not_accessible') return f.no;
  return 'Visitor could not confirm';
}

export const DEFAULT_REFERENCE = { lat: 18.5204, lng: 73.8567, label: 'Pune city centre', kind: 'default' };

export const MANUAL_AREAS = [
  { label: 'Shivajinagar', lat: 18.5308, lng: 73.8475 },
  { label: 'Deccan', lat: 18.5167, lng: 73.842 },
  { label: 'Koregaon Park', lat: 18.5362, lng: 73.894 },
  { label: 'Kothrud', lat: 18.5074, lng: 73.8077 },
  { label: 'Aundh', lat: 18.558, lng: 73.8075 },
  { label: 'Viman Nagar', lat: 18.5679, lng: 73.9143 },
  { label: 'Swargate', lat: 18.5018, lng: 73.8636 },
];

export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function formatDistance(km) {
  if (!Number.isFinite(km)) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

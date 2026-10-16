// Curated real Pune places. Place metadata is sourced; accessibility is not
// inferred from the place source and remains limited until evidence is reported.

const SOURCE_UPDATED_AT = '2026-10-16';
const COMMON = ['entrance', 'wheelchair', 'toilet', 'parking', 'signage', 'noise', 'crowd'];
const HOSPITAL = [...COMMON, 'lift'];
const COLLEGE = [...COMMON, 'lift'];
const PUBLIC_FACILITY = [...COMMON, 'lift'];

export const PLACES = [
  { id: 'ruby-hall-clinic', name: 'Ruby Hall Clinic', category: 'Hospital', area: 'Sangamvadi', address: '40, Sassoon Road, Pune 411001', lat: 18.53354, lng: 73.87715, features: HOSPITAL,
    blurb: 'Multispeciality hospital on Sassoon Road.', sourceName: 'Ruby Hall Clinic', sourceUrl: 'https://rubyhall.com/contact-us/', sourceUpdatedAt: SOURCE_UPDATED_AT },
  { id: 'deenanath-mangeshkar-hospital', name: 'Deenanath Mangeshkar Hospital', category: 'Hospital', area: 'Erandwane', address: 'Near Mhatre Bridge, Erandwane, Pune 411004', lat: 18.50201, lng: 73.83284, features: HOSPITAL,
    blurb: 'Hospital and research centre near Mhatre Bridge.', sourceName: 'Deenanath Mangeshkar Hospital', sourceUrl: 'https://www.dmhospital.org/contact-us', sourceUpdatedAt: SOURCE_UPDATED_AT },
  { id: 'goodluck-cafe', name: 'Goodluck Cafe', category: 'Cafe', area: 'Deccan Gymkhana', address: '759/75, Goodluck Chowk, Fergusson College Road, Pune 411004', lat: 18.52891, lng: 73.84038, features: COMMON,
    blurb: 'Historic Irani cafe on Fergusson College Road.', sourceName: 'Goodluck Cafe', sourceUrl: 'https://goodluckcafe.co.in/contact-us/', sourceUpdatedAt: SOURCE_UPDATED_AT },
  { id: 'vaishali-restaurant', name: 'Vaishali Restaurant', category: 'Cafe', area: 'Shivajinagar', address: '1218, Fergusson College Road, Pune 411004', lat: 18.52916, lng: 73.84073, features: COMMON,
    blurb: 'Restaurant on Fergusson College Road.', sourceName: 'Vaishali Restaurant', sourceUrl: 'https://www.vaishalihotel.in/reach-us.html', sourceUpdatedAt: SOURCE_UPDATED_AT },
  { id: 'fergusson-college', name: 'Fergusson College', category: 'College', area: 'Shivajinagar', address: 'Fergusson College Road, Shivajinagar, Pune 411004', lat: 18.53082, lng: 73.84062, features: COLLEGE,
    blurb: 'Autonomous college on Fergusson College Road.', sourceName: 'District Pune / Government of Maharashtra', sourceUrl: 'https://pune.gov.in/en/public-utility/fergusson-college/', sourceUpdatedAt: SOURCE_UPDATED_AT },
  { id: 'symbiosis-college-arts-commerce', name: 'Symbiosis College of Arts and Commerce', category: 'College', area: 'Shivajinagar', address: 'Senapati Bapat Road, Pune 411004', lat: 18.52856, lng: 73.82958, features: COLLEGE,
    blurb: 'College campus on Senapati Bapat Road.', sourceName: 'Symbiosis College of Arts & Commerce', sourceUrl: 'https://symbiosiscollege.edu.in/contact-us', sourceUpdatedAt: SOURCE_UPDATED_AT },
  { id: 'sarasbaug-peshwe-park', name: 'Sarasbaug-Peshwe Park', category: 'Park', area: 'Parvati', address: 'Sarasbaug, Pune, Maharashtra', lat: 18.50196, lng: 73.85819, features: ['entrance', 'wheelchair', 'toilet', 'parking', 'signage', 'crowd'],
    blurb: 'City park and public recreation space.', sourceName: 'District Pune / Government of Maharashtra', sourceUrl: 'https://pune.gov.in/tourist-place/%E0%A4%B8%E0%A4%BE%E0%A4%B0%E0%A4%B8%E0%A4%AC%E0%A4%BE%E0%A4%97-%E0%A4%AA%E0%A5%87%E0%A4%B6%E0%A4%B5%E0%A5%87-%E0%A4%AA%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%95/', sourceUpdatedAt: SOURCE_UPDATED_AT },
  { id: 'empress-botanical-garden', name: 'Empress Botanical Garden', category: 'Park', area: 'Camp', address: 'Near Race Course, Kavade Mala, Camp, Pune 411001', lat: 18.50188, lng: 73.89726, features: ['entrance', 'wheelchair', 'toilet', 'parking', 'signage', 'crowd'],
    blurb: 'Botanical garden near the Pune Race Course.', sourceName: 'Empress Botanical Garden', sourceUrl: 'https://treesofempressgardenpune.in/contact/', sourceUpdatedAt: SOURCE_UPDATED_AT },
  { id: 'pune-municipal-corporation', name: 'Pune Municipal Corporation', category: 'Public facility', area: 'Shivajinagar', address: 'PMC Main Building, Congress House Road, Pune 411005', lat: 18.52874, lng: 73.85193, features: PUBLIC_FACILITY,
    blurb: 'Civic administration building and public service facility.', sourceName: 'District Pune / Government of Maharashtra', sourceUrl: 'https://pune.gov.in/en/public-utility-category/municipality/', sourceUpdatedAt: SOURCE_UPDATED_AT },
  { id: 'pune-junction-railway-station', name: 'Pune Junction Railway Station', category: 'Public facility', area: 'Agarkar Nagar', address: 'HH Prince Aga Khan Road, Agarkar Nagar, Pune', lat: 18.5288, lng: 73.87447, features: PUBLIC_FACILITY,
    blurb: 'Major railway station serving Pune.', sourceName: 'Central Railway / OpenStreetMap location search', sourceUrl: 'https://www.openstreetmap.org/search?query=Pune%20Junction%20Railway%20Station', sourceUpdatedAt: SOURCE_UPDATED_AT },
];

export const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p]));

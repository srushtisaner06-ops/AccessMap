import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { StatusChip, TrustBadge } from './TrustBadge.jsx';
import { formatDistance } from '../lib/geo.js';
import { relTime } from '../lib/format.js';

export default function LocationCard({ place, assessment, selected, onSelect, now }) {
  return (
    <button className="place-card" aria-pressed={selected} onClick={() => onSelect(place.id)} data-testid={`card-${place.id}`}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3>{place.name}</h3>
          <div className="muted small"><MapPin size={13} aria-hidden="true" /> {place.category} · {place.area}{place.distanceKm != null ? ` · ${formatDistance(place.distanceKm)}` : ''}</div>
        </div>
      </div>
      <div className="badges">
        <StatusChip state={assessment.status} kind="place" />
        <TrustBadge level={assessment.trust} prefix="Lowest trust" />
      </div>
      <div className="small muted">{assessment.reason}</div>
      <div className="muted small"><Clock size={13} aria-hidden="true" /> {assessment.lastConfirmedAt ? `Last visit ${relTime(assessment.lastConfirmedAt, now)}` : 'No visits reported'} · {assessment.features.reduce((sum, f) => sum + f.activeCount, 0)} reports{assessment.conflictCount ? ` · ${assessment.conflictCount} conflict` : ''}</div>
    </button>
  );
}

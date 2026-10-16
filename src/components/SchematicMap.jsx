import React from 'react';
import { Info } from 'lucide-react';
import { PLACES } from '../lib/mockData.js';
import { PLACE_STATUS_LABEL } from '../lib/trustEngine.js';

const GLYPH = { confirmed: '✓', needs_recheck: '!', limited: '?', barrier: '✕' };

// Fallback when an interactive map cannot be shown: places are laid out by
// their real lat/lng on a simple schematic canvas (not to scale).
export default function SchematicMap({ places, assessments, selectedId, onSelect, userLoc, reason }) {
  const lats = PLACES.map((p) => p.lat); const lngs = PLACES.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const pos = (p) => ({
    left: `${8 + ((p.lng - minLng) / (maxLng - minLng || 1)) * 84}%`,
    top: `${8 + (1 - (p.lat - minLat) / (maxLat - minLat || 1)) * 80}%`,
  });
  return (
    <div className="map" style={{ background: 'linear-gradient(#e9f0f7 1px, transparent 1px) 0 0/48px 48px, linear-gradient(90deg, #e9f0f7 1px, transparent 1px) 0 0/48px 48px, #f7fafd' }}>
      <div className="map-overlay notice warn map-note" role="status" style={{ top: 12, right: 12 }}>
        <Info size={18} aria-hidden="true" /> <span><strong>Schematic view.</strong> {reason || 'Map tiles are unavailable.'} Positions are relative, not to scale. Search, filters and cards work as normal.</span>
      </div>
      {places.map((p) => {
        const a = assessments[p.id];
        return (
          <div key={p.id} className="schematic-pin" style={pos(p)}>
            <button type="button" className={`pin ${a.status}${p.id === selectedId ? ' selected' : ''}`} onClick={() => onSelect(p.id)}
              aria-label={`${p.name}, ${PLACE_STATUS_LABEL[a.status]}, ${a.trust} trust. Open details.`} aria-pressed={p.id === selectedId} title={`${p.name} — ${PLACE_STATUS_LABEL[a.status]} — ${a.trust} trust`}>
              <span aria-hidden="true">{GLYPH[a.status]}</span>
            </button>
            <div className="small" style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontWeight: 700, background: 'rgba(255,255,255,.85)', padding: '0 4px', borderRadius: 4, marginTop: 2 }}>{p.name}</div>
          </div>
        );
      })}
    </div>
  );
}

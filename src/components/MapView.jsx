import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Info, AlertTriangle } from 'lucide-react';
import SchematicMap from './SchematicMap.jsx';
import { PLACES } from '../lib/mockData.js';
import { PLACE_STATUS_LABEL } from '../lib/trustEngine.js';

const GLYPH = { confirmed: '✓', needs_recheck: '!', limited: '?', barrier: '✕' };

const STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster', tileSize: 256, maxzoom: 19,
      tiles: [(import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png')],
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#e4ebf3' } },
    { id: 'osm', type: 'raster', source: 'osm' },
  ],
};

export default function MapView({ places, assessments, selectedId, onSelect, userLoc, onTilesFailed }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const markers = useRef(new Map());
  const userMarker = useRef(null);
  const onSelectRef = useRef(onSelect);
  const errCount = useRef(0);
  const [status, setStatus] = useState('loading'); // loading | ready | failed
  const [tilesFailed, setTilesFailed] = useState(false);
  onSelectRef.current = onSelect;

  // Create map once
  useEffect(() => {
    let map;
    try {
      map = new maplibregl.Map({ container: container.current, style: STYLE, center: [73.86, 18.53], zoom: 11, attributionControl: { compact: true } });
    } catch (e) {
      setStatus('failed');
      return undefined;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => setStatus('ready'));
    map.on('error', (e) => {
      if (e?.sourceId === 'osm') { errCount.current += 1; if (errCount.current >= 3) { setTilesFailed(true); onTilesFailed && onTilesFailed(); } }
    });
    map.on('data', (e) => { if (e.sourceId === 'osm' && e.tile) { errCount.current = 0; setTilesFailed(false); } });
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container.current);
    const timeout = setTimeout(() => setStatus((s) => (s === 'loading' ? 'ready' : s)), 6000);
    return () => { clearTimeout(timeout); ro.disconnect(); markers.current.clear(); map.remove(); mapRef.current = null; };
  }, []);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status === 'failed') return;
    const wanted = new Set(places.map((p) => p.id));
    for (const [id, m] of markers.current) if (!wanted.has(id)) { m.marker.remove(); markers.current.delete(id); }
    for (const p of places) {
      const a = assessments[p.id];
      let m = markers.current.get(p.id);
      if (!m) {
        const el = document.createElement('button');
        el.type = 'button';
        el.addEventListener('click', () => onSelectRef.current(p.id));
        const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
        m = { marker, el };
        markers.current.set(p.id, m);
      }
      m.el.className = `pin ${a.status}${p.id === selectedId ? ' selected' : ''}`;
      m.el.innerHTML = `<span aria-hidden="true">${GLYPH[a.status]}</span>`;
      m.el.setAttribute('aria-label', `${p.name}, ${PLACE_STATUS_LABEL[a.status]}, ${a.trust} trust. Open details.`);
      m.el.setAttribute('aria-pressed', String(p.id === selectedId));
      m.el.title = `${p.name} — ${PLACE_STATUS_LABEL[a.status]} — ${a.trust} trust`;
    }
  }, [places, assessments, selectedId, status]);

  // Fit to results when the result set changes
  const key = places.map((p) => p.id).join(',');
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status === 'failed' || !places.length) return;
    if (places.length === 1) { map.flyTo({ center: [places[0].lng, places[0].lat], zoom: 14, duration: 600 }); return; }
    const b = new maplibregl.LngLatBounds();
    places.forEach((p) => b.extend([p.lng, p.lat]));
    map.fitBounds(b, { padding: 70, maxZoom: 14, duration: 600 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, status]);

  // Fly to selection
  useEffect(() => {
    const map = mapRef.current;
    const p = places.find((x) => x.id === selectedId) || PLACES.find((x) => x.id === selectedId);
    if (map && p && status !== 'failed') map.easeTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 13), duration: 500 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status === 'failed') return;
    if (userMarker.current) { userMarker.current.remove(); userMarker.current = null; }
    if (userLoc) {
      const el = document.createElement('div');
      el.className = 'pin me'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', `Reference location: ${userLoc.label}`);
      userMarker.current = new maplibregl.Marker({ element: el }).setLngLat([userLoc.lng, userLoc.lat]).addTo(map);
    }
  }, [userLoc, status]);

  if (status === 'failed') {
    return <SchematicMap places={places} assessments={assessments} selectedId={selectedId} onSelect={onSelect} userLoc={userLoc} reason="Interactive map could not start on this device (WebGL unavailable)." />;
  }
  return (
    <>
      <div ref={container} className="map" role="region" aria-label="Map of Pune places. Marker colors show computed accessibility status; use the list for details." />
      {status === 'loading' && <div className="map-overlay notice" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}><div className="spinner" aria-hidden="true" /> Loading map…</div>}
      {tilesFailed && (
        <div className="map-overlay notice warn map-note" role="status" style={{ top: 60 }}>
          <AlertTriangle size={18} aria-hidden="true" /> <span>Basemap tiles could not load (offline?). Marker positions are still correct; use the list for details.</span>
        </div>
      )}
    </>
  );
}

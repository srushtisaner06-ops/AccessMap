import React, { useMemo, useState } from 'react';
import { Search, LocateFixed, Zap, Map as MapIcon, List, Info, AlertTriangle, SearchX } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { useRoute, navigate, replaceRoute } from '../lib/router.js';
import { FILTERS } from '../lib/features.js';
import { matchesFilter } from '../lib/trustEngine.js';
import { DEFAULT_REFERENCE, MANUAL_AREAS, haversineKm } from '../lib/geo.js';
import SchematicMap from '../components/SchematicMap.jsx';
import MapView from '../components/MapView.jsx';
import LocationCard from '../components/LocationCard.jsx';
import LocationDetails from '../components/LocationDetails.jsx';
import AccessibilityFilters from '../components/AccessibilityFilters.jsx';
import AccessibilityAssistant from '../components/AccessibilityAssistant.jsx';
import Legend from '../components/Legend.jsx';

export default function MapDashboard() {
  const { places, assessments, now, runConflictDemo, conflictDemoTarget, toast } = useStore();
  const { query } = useRoute();
  const selectedId = places.some((p) => p.id === query.place) ? query.place : null;

  const [q, setQ] = useState('');
  const [active, setActive] = useState([]);
  const [includeRecheck, setIncludeRecheck] = useState(false);
  const [ref, setRef] = useState(DEFAULT_REFERENCE);
  const [geo, setGeo] = useState('idle'); // idle | loading | granted | denied | unavailable | error
  const [view, setView] = useState(() => (typeof window !== 'undefined' && window.innerWidth <= 900 ? 'list' : 'map'));
  const [tab, setTab] = useState('features');
  const [simple, setSimple] = useState(() => { try { return localStorage.getItem('accessmap-simple-map') === '1'; } catch { return false; } });
  const setSimpleMap = (v, auto = false) => { setSimple(v); try { localStorage.setItem('accessmap-simple-map', v ? '1' : '0'); } catch { /* ignore */ } if (auto) toast('Street map tiles could not load, so the simple map is shown. Everything else works the same.', 'error'); };
  const [showAssistant, setShowAssistant] = useState(false);

  const withDistance = useMemo(() => places.map((p) => ({ ...p, distanceKm: haversineKm(ref, p) })), [places, ref]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return withDistance
      .filter((p) => !needle || [p.name, p.area, p.category, p.address].some((s) => s.toLowerCase().includes(needle)))
      .filter((p) => active.every((fid) => matchesFilter(assessments[p.id], FILTERS.find((f) => f.id === fid).featureId, { includeRecheck })))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [withDistance, q, active, includeRecheck, assessments]);

  const selected = selectedId ? withDistance.find((p) => p.id === selectedId) : null;

  const select = (id) => { replaceRoute(`/map${id ? `?place=${id}` : ''}`); if (id) { setTab('features'); } };
  const toggleFilter = (id) => setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const locate = () => {
    if (!('geolocation' in navigator)) { setGeo('unavailable'); return; }
    setGeo('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setRef({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'your location', kind: 'device' }); setGeo('granted'); },
      (err) => setGeo(err.code === 1 ? 'denied' : 'error'),
      { timeout: 10000, maximumAge: 60000 },
    );
  };
  const manual = (label) => {
    const a = MANUAL_AREAS.find((x) => x.label === label);
    if (a) { setRef({ ...a, kind: 'manual' }); setGeo('idle'); }
    else { setRef(DEFAULT_REFERENCE); }
  };

  const demo = () => {
    const before = conflictDemoTarget;
    const res = runConflictDemo();
    if (!res.ok) { toast(res.error || 'Demo could not run.', 'error'); return; }
    toast(`Conflict demo: added a conflicting lift report for ${res.place.name}. Lift changed from "${before.assessment.state === 'accessible' ? 'Accessible' : 'Not accessible'}" to "${res.after.state === 'needs_recheck' ? 'Needs Recheck' : res.after.state}".`);
    select(res.place.id); setTab('features');
  };

  const goReport = (placeId, featureId) => navigate(`/report?place=${placeId}${featureId ? `&feature=${featureId}` : ''}`);

  return (
    <div className="dash-wrap">
      <div className="mobile-toggle" role="group" aria-label="Switch between list and map">
        <button className={`btn ${view === 'list' ? '' : 'secondary'}`} aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={16} aria-hidden="true" /> List</button>
        <button className={`btn ${view === 'map' ? '' : 'secondary'}`} aria-pressed={view === 'map'} onClick={() => setView('map')}><MapIcon size={16} aria-hidden="true" /> Map</button>
      </div>
      <div className={`dash ${selected ? 'has-detail' : ''}`} data-view={view}>
        <section className="side" aria-label="Search and nearby places">
          <div className="side-top">
            <div className="notice warn small"><Info size={16} aria-hidden="true" /><span><strong>Demonstration data.</strong> All places and reports are fictional examples, not verified real-world information.</span></div>
            <form role="search" onSubmit={(e) => e.preventDefault()}>
              <div className="input-wrap">
                <Search size={18} aria-hidden="true" />
                <label className="sr-only" htmlFor="search">Search places or areas</label>
                <input id="search" className="input" type="search" placeholder="Search places or areas (e.g. Kothrud)" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </form>
            <div className="row">
              <button className="btn secondary sm" onClick={locate} disabled={geo === 'loading'}>
                {geo === 'loading' ? <span className="spinner" aria-hidden="true" /> : <LocateFixed size={16} aria-hidden="true" />} Near me
              </button>
              <div className="field" style={{ flex: 1, minWidth: 150 }}>
                <label className="sr-only" htmlFor="area">Set location manually</label>
                <select id="area" className="select" style={{ minHeight: 36 }} value={ref.kind === 'manual' ? ref.label : ''} onChange={(e) => manual(e.target.value)}>
                  <option value="">{ref.kind === 'device' ? 'Using your location' : 'Or choose an area…'}</option>
                  {MANUAL_AREAS.map((a) => <option key={a.label} value={a.label}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div role="status" aria-live="polite">
              {geo === 'granted' && <div className="small muted">Distances measured from your location.</div>}
              {geo === 'denied' && <div className="notice error small"><AlertTriangle size={16} aria-hidden="true" /><span>Location permission was denied. Choose an area above instead; distances are measured from {ref.label}.</span></div>}
              {geo === 'unavailable' && <div className="notice error small"><AlertTriangle size={16} aria-hidden="true" /><span>Your browser does not support location. Choose an area above.</span></div>}
              {geo === 'error' && <div className="notice error small"><AlertTriangle size={16} aria-hidden="true" /><span>Could not get your location (timeout or signal). Choose an area above.</span></div>}
              {(geo === 'idle' || geo === 'loading') && <div className="small muted">{geo === 'loading' ? 'Waiting for location permission…' : `Distances measured from ${ref.label}.`}</div>}
            </div>
            <AccessibilityFilters active={active} onToggle={toggleFilter} includeRecheck={includeRecheck} onIncludeRecheck={setIncludeRecheck} onClear={() => setActive([])} />
          </div>
          <div className="side-list">
            <div className="row small" role="status" aria-live="polite">
              <strong>{results.length} of {places.length} places</strong>
              <span className="spacer" />
              <button className="btn ghost sm" onClick={() => setShowAssistant((s) => !s)}>{showAssistant ? 'Hide assistant' : 'Ask assistant'}</button>
            </div>
            {showAssistant && <div className="card flat"><AccessibilityAssistant place={selected} places={withDistance} assessments={assessments} now={now} refLabel={ref.label} /></div>}
            {results.length === 0 && (
              <div className="empty">
                <SearchX size={32} aria-hidden="true" />
                <div><strong>No places match.</strong><br />Try a different search or remove some filters. Filters only match features currently reported accessible.</div>
                <button className="btn secondary sm" onClick={() => { setQ(''); setActive([]); }}>Clear search and filters</button>
              </div>
            )}
            {results.map((p) => <LocationCard key={p.id} place={p} assessment={assessments[p.id]} selected={p.id === selectedId} onSelect={select} now={now} />)}
          </div>
        </section>

        <section className="map-col" aria-label="Map">
          {simple
            ? <SchematicMap places={results} assessments={assessments} selectedId={selectedId} onSelect={select} userLoc={ref.kind !== 'default' ? ref : null} reason="Simple map selected." />
            : <MapView places={results} assessments={assessments} selectedId={selectedId} onSelect={select} userLoc={ref.kind !== 'default' ? ref : null} onTilesFailed={() => setSimpleMap(true, true)} />}
          <div className="map-overlay map-banner">
            <span className="chip neutral" style={{ background: '#fff8e6', borderColor: '#ecd49a' }}>Demo dataset</span>
            <button className="btn sm secondary" onClick={() => setSimpleMap(!simple)} aria-pressed={simple}><MapIcon size={15} aria-hidden="true" /> {simple ? 'Try street map' : 'Use simple map'}</button>
            <button className="btn sm secondary" onClick={demo} disabled={!conflictDemoTarget} title="Adds a report that contradicts a currently consistent lift status">
              <Zap size={15} aria-hidden="true" /> {conflictDemoTarget ? `Try conflict demo (${conflictDemoTarget.place.name} lift)` : 'Conflict demo applied — reset demo data to repeat'}
            </button>
          </div>
          <Legend className="map-overlay" />
        </section>

        {selected && (
          <LocationDetails
            place={selected} assessment={assessments[selected.id]} now={now} places={withDistance} assessments={assessments} refLabel={ref.label}
            tab={tab} setTab={setTab} onClose={() => select(null)} onReport={(fid) => goReport(selected.id, fid)}
            onConflictDemo={() => { const before = assessments[selected.id].byId.lift; const res = runConflictDemo(selected.id); if (res.ok) toast(`Conflict demo: ${selected.name} lift changed from "${before.state === 'accessible' ? 'Accessible' : 'Not accessible'}" to "Needs Recheck".`); else toast(res.error, 'error'); }}
          />
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Clock, Plus, Info, ExternalLink, Zap } from 'lucide-react';
import { StatusChip, TrustBadge } from './TrustBadge.jsx';
import FeatureStatusCard from './FeatureStatusCard.jsx';
import ReportHistory from './ReportHistory.jsx';
import AccessibilityAssistant from './AccessibilityAssistant.jsx';
import { FEATURE_BY_ID } from '../lib/features.js';
import { formatDistance } from '../lib/geo.js';
import { relTime, absDate } from '../lib/format.js';

export default function LocationDetails({ place, assessment, now, places, assessments, refLabel, focusFeature, onClose, onReport, onConflictDemo, tab, setTab }) {
  const heading = useRef(null);
  const [featureFilter, setFeatureFilter] = useState('all');
  useEffect(() => { heading.current?.focus(); setFeatureFilter('all'); }, [place.id]);
  const all = assessment.features.flatMap((f) => f.history).sort((a, b) => b.visitedAt - a.visitedAt);
  const shown = featureFilter === 'all' ? all : all.filter((r) => r.featureId === featureFilter);
  const conflictFeatureId = focusFeature && assessment.byId[focusFeature] ? focusFeature : 'lift';
  const conflictFeature = assessment.byId[conflictFeatureId];

  return (
    <aside className="detail" aria-label={`Accessibility profile for ${place.name}`} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="detail-head">
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h2 ref={heading} tabIndex={-1} style={{ marginBottom: 2 }}>{place.name}</h2>
            <div className="muted small"><MapPin size={13} aria-hidden="true" /> {place.category} · {place.area}{place.distanceKm != null ? ` · ${formatDistance(place.distanceKm)} from ${refLabel}` : ''}</div>
          </div>
          <button className="btn ghost sm" onClick={onClose} aria-label="Close details"><X size={20} /></button>
        </div>
        <div className="badges" style={{ marginTop: 8 }}>
          <StatusChip state={assessment.status} kind="place" />
          <TrustBadge level={assessment.trust} prefix="Lowest trust" />
        </div>
        <div className="tabs" style={{ marginTop: 8, padding: 0 }} role="tablist" aria-label="Place sections">
        {[['features', 'Features'], ['reports', `All reports (${all.length})`], ['assistant', 'Ask assistant']].map(([id, label]) => (
          <button key={id} role="tab" className="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
        ))}
        </div>
      </div>
      <div className="detail-body" role="tabpanel">
        {tab === 'features' && (
          <>
            <div className="card flat stack">
              <div><strong>Overall information status:</strong> {assessment.reason}</div>
              <div className="small muted"><Clock size={13} aria-hidden="true" /> Last confirmed: {assessment.lastConfirmedAt ? `${relTime(assessment.lastConfirmedAt, now)} (${absDate(assessment.lastConfirmedAt)})` : 'never'} · {assessment.reportCount} reports across {assessment.features.length} features</div>
              <div className="small muted">{assessment.trustNote} Overall status considers core features: entrance, wheelchair access, lift, toilet. There is intentionally no single accessibility score.</div>
              <div className="notice"><Info size={16} aria-hidden="true" /><span className="small">Demo locations, reports, timestamps and photos are illustrative only. Accessibility status is based on the demo evidence and does not guarantee current conditions.</span></div>
              <div className="small muted">Place source: {place.sourceUrl ? <a href={place.sourceUrl} target="_blank" rel="noreferrer">{place.sourceName}<ExternalLink size={12} aria-hidden="true" /></a> : place.sourceName} · checked {place.sourceUpdatedAt}</div>
              {focusFeature && place.features.includes(focusFeature) && <div className="notice warn small"><strong>Scenario focus:</strong> {FEATURE_BY_ID[focusFeature]?.label || focusFeature}. Review the feature card and report history below.</div>}
              <div className="row">
                <button className="btn" onClick={() => onReport(null)}><Plus size={16} aria-hidden="true" /> Report an Issue</button>
                <button className="btn secondary" onClick={() => setTab('reports')}>View All Reports</button>
                {conflictFeature && <button className="btn secondary sm" disabled={conflictFeature.agreement === 'conflict' || !['accessible', 'not_accessible'].includes(conflictFeature.state)} onClick={() => onConflictDemo(conflictFeatureId)} title="Adds one controlled illustrative report to show conflict detection"><Zap size={15} aria-hidden="true" /> Try Conflict Demo ({FEATURE_BY_ID[conflictFeatureId]?.label})</button>}
              </div>
            </div>
            {assessment.features.map((a) => <FeatureStatusCard key={a.featureId} assessment={a} now={now} onReport={(fid) => onReport(fid)} />)}
          </>
        )}
        {tab === 'reports' && (
          <>
            <div className="field">
              <label htmlFor="ff">Filter by feature</label>
              <select id="ff" className="select" value={featureFilter} onChange={(e) => setFeatureFilter(e.target.value)}>
                <option value="all">All features ({all.length})</option>
                {place.features.map((id) => <option key={id} value={id}>{FEATURE_BY_ID[id].label}</option>)}
              </select>
            </div>
            <div className="muted small">Newest visit first. Nothing is deleted or overwritten; conflicting and rejected reports stay visible.</div>
            <ReportHistory reports={shown} now={now} showFeature conflictIds={assessment.features.flatMap((f) => f.conflictingReports.map((r) => r.id))} empty="No reports match this filter." />
          </>
        )}
        {tab === 'assistant' && <AccessibilityAssistant place={place} places={places} assessments={assessments} now={now} refLabel={refLabel} />}
      </div>
    </aside>
  );
}

import React from 'react';
import { DoorOpen, Accessibility, ArrowUpDown, Bath, ParkingCircle, Signpost, Volume1, Users, Flag, Camera, Plus } from 'lucide-react';
import { FEATURE_BY_ID } from '../lib/features.js';
import { relTime } from '../lib/format.js';
import { StatusChip, TrustBadge } from './TrustBadge.jsx';
import ReportHistory from './ReportHistory.jsx';

const ICONS = { DoorOpen, Accessibility, ArrowUpDown, Bath, ParkingCircle, Signpost, Volume1, Users };

export default function FeatureStatusCard({ assessment: a, now, onReport }) {
  const f = FEATURE_BY_ID[a.featureId];
  const Icon = ICONS[f.icon] || Accessibility;
  const latest = a.latestReport;
  const publicHistory = a.history.filter((r) => r.reviewState !== 'rejected');
  const previous = publicHistory.filter((r) => r !== latest);
  const conflictIds = a.conflictingReports.map((r) => r.id);
  return (
    <article className={`feat ${a.state}`} aria-labelledby={`feat-${a.featureId}`}>
      <div className="feat-head">
        <Icon size={22} aria-hidden="true" />
        <h4 id={`feat-${a.featureId}`}>{f.label}</h4>
        <StatusChip state={a.state} />
        <TrustBadge level={a.trust} />
      </div>
      <div><strong>Why:</strong> {a.reason}</div>
      <div className="kv">
        <span>{a.activeCount} report{a.activeCount === 1 ? '' : 's'}</span>
        <span aria-hidden="true">·</span>
        <span>{{ conflict: 'Reports disagree', agree: 'Reports agree', single: 'Single report', stale: 'Only outdated reports', none: 'No usable reports' }[a.agreement]}</span>
        <span aria-hidden="true">·</span>
        <span>Last visit: {a.lastConfirmedAt ? relTime(a.lastConfirmedAt, now) : 'none'}</span>
        <span aria-hidden="true">·</span>
        <span className="chip neutral"><Camera size={13} aria-hidden="true" /> {a.hasPhoto ? 'Photo available' : 'No photo'}</span>
      </div>
      <div className="small muted">{a.trustExplanation}</div>
      {a.notes.filter((n) => !/rejected|flagged/i.test(n)).map((n, i) => <div key={i} className="small muted"><Flag size={12} aria-hidden="true" /> {n}</div>)}

      {a.conflictingReports.length > 0 && (
        <div>
          <strong className="small">Conflicting reports (both kept):</strong>
          <ReportHistory reports={a.conflictingReports} now={now} conflictIds={conflictIds} />
        </div>
      )}

      {latest && a.conflictingReports.length === 0 && (
        <div>
          <strong className="small">Latest report:</strong>
          <ReportHistory reports={[latest]} now={now} />
        </div>
      )}

      {a.factors.length > 0 && (
        <details className="disclosure">
          <summary>How trust was calculated ({a.score}/6 points)</summary>
          {a.factors.map((x) => (
            <div className="factor" key={x.key}>
              <span><strong>{x.label}</strong> — {x.detail}</span><span>{x.points}/{x.max}</span>
            </div>
          ))}
          <div className="small muted">Heuristic rules (High ≥5, Medium ≥3). Not a statistical probability.</div>
        </details>
      )}

      {previous.length > 0 && a.conflictingReports.length === 0 && (
        <details className="disclosure">
          <summary>Previous reports ({previous.length})</summary>
          <ReportHistory reports={previous} now={now} />
        </details>
      )}
      {a.conflictingReports.length > 0 && publicHistory.length > a.conflictingReports.length && (
        <details className="disclosure">
          <summary>Other earlier reports ({publicHistory.length - a.conflictingReports.length})</summary>
          <ReportHistory reports={publicHistory.filter((r) => !a.conflictingReports.includes(r))} now={now} />
        </details>
      )}
      <div><button className="btn secondary sm" onClick={() => onReport(a.featureId)}><Plus size={15} aria-hidden="true" /> Report on {f.label.toLowerCase()}</button></div>
    </article>
  );
}

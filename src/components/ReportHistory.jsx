import React from 'react';
import { Camera, FileText } from 'lucide-react';
import { FEATURE_BY_ID, describeStatus } from '../lib/features.js';
import { relTime, absDate } from '../lib/format.js';
import { Photo } from './TrustBadge.jsx';

const SOURCE = { demo: 'Demo seed data', 'demo-scenario': 'Demo scenario report', community: 'Community report (unverified)' };

export function ReportItem({ report, now, conflict = false, showFeature = false }) {
  const f = FEATURE_BY_ID[report.featureId];
  const cls = `report ${conflict ? 'conflict' : ''}`;
  return (
    <li className={cls} style={{ listStyle: 'none' }}>
      <div className="report-head">
        <span className={`chip ${report.status}`}>{report.status === 'accessible' ? 'Accessible' : report.status === 'not_accessible' ? 'Not accessible' : 'Unable to confirm'}</span>
        {showFeature && <strong>{f?.label}</strong>}
        <span className="muted small">visited {relTime(report.visitedAt, now)} ({absDate(report.visitedAt)})</span>
      </div>
      <div className="small">{describeStatus(report.featureId, report.status)}</div>
      {report.description && <div className="small">“{report.description}”</div>}
      <div className="kv">
        <span className="chip neutral">{report.photo ? <><Camera size={14} aria-hidden="true" /> Photo attached</> : <><FileText size={14} aria-hidden="true" /> No photo</>}</span>
        <span>{report.sourceLabel || SOURCE[report.source] || report.source}</span>
      </div>
      {report.photo && <Photo photo={report.photo} />}
      <div className="muted small">Submitted {absDate(report.submittedAt)}. This evidence is not independent verification of the facility.</div>
    </li>
  );
}

export default function ReportHistory({ reports, now, conflictIds = [], showFeature = false, empty = 'No reports yet.' }) {
  if (!reports.length) return <p className="muted">{empty}</p>;
  return (
    <ul className="stack" style={{ padding: 0, margin: 0 }}>
      {reports.map((r) => <ReportItem key={r.id} report={r} now={now} conflict={conflictIds.includes(r.id)} showFeature={showFeature} />)}
    </ul>
  );
}

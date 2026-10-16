import React, { useMemo, useState } from 'react';
import { ShieldCheck, Flag, Ban, CheckCheck, Lock, RotateCcw, Info } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { FEATURES, FEATURE_BY_ID } from '../lib/features.js';
import { PLACE_BY_ID } from '../lib/mockData.js';
import { relTime, absDate } from '../lib/format.js';
import { ReviewChip, Photo } from '../components/TrustBadge.jsx';

export default function AdminDashboard() {
  const { places, reports, reviews, assessments, now, reviewReport, resetDemo, toast } = useStore();
  const [authed, setAuthed] = useState(() => { try { return sessionStorage.getItem('accessmap-admin') === '1'; } catch { return false; } });
  const [fFeature, setFFeature] = useState('all');
  const [fStatus, setFStatus] = useState('all');
  const [fReview, setFReview] = useState('all');
  const [selId, setSelId] = useState(null);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');

  const rows = useMemo(() => [...reports].sort((a, b) => b.submittedAt - a.submittedAt)
    .filter((r) => (fFeature === 'all' || r.featureId === fFeature) && (fStatus === 'all' || r.status === fStatus) && (fReview === 'all' || r.reviewState === fReview)), [reports, fFeature, fStatus, fReview]);
  const sel = reports.find((r) => r.id === selId) || null;

  if (!authed) {
    return (
      <div className="form-page">
        <div className="card stack">
          <h1 style={{ fontSize: '1.8rem' }}><Lock size={24} aria-hidden="true" /> Admin review <span className="demo-tag">DEMO</span></h1>
          <div className="notice warn"><Info size={18} aria-hidden="true" /><span>This is a mocked sign-in for the prototype. There is no real authentication or role-based security.</span></div>
          <button className="btn lg" onClick={() => { try { sessionStorage.setItem('accessmap-admin', '1'); } catch { /* ignore */ } setAuthed(true); }}>Continue as demo reviewer</button>
        </div>
      </div>
    );
  }

  const conflicts = Object.values(assessments).reduce((s, a) => s + a.conflictCount, 0);
  const pending = reports.filter((r) => r.reviewState === 'pending').length;
  const decide = (decision) => {
    if (!sel) return;
    const res = reviewReport(sel.id, decision, reason);
    if (!res.ok) { setErr(res.error); return; }
    setErr(''); setReason('');
    toast(`Report ${decision === 'reviewed' ? 'marked as reviewed' : decision === 'flagged' ? 'flagged for further investigation' : 'rejected'}. This is a record of the review decision, not an inspection of the real facility.`);
  };
  const selHist = reviews.filter((x) => sel && x.reportId === sel.id).sort((a, b) => b.at - a.at);
  const allHist = [...reviews].sort((a, b) => b.at - a.at).slice(0, 12);

  return (
    <div className="admin">
      <div className="row"><h1 style={{ fontSize: '2rem', marginBottom: 0 }}>Admin review dashboard</h1><span className="demo-tag">DEMO · mocked sign-in</span><span className="spacer" />
        <button className="btn secondary sm" onClick={() => { if (window.confirm('Reset all demo reports and review decisions to the original sample data?')) { resetDemo(); setSelId(null); toast('Demo data reset to the original sample set.'); } }}><RotateCcw size={15} aria-hidden="true" /> Reset demo data</button>
      </div>
      <div className="notice" style={{ marginTop: 10 }}><Info size={18} aria-hidden="true" /><span className="small">Review actions are saved locally and change how a report is treated by the trust engine (rejected reports are excluded from the calculation but stay in history). A review decision is not proof that the real facility was independently inspected.</span></div>

      <div className="stats" role="list">
        {[['Total places', places.length], ['Total reports', reports.length], ['Pending review', pending], ['Features with conflicts', conflicts]].map(([l, v]) => (
          <div className="card stat" role="listitem" key={l}><b>{v}</b><span className="muted">{l}</span></div>
        ))}
      </div>

      <div className="admin-grid">
        <section className="card" aria-labelledby="sub-h">
          <h2 id="sub-h" style={{ fontSize: '1.25rem' }}>Recent submissions</h2>
          <div className="toolbar">
            <div className="field"><label className="sr-only" htmlFor="af">Feature</label><select id="af" className="select" value={fFeature} onChange={(e) => setFFeature(e.target.value)}><option value="all">All features</option>{FEATURES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></div>
            <div className="field"><label className="sr-only" htmlFor="as">Status</label><select id="as" className="select" value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="all">All statuses</option><option value="accessible">Accessible</option><option value="not_accessible">Not accessible</option><option value="unable">Unable to confirm</option></select></div>
            <div className="field"><label className="sr-only" htmlFor="ar">Review state</label><select id="ar" className="select" value={fReview} onChange={(e) => setFReview(e.target.value)}><option value="all">All review states</option><option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="flagged">Flagged</option><option value="rejected">Rejected</option></select></div>
          </div>
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Report submissions. Select a row to review it.</caption>
              <thead><tr><th>Place</th><th>Feature</th><th>Status</th><th>Submitted</th><th>Review</th></tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={5} className="muted">No reports match these filters.</td></tr>}
                {rows.map((r) => (
                  <tr key={r.id} className={r.id === selId ? 'sel' : ''} onClick={() => { setSelId(r.id); setErr(''); setReason(''); }}>
                    <td><button className="btn ghost sm" style={{ padding: 0, minHeight: 0, textAlign: 'left' }} onClick={() => { setSelId(r.id); setErr(''); setReason(''); }} aria-pressed={r.id === selId}>{PLACE_BY_ID[r.placeId]?.name || r.placeId}</button></td>
                    <td>{FEATURE_BY_ID[r.featureId]?.label}</td>
                    <td><span className={`chip ${r.status}`}>{r.status === 'accessible' ? 'Accessible' : r.status === 'not_accessible' ? 'Not accessible' : 'Unable'}</span></td>
                    <td>{relTime(r.submittedAt, now)}{r.photo ? ' · photo' : ''}</td>
                    <td><ReviewChip state={r.reviewState} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="stack">
          <section className="card stack" aria-labelledby="det-h" aria-live="polite">
            <h2 id="det-h" style={{ fontSize: '1.25rem' }}>Report details</h2>
            {!sel && <p className="muted">Select a submission to review it.</p>}
            {sel && (
              <>
                <div><strong>{PLACE_BY_ID[sel.placeId]?.name}</strong> · {FEATURE_BY_ID[sel.featureId]?.label}</div>
                <div className="row"><span className={`chip ${sel.status}`}>{sel.status === 'accessible' ? 'Accessible' : sel.status === 'not_accessible' ? 'Not accessible' : 'Unable to confirm'}</span><ReviewChip state={sel.reviewState} /><span className="chip neutral">{sel.source === 'seed' ? 'Sample data' : sel.source === 'demo' ? 'Demo-generated' : 'Community (unverified)'}</span></div>
                <div className="small muted">Visited {absDate(sel.visitedAt)} · submitted {absDate(sel.submittedAt)}</div>
                <div>{sel.description ? `“${sel.description}”` : <span className="muted">No description.</span>}</div>
                {sel.photo ? <Photo photo={sel.photo} alt="Photo submitted with this report" /> : <div className="muted small">No photo supplied.</div>}
                <div className="small muted">Current engine view: {assessments[sel.placeId].byId[sel.featureId].reason}</div>
                {sel.reviewReason && <div className="small"><strong>Reason on record:</strong> {sel.reviewReason}</div>}
                <div className="field">
                  <label htmlFor="rr">Reason (required to reject)</label>
                  <textarea id="rr" className="textarea" style={{ minHeight: 64 }} value={reason} onChange={(e) => setReason(e.target.value)} />
                  {err && <div className="err">{err}</div>}
                </div>
                <div className="row">
                  <button className="btn sm" onClick={() => decide('reviewed')}><CheckCheck size={15} aria-hidden="true" /> Mark reviewed</button>
                  <button className="btn secondary sm" onClick={() => decide('flagged')}><Flag size={15} aria-hidden="true" /> Flag for investigation</button>
                  <button className="btn danger sm" onClick={() => decide('rejected')}><Ban size={15} aria-hidden="true" /> Reject</button>
                </div>
                {selHist.length > 0 && <div className="small"><strong>Decisions on this report:</strong><ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{selHist.map((h) => <li key={h.id}>{h.decision} by {h.reviewer} {relTime(h.at, now)}{h.reason ? ` — ${h.reason}` : ''}</li>)}</ul></div>}
              </>
            )}
          </section>
          <section className="card" aria-labelledby="hist-h">
            <h2 id="hist-h" style={{ fontSize: '1.25rem' }}>Review decision history</h2>
            {allHist.length === 0 ? <p className="muted">No decisions yet.</p> : (
              <ul style={{ paddingLeft: 18, margin: 0 }} className="small">
                {allHist.map((h) => { const r = reports.find((x) => x.id === h.reportId); return <li key={h.id}><strong>{h.decision}</strong> · {r ? `${PLACE_BY_ID[r.placeId]?.name} / ${FEATURE_BY_ID[r.featureId]?.label}` : h.reportId} · {relTime(h.at, now)}{h.reason ? ` · ${h.reason}` : ''}</li>; })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

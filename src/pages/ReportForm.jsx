import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { useRoute, navigate } from '../lib/router.js';
import { FEATURE_BY_ID, REPORT_STATUSES } from '../lib/features.js';
import { toLocalInputValue, relTime } from '../lib/format.js';
import { readAndResizeImage } from '../lib/image.js';
import { MAX_DESC } from '../lib/validation.js';
import { ReportItem } from '../components/ReportHistory.jsx';
import { StatusChip, TrustBadge } from '../components/TrustBadge.jsx';

const blank = (placeId = '', featureId = '') => ({ placeId, featureId, status: '', visitedAt: toLocalInputValue(), description: '', confirmed: false });

export default function ReportForm() {
  const { places, addReport, now, toast } = useStore();
  const { query } = useRoute();
  const [form, setForm] = useState(() => blank(places.some((p) => p.id === query.place) ? query.place : '', query.feature || ''));
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const summary = useRef(null);
  const fileRef = useRef(null);

  const place = places.find((p) => p.id === form.placeId);
  // Drop a pre-selected feature that the chosen place does not track.
  useEffect(() => { if (place && form.featureId && !place.features.includes(form.featureId)) setForm((f) => ({ ...f, featureId: '' })); }, [form.placeId]); // eslint-disable-line

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    try { setPhoto(await readAndResizeImage(file)); }
    catch (err) { setPhoto(null); setPhotoError(err.message); }
    e.target.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = addReport({ ...form, visitedAt: new Date(form.visitedAt).getTime(), photo, photoError });
    setBusy(false);
    if (!res.ok) {
      setErrors(res.errors);
      setTimeout(() => summary.current?.focus(), 0);
      return;
    }
    setErrors({});
    setResult(res);
    toast('Report saved. It shows as an unverified community report, pending review.');
  };

  if (result) {
    const { report, before, after } = result;
    const p = places.find((x) => x.id === report.placeId);
    const f = FEATURE_BY_ID[report.featureId];
    const changed = before.state !== after.state;
    return (
      <div className="form-page stack">
        <div className="notice ok" role="status"><CheckCircle2 size={20} aria-hidden="true" /><div><strong>Report submitted and saved.</strong> Thank you. It is stored locally in this browser and shown as an unverified community report pending review. It has not been independently verified.</div></div>
        <section className="card stack" aria-labelledby="after-h">
          <h2 id="after-h">{p.name}: {f.label}</h2>
          <div className="row"><span className="muted">Before:</span> <StatusChip state={before.state} /> <TrustBadge level={before.trust} /></div>
          <div className="row"><span className="muted">Now:</span> <StatusChip state={after.state} /> <TrustBadge level={after.trust} /></div>
          <p><strong>Why:</strong> {after.reason}</p>
          {after.agreement === 'conflict' && <div className="notice warn"><AlertCircle size={18} aria-hidden="true" /><span>Conflict detected: recent reports disagree, so this feature is now <strong>Needs Recheck</strong>. All reports remain visible.</span></div>}
          {changed && after.agreement !== 'conflict' && <div className="small muted">Status changed because of this report.</div>}
          <p className="small muted">{after.reportCount} report(s) now on record for this feature (was {before.reportCount}).</p>
        </section>
        <section aria-labelledby="new-h"><h3 id="new-h">Your new report</h3><ul style={{ padding: 0, margin: 0 }}><ReportItem report={report} now={now} /></ul></section>
        <div className="row">
          <button className="btn" onClick={() => navigate(`/map?place=${report.placeId}`)}>View {p.name} on the map</button>
          <button className="btn secondary" onClick={() => { setResult(null); setPhoto(null); setForm(blank(report.placeId)); }}>Submit another report</button>
        </div>
      </div>
    );
  }

  const errList = Object.entries(errors);
  return (
    <div className="form-page">
      <h1 style={{ fontSize: '2rem' }}>Report an accessibility barrier</h1>
      <p className="muted">Tell others what you found. Reports are saved in this browser (prototype) and shown as unverified community reports; photos are supporting evidence, not proof.</p>
      <form className="form-grid" onSubmit={submit} noValidate>
        {errList.length > 0 && (
          <div className="notice error" role="alert" tabIndex={-1} ref={summary}>
            <AlertCircle size={18} aria-hidden="true" />
            <div><strong>Please fix {errList.length} issue{errList.length > 1 ? 's' : ''}:</strong><ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{errList.map(([k, m]) => <li key={k}>{m}</li>)}</ul></div>
          </div>
        )}
        <div className="field">
          <label htmlFor="place">Place</label>
          <select id="place" className="select" value={form.placeId} onChange={set('placeId')} aria-invalid={!!errors.placeId} aria-describedby={errors.placeId ? 'e-place' : undefined}>
            <option value="">Select a place…</option>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.area}</option>)}
          </select>
          {errors.placeId && <div className="err" id="e-place"><AlertCircle size={16} aria-hidden="true" />{errors.placeId}</div>}
        </div>
        <div className="field">
          <label htmlFor="feature">Accessibility feature</label>
          <select id="feature" className="select" value={form.featureId} onChange={set('featureId')} disabled={!place} aria-invalid={!!errors.featureId} aria-describedby="feature-help">
            <option value="">{place ? 'Select a feature…' : 'Choose a place first'}</option>
            {place?.features.map((id) => <option key={id} value={id}>{FEATURE_BY_ID[id].label}</option>)}
          </select>
          <div className="help" id="feature-help">{form.featureId ? FEATURE_BY_ID[form.featureId].hint : 'Each feature is assessed separately.'}</div>
          {errors.featureId && <div className="err"><AlertCircle size={16} aria-hidden="true" />{errors.featureId}</div>}
        </div>
        <fieldset className="field">
          <legend>What did you observe?</legend>
          <div className="radio-cards">
            {REPORT_STATUSES.map((s) => (
              <label key={s.id} className="radio-card"><input type="radio" name="status" value={s.id} checked={form.status === s.id} onChange={set('status')} /> {s.label}</label>
            ))}
          </div>
          {errors.status && <div className="err"><AlertCircle size={16} aria-hidden="true" />{errors.status}</div>}
        </fieldset>
        <div className="field">
          <label htmlFor="visited">Date and time of your visit</label>
          <input id="visited" className="input" type="datetime-local" value={form.visitedAt} max={toLocalInputValue()} onChange={set('visitedAt')} aria-invalid={!!errors.visitedAt} />
          {errors.visitedAt && <div className="err"><AlertCircle size={16} aria-hidden="true" />{errors.visitedAt}</div>}
        </div>
        <div className="field">
          <label htmlFor="desc">Description <span className="muted">(optional)</span></label>
          <textarea id="desc" className="textarea" value={form.description} onChange={set('description')} maxLength={MAX_DESC + 50} placeholder="What did you see? For example: “Lift had an out-of-order sign.”" aria-describedby="desc-help" />
          <div className="help" id="desc-help">{form.description.length}/{MAX_DESC}. A short, specific description counts as supporting information.</div>
          {errors.description && <div className="err"><AlertCircle size={16} aria-hidden="true" />{errors.description}</div>}
        </div>
        <div className="field">
          <label htmlFor="photo">Photo <span className="muted">(optional)</span></label>
          <input ref={fileRef} id="photo" className="input" type="file" accept="image/*" onChange={onFile} />
          <div className="help">Photos are resized and stored only in this browser in the prototype. Avoid including people’s faces.</div>
          {photoError && <div className="err"><AlertCircle size={16} aria-hidden="true" />{photoError}</div>}
          {photo && (
            <div className="stack">
              <img className="photo" src={photo} alt="Preview of the photo you selected" />
              <button type="button" className="btn secondary sm" onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = ''; }}><X size={14} aria-hidden="true" /> Remove photo</button>
            </div>
          )}
        </div>
        <div className="field">
          <label className="check-row"><input type="checkbox" checked={form.confirmed} onChange={set('confirmed')} aria-invalid={!!errors.confirmed} /> <span>I confirm this report reflects what I personally observed during my visit.</span></label>
          {errors.confirmed && <div className="err"><AlertCircle size={16} aria-hidden="true" />{errors.confirmed}</div>}
        </div>
        <div className="notice"><Info size={18} aria-hidden="true" /><span className="small">Submitting adds your report to the place’s history, recalculates trust and may flag a conflict. Nothing is deleted or overwritten.</span></div>
        <div className="row">
          <button className="btn lg" type="submit" disabled={busy}>Submit report</button>
          <button className="btn lg ghost" type="button" onClick={() => navigate('/map')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

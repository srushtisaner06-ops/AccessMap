import React from 'react';
import { ArrowRight, Flag, FileSearch, Users, UserCheck, Info, MapPin } from 'lucide-react';
import { navigate } from '../lib/router.js';
import { StatusChip, TrustBadge } from '../components/TrustBadge.jsx';
import { useStore } from '../lib/store.jsx';
import Legend from '../components/Legend.jsx';

export default function LandingPage() {
  const { assessments, places } = useStore();
  const preview = ['cafe-central', 'city-hospital', 'orion-mall'].map((id) => ({ p: places.find((x) => x.id === id), a: assessments[id] }));
  return (
    <div className="page">
      <section className="hero" aria-labelledby="hero-h">
        <div>
          <div className="eyebrow">AccessMap AI · Know before you go</div>
          <h1 id="hero-h">Accessibility <span>you can trust.</span></h1>
          <p className="lead">Most maps label a place “accessible” and stop there. But lifts break, ramps get blocked and listings go stale. AccessMap AI shows the evidence behind every claim: when it was last reported, whether there is a photo, and whether visitors disagree.</p>
          <div className="cta-row">
            <button className="btn lg" onClick={() => navigate('/map')}>Explore Accessibility Map <ArrowRight size={18} aria-hidden="true" /></button>
            <button className="btn lg secondary" onClick={() => navigate('/report')}><Flag size={18} aria-hidden="true" /> Report a Barrier</button>
          </div>
          <div className="notice"><Info size={18} aria-hidden="true" /><span className="small">Trust status reflects available evidence and does not guarantee that a facility is currently accessible. This prototype uses fictional demonstration data for Pune.</span></div>
        </div>
        <div className="preview" aria-label="Preview of map results">
          <div style={{ background: 'linear-gradient(135deg,#dbe8f5,#eef5fb)', padding: 14, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}><MapPin size={18} aria-hidden="true" /> Pune · demo preview</div>
          <div className="preview-body">
            {preview.map(({ p, a }) => (
              <div className="preview-item" key={p.id}>
                <strong>{p.name}</strong>
                <span className="badges"><StatusChip state={a.status} kind="place" /><TrustBadge level={a.trust} prefix="Lowest trust" /></span>
              </div>
            ))}
            <div className="small muted">Each feature (entrance, lift, toilet…) has its own status. There is no single score that hides differences.</div>
          </div>
        </div>
      </section>

      <section className="features" aria-label="Key features">
        {[
          [FileSearch, 'Evidence Transparency', 'Every status shows its last-visit date, whether a photo was supplied, how many reports exist and whether they agree, with a plain-language reason.'],
          [Users, 'Real-Time Community Updates', 'Visitors report what they found. Fresh reports count more, feature-by-feature, and conflicting reports flag a feature as “Needs Recheck” instead of being overwritten.'],
          [UserCheck, 'Personalized Accessibility', 'Filter by step-free entry, lifts, accessible toilets, low noise, crowd-free entry or clear signage, so results fit your needs rather than a generic label.'],
        ].map(([Icon, t, d]) => (
          <article className="card" key={t}>
            <div className="feature-icon"><Icon size={24} aria-hidden="true" /></div>
            <h3>{t}</h3><p className="muted">{d}</p>
          </article>
        ))}
      </section>

      <section className="section" aria-labelledby="legend-h">
        <h2 id="legend-h">How to read a result</h2>
        <div className="card"><Legend /></div>
      </section>

      <section className="section" aria-labelledby="impact-h">
        <h2 id="impact-h">Social impact</h2>
        <div className="sdg">
          <article className="card"><span className="sdg-badge" style={{ background: '#a21942' }}>SDG 10</span><h3>Reduced Inequalities</h3><p className="muted">Reliable, up-to-date accessibility information helps people with disabilities take part in everyday life on equal terms, without risky guesswork.</p></article>
          <article className="card"><span className="sdg-badge" style={{ background: '#b36b00' }}>SDG 11</span><h3>Sustainable Cities and Communities</h3><p className="muted">Community-maintained evidence helps cities see where public places are inclusive and where barriers remain, pointing repair effort where it matters.</p></article>
        </div>
      </section>
    </div>
  );
}

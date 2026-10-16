import React from 'react';
import { ShieldCheck, Shield, ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';
import { TRUST_LABEL, STATE_LABEL, PLACE_STATUS_LABEL } from '../lib/trustEngine.js';

const TRUST_ICON = { high: ShieldCheck, medium: Shield, low: ShieldAlert };

export function TrustBadge({ level, prefix = 'Trust' }) {
  const Icon = TRUST_ICON[level] || ShieldAlert;
  return (
    <span className={`chip trust-${level}`} title="Trust reflects available evidence. It is a heuristic, not a probability.">
      <Icon size={15} aria-hidden="true" /> {prefix}: {TRUST_LABEL[level]}
    </span>
  );
}

const STATE_ICON = { accessible: CheckCircle2, confirmed: CheckCircle2, needs_recheck: AlertTriangle, limited: HelpCircle, not_accessible: XCircle, barrier: XCircle };

export function StatusChip({ state, kind = 'feature' }) {
  const Icon = STATE_ICON[state] || HelpCircle;
  const label = kind === 'place' ? PLACE_STATUS_LABEL[state] : STATE_LABEL[state];
  return (
    <span className={`chip ${state}`}>
      <Icon size={15} aria-hidden="true" /> {label}
    </span>
  );
}

export function ReviewChip({ state }) {
  const label = { pending: 'Pending review', reviewed: 'Reviewed', flagged: 'Flagged', rejected: 'Rejected' }[state] || state;
  return <span className={`chip ${state}`}>{label}</span>;
}

export function Photo({ photo, alt }) {
  if (!photo) return null;
  if (photo.dataUrl) return <img className="photo" src={photo.dataUrl} alt={alt || 'Photo supplied with the report'} />;
  return (
    <div className="sample-photo" role="img" aria-label={alt || 'Sample photo placeholder'}>
      <div><strong>Sample photo placeholder</strong><br />Demo data: not a real photograph</div>
    </div>
  );
}

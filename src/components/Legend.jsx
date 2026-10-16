import React from 'react';
import { StatusChip, TrustBadge } from './TrustBadge.jsx';

export default function Legend({ className = '' }) {
  return (
    <details className={`legend ${className}`} open>
      <summary>Legend</summary>
      <ul>
        <li><StatusChip state="confirmed" kind="place" /> <span>Recent, consistent reports</span></li>
        <li><StatusChip state="needs_recheck" kind="place" /> <span>Conflicting or outdated</span></li>
        <li><StatusChip state="limited" kind="place" /> <span>Too little information</span></li>
        <li><StatusChip state="barrier" kind="place" /> <span>A barrier is reported</span></li>
        <li><TrustBadge level="high" /></li>
        <li><TrustBadge level="medium" /></li>
        <li><TrustBadge level="low" /></li>
        <li className="muted">Trust shows how much evidence supports a status. It does not guarantee a facility is accessible now.</li>
      </ul>
    </details>
  );
}

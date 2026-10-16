import React from 'react';
import { FILTERS, FEATURE_BY_ID } from '../lib/features.js';

export default function AccessibilityFilters({ active, onToggle, includeRecheck, onIncludeRecheck, onClear }) {
  return (
    <fieldset>
      <legend className="small" style={{ fontWeight: 700, marginBottom: 6 }}>Show places reported to have:</legend>
      <div className="filters">
        {FILTERS.map((f) => (
          <label key={f.id} className="filter-chip">
            <input type="checkbox" checked={active.includes(f.id)} onChange={() => onToggle(f.id)} />
            {FEATURE_BY_ID[f.featureId].filterLabel}
          </label>
        ))}
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <label className="check-row small">
          <input type="checkbox" checked={includeRecheck} onChange={(e) => onIncludeRecheck(e.target.checked)} />
          <span>Also include features marked “Needs Recheck”</span>
        </label>
        {active.length > 0 && <button className="btn ghost sm" onClick={onClear}>Clear filters</button>}
      </div>
    </fieldset>
  );
}

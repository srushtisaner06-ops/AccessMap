import React from 'react';
import { FILTERS, FEATURE_BY_ID } from '../lib/features.js';

export default function AccessibilityFilters({ active, onToggle, includeRecheck, onIncludeRecheck, onClear, statusFilter, trustFilter, onStatusFilter, onTrustFilter }) {
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
        {(active.length > 0 || statusFilter !== 'all' || trustFilter !== 'all') && <button className="btn ghost sm" onClick={onClear}>Clear filters</button>}
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <div className="field" style={{ flex: 1, minWidth: 145 }}>
          <label className="small" htmlFor="status-filter">Status</label>
          <select id="status-filter" className="select" value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)}>
            <option value="all">All statuses</option><option value="confirmed">Confirmed Accessible</option><option value="needs_recheck">Needs Recheck</option><option value="limited">Limited Information</option><option value="barrier">Barrier Reported</option>
          </select>
        </div>
        <div className="field" style={{ flex: 1, minWidth: 120 }}>
          <label className="small" htmlFor="trust-filter">Trust</label>
          <select id="trust-filter" className="select" value={trustFilter} onChange={(e) => onTrustFilter(e.target.value)}>
            <option value="all">All trust levels</option><option value="high">High trust</option><option value="medium">Medium trust</option><option value="low">Low trust</option>
          </select>
        </div>
      </div>
    </fieldset>
  );
}

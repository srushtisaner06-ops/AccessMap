import React, { useState } from 'react';
import { Home, Map as MapIcon, Flag, ShieldCheck, Menu, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { navigate } from '../lib/router.js';
import Toasts from './Toasts.jsx';

const LINKS = [
  ['/', 'Home', Home],
  ['/map', 'Map', MapIcon],
  ['/report', 'Report a Barrier', Flag],
  ['/admin', 'Admin', ShieldCheck],
];

export default function Layout({ path, children }) {
  const [open, setOpen] = useState(false);
  const { resetDemo, toast, storageError, dismissStorageError } = useStore();
  const go = (e, to) => { e.preventDefault(); setOpen(false); navigate(to); };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to main content</a>
      <header className="nav">
        <div className="nav-inner">
          <a className="brand" href="#/" onClick={(e) => go(e, '/')} aria-label="AccessMap AI home">
            <span className="brand-mark" aria-hidden="true"><MapIcon size={20} /></span>
            <span>AccessMap AI<span className="muted small" style={{ display: 'block', fontWeight: 500, lineHeight: 1 }}>Know before you go.</span></span>
          </a>
          <button className="btn ghost menu-btn" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen((o) => !o)}>{open ? <X size={20} /> : <Menu size={20} />} Menu</button>
          <nav id="nav-links" className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
            {LINKS.map(([to, label, Icon]) => (
              <a key={to} href={`#${to}`} onClick={(e) => go(e, to)} aria-current={(to === '/' ? path === '/' : path.startsWith(to)) ? 'page' : undefined}>
                <Icon size={17} aria-hidden="true" /> {label}{to === '/admin' && <span className="demo-tag">DEMO</span>}
              </a>
            ))}
          </nav>
          <span className="spacer" />
          <button className="btn ghost sm" onClick={() => { if (window.confirm('Reset all demo reports and review decisions to the original sample data?')) { resetDemo(); toast('Demo data reset to the original sample set.'); } }}><RotateCcw size={15} aria-hidden="true" /> Reset demo data</button>
        </div>
      </header>
      {storageError && (
        <div className="notice error" role="alert" style={{ margin: 8 }}>
          <AlertTriangle size={18} aria-hidden="true" /><span>{storageError}</span>
          <button className="btn ghost sm" onClick={dismissStorageError} style={{ marginLeft: 'auto' }}>Dismiss</button>
        </div>
      )}
      <main id="main" style={{ flex: 1 }}>{children}</main>
      {path === '/' && (
        <footer className="footer"><div className="footer-inner">
          <span>AccessMap AI · Sociothon’26 PS 09 prototype. All places and reports are fictional demonstration data.</span>
          <span>Trust levels are transparent heuristics, not statistically validated probabilities.</span>
        </div></footer>
      )}
      <Toasts />
    </div>
  );
}

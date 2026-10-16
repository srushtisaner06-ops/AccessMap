import React, { useState } from 'react';
import { Home, Map as MapIcon, Flag, ShieldCheck, Menu, X, RotateCcw, AlertTriangle, LogOut } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { navigate } from '../lib/router.js';
import { getRole, logout } from '../lib/auth.js';
import Toasts from './Toasts.jsx';

export default function Layout({ path, children }) {
  const [open, setOpen] = useState(false);
  const role = getRole();
  const links = role === 'admin' ? [['/admin', 'Admin', ShieldCheck]] : role === 'user' ? [['/home', 'Home', Home], ['/map', 'Map', MapIcon], ['/report', 'Report a Barrier', Flag]] : [];
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
            {links.map(([to, label, Icon]) => (
              <a key={to} href={`#${to}`} onClick={(e) => go(e, to)} aria-current={(to === '/home' ? path === '/home' : path.startsWith(to)) ? 'page' : undefined}>
                <Icon size={17} aria-hidden="true" /> {label}{to === '/admin' && <span className="demo-tag">DEMO</span>}
              </a>
            ))}
          </nav>
          <span className="spacer" />
          {role && <span className="chip neutral small">{role === 'admin' ? 'Admin' : 'User'} session</span>}
          {role === 'admin' && <button className="btn ghost sm" onClick={() => { if (window.confirm('Reset all demo reports and review decisions to the original seeded scenarios?')) { resetDemo(); toast('Demo dataset reset to its original seeded scenarios.'); } }}><RotateCcw size={15} aria-hidden="true" /> Reset demo data</button>}
          {role && <button className="btn ghost sm" onClick={() => { logout(); navigate('/'); }}><LogOut size={15} aria-hidden="true" /> Logout</button>}
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
          <span>AccessMap AI · Locations and accessibility evidence are illustrative demonstration data, not independent verification.</span>
          <span>Trust levels are transparent heuristics, not statistically validated probabilities.</span>
        </div></footer>
      )}
      <Toasts />
    </div>
  );
}

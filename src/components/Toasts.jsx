import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../lib/store.jsx';

export default function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === 'error' ? <AlertTriangle size={20} aria-hidden="true" /> : <CheckCircle2 size={20} aria-hidden="true" />}
          <span>{t.message}</span>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss message"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}

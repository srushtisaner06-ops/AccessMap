import React, { useRef, useState, useEffect } from 'react';
import { Bot, Send, Info } from 'lucide-react';
import { answer, SUGGESTIONS, providers } from '../lib/assistant.js';

export default function AccessibilityAssistant({ place, places, assessments, now, refLabel }) {
  const [log, setLog] = useState([]);
  const [text, setText] = useState('');
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView?.({ block: 'nearest' }); }, [log]);

  const ask = (q) => {
    const question = (q ?? text).trim();
    if (!question) return;
    const res = answer(question, { places, assessments, place, now, ref: refLabel });
    setLog((l) => [...l, { role: 'user', text: question }, { role: 'bot', text: res.text }]);
    setText('');
  };
  const pending = providers.find((p) => !p.ready);

  return (
    <section className="chat" aria-label="Accessibility assistant">
      <div className="notice warn">
        <Info size={18} aria-hidden="true" />
        <span><strong>Rule-based demo assistant.</strong> Answers come only from the sample reports shown in this app. No AI model is connected; {pending.label} integration is planned.</span>
      </div>
      <div className="muted small">{place ? <>Asking about <strong>{place.name}</strong>. You can also name another place.</> : 'No place selected: ask about all places, or name one.'}</div>
      <div className="suggestions">
        {SUGGESTIONS.map((s) => <button key={s} onClick={() => ask(s)}>{s}</button>)}
      </div>
      <div className="chat-log" role="log" aria-live="polite" aria-label="Conversation">
        {log.length === 0 && <div className="muted small">Choose a suggestion or type a question.</div>}
        {log.map((m, i) => <div key={i} className={`bubble ${m.role}`}>{m.role === 'bot' && <Bot size={14} aria-hidden="true" />} {m.text}</div>)}
        <div ref={end} />
      </div>
      <form className="row" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <label className="sr-only" htmlFor="assistant-q">Your question</label>
        <input id="assistant-q" className="input" style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Is the lift working?" />
        <button className="btn" type="submit"><Send size={16} aria-hidden="true" /> Ask</button>
      </form>
    </section>
  );
}

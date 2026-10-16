import React, { useState } from 'react';
import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { navigate } from '../lib/router.js';
import { login } from '../lib/auth.js';

function LoginPanel({ role, title, description, Icon, destination, emailHint, passwordHint }) {
  const [email, setEmail] = useState(emailHint);
  const [password, setPassword] = useState(passwordHint);
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!login(role, email, password)) { setError('Those demo credentials are not correct.'); return; }
    navigate(destination);
  };
  return (
    <section className="card login-panel" aria-labelledby={`${role}-login-heading`}>
      <div className="login-icon"><Icon size={26} aria-hidden="true" /></div>
      <h2 id={`${role}-login-heading`}>{title}</h2>
      <p className="muted">{description}</p>
      <form className="stack" onSubmit={submit}>
        <div className="field"><label htmlFor={`${role}-email`}>Email</label><input id={`${role}-email`} className="input" type="email" autoComplete="username" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} required /></div>
        <div className="field"><label htmlFor={`${role}-password`}>Password</label><input id={`${role}-password`} className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} required /></div>
        {error && <div className="err" role="alert">{error}</div>}
        <button className="btn lg" type="submit"><LockKeyhole size={18} aria-hidden="true" /> Login as {role}</button>
      </form>
      <p className="small muted login-demo">Demo: <code>{emailHint}</code> / <code>{passwordHint}</code></p>
    </section>
  );
}

export default function LoginPage() {
  return <div className="login-page">
    <div className="login-intro"><div className="eyebrow">AccessMap AI · Know before you go</div><h1>Welcome to AccessMap AI</h1><p className="lead">Choose the demo experience you want to use.</p></div>
    <div className="login-grid">
      <LoginPanel role="user" title="User login" description="Explore accessibility information and report barriers." Icon={UserRound} destination="/home" emailHint="user@accessmap.demo" passwordHint="user123" />
      <LoginPanel role="admin" title="Admin login" description="Review community reports and manage moderation decisions." Icon={ShieldCheck} destination="/admin" emailHint="admin@accessmap.demo" passwordHint="admin123" />
    </div>
    <div className="notice warn login-note"><LockKeyhole size={18} aria-hidden="true" /><span>This is a local demonstration login. It does not provide production authentication or security.</span></div>
  </div>;
}

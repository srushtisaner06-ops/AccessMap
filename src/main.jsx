import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { StoreProvider } from './lib/store.jsx';
import './styles.css';

class Boundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, maxWidth: 640, margin: '40px auto' }}>
          <h1>Something went wrong</h1>
          <p>The app hit an unexpected error. You can reset the demo data and reload.</p>
          <button className="btn" onClick={() => { try { localStorage.removeItem('accessmap-ai:v1'); } catch { /* ignore */ } location.reload(); }}>Reset demo data and reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <Boundary><StoreProvider><App /></StoreProvider></Boundary>,
);

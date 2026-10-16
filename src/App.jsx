import React, { useEffect } from 'react';
import { useRoute } from './lib/router.js';
import Layout from './components/Layout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import MapDashboard from './pages/MapDashboard.jsx';
import ReportForm from './pages/ReportForm.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { getRole } from './lib/auth.js';

const TITLES = { '/': 'AccessMap AI — Know before you go', '/map': 'Accessibility map — AccessMap AI', '/report': 'Report a barrier — AccessMap AI', '/admin': 'Admin review (demo) — AccessMap AI' };

export default function App() {
  const { path } = useRoute();
  const role = getRole();
  useEffect(() => { document.title = TITLES[path] || TITLES['/']; if (!path.startsWith('/map')) window.scrollTo(0, 0); }, [path]);
  let page;
  if (path === '/') page = role ? (role === 'admin' ? <AdminDashboard /> : <LandingPage />) : <LoginPage />;
  else if (path === '/home') page = role === 'user' ? <LandingPage /> : <LoginPage />;
  else if (path.startsWith('/map')) page = role === 'user' ? <MapDashboard /> : <LoginPage />;
  else if (path.startsWith('/report')) page = role === 'user' ? <ReportForm key={window.location.hash} /> : <LoginPage />;
  else if (path.startsWith('/admin')) page = role === 'admin' ? <AdminDashboard /> : <LoginPage />;
  else page = <div className="form-page"><h1>Page not found</h1><a href="#/">Back to home</a></div>;
  return <Layout path={path}>{page}</Layout>;
}

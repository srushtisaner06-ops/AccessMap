import React, { useEffect } from 'react';
import { useRoute } from './lib/router.js';
import Layout from './components/Layout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import MapDashboard from './pages/MapDashboard.jsx';
import ReportForm from './pages/ReportForm.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

const TITLES = { '/': 'AccessMap AI — Know before you go', '/map': 'Accessibility map — AccessMap AI', '/report': 'Report a barrier — AccessMap AI', '/admin': 'Admin review (demo) — AccessMap AI' };

export default function App() {
  const { path } = useRoute();
  useEffect(() => { document.title = TITLES[path] || TITLES['/']; if (!path.startsWith('/map')) window.scrollTo(0, 0); }, [path]);
  let page;
  if (path === '/') page = <LandingPage />;
  else if (path.startsWith('/map')) page = <MapDashboard />;
  else if (path.startsWith('/report')) page = <ReportForm key={window.location.hash} />;
  else if (path.startsWith('/admin')) page = <AdminDashboard />;
  else page = <div className="form-page"><h1>Page not found</h1><a href="#/">Back to home</a></div>;
  return <Layout path={path}>{page}</Layout>;
}

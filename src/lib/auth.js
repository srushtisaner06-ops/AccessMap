const SESSION_KEY = 'accessmap-ai:role';

const CREDENTIALS = {
  user: { email: 'user@accessmap.demo', password: 'user123' },
  admin: { email: 'admin@accessmap.demo', password: 'admin123' },
};

export function getRole() {
  try {
    const role = sessionStorage.getItem(SESSION_KEY);
    return role === 'user' || role === 'admin' ? role : null;
  } catch { return null; }
}

export function login(role, email, password) {
  const expected = CREDENTIALS[role];
  if (!expected || email.trim().toLowerCase() !== expected.email || password !== expected.password) return false;
  try { sessionStorage.setItem(SESSION_KEY, role); } catch { /* ignore */ }
  return true;
}

export function logout() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

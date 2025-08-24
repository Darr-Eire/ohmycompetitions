// src/lib/adminAxios.js
import axios from 'axios';

function getStoredAdminPair() {
  try {
    const raw = localStorage.getItem('adminUser'); // JSON: { username, password, ... }
    const obj = raw ? JSON.parse(raw) : null;
    const u =
      obj?.username ??
      localStorage.getItem('omc_admin_user') ??
      localStorage.getItem('adminUser'); // fallback if ever stored raw
    const p =
      obj?.password ??
      localStorage.getItem('omc_admin_pass') ??
      localStorage.getItem('adminPass');
    return { u: (u || '').trim(), p: (p || '').trim() };
  } catch {
    return { u: '', p: '' };
  }
}

function basicAuthHeader(u, p) {
  if (!u || !p) return {};
  const token = btoa(`${u}:${p}`);
  return { Authorization: `Basic ${token}` };
}

/**
 * Axios instance that injects admin headers BEFORE every request.
 * This avoids “Missing admin headers” when the instance was created
 * before localStorage had values.
 */
export const adminClient = axios.create({
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor to set headers per-call
adminClient.interceptors.request.use((config) => {
  const { u, p } = getStoredAdminPair();
  const hdrs = {
    ...basicAuthHeader(u, p), // for Basic Auth endpoints
    'x-admin-user': u,        // for requireAdmin(req)
    'x-admin-pass': p,
  };

  config.headers = {
    ...(config.headers || {}),
    ...hdrs,
  };
  // keep responses uncached
  config.headers['Cache-Control'] = 'no-store';
  return config;
});

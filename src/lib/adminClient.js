// src/lib/adminClient.js

/**
 * Safely read admin creds from localStorage (client-only).
 */
export function getAdminHeaders() {
  if (typeof window === 'undefined') return {}; // SSR/Node: no localStorage

  try {
    const adminUser = localStorage.getItem('omc_admin_user')?.trim();
    const adminPass = localStorage.getItem('omc_admin_pass')?.trim();

    if (!adminUser || !adminPass) return {};
    return {
      'x-admin-user': adminUser,
      'x-admin-pass': adminPass,
    };
  } catch {
    return {};
  }
}

/**
 * Normalizes a body value: if it's a plain object, JSON-encode it and set header.
 */
function normalizeRequest(init = {}) {
  const headers = new Headers(init.headers || {});
  const hasContentType = headers.has('Content-Type');

  let body = init.body;

  // If body is a plain object, JSON-encode it
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    if (!hasContentType) headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  return { headers, body };
}

/**
 * Parse response as JSON when possible; otherwise return text. Handles 204.
 */
async function parseResponse(res) {
  if (res.status === 204 || res.headers.get('content-length') === '0') return null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return res.json();
  }
  // Fallback to text (and try JSON parse gracefully)
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Wrapper for fetch that injects admin headers automatically.
 * Usage:
 *   const data = await adminFetch('/api/admin/activity');
 */
export async function adminFetch(input, init = {}) {
  const { headers: normalizedHeaders, body } = normalizeRequest(init);

  // Build base headers (admin creds + content-type if not already set)
  const base = new Headers({
    ...Object.fromEntries(normalizedHeaders.entries()),
    ...getAdminHeaders(),
  });

  const res = await fetch(input, {
    ...init,
    headers: base,
    body,
    credentials: init.credentials ?? 'include',
  });

  if (!res.ok) {
    const payload = await parseResponse(res).catch(() => null);
    // Prefer server-provided error message if available
    const serverMsg =
      (payload && (payload.error || payload.message)) ||
      (typeof payload === 'string' ? payload : '');
    const msg = serverMsg || res.statusText || 'Request failed';
    throw new Error(`Admin API ${res.status}: ${msg}`);
  }

  return parseResponse(res);
}

/* Convenience helpers */
export const adminGet = (url, init = {}) =>
  adminFetch(url, { ...init, method: 'GET' });

export const adminPost = (url, body, init = {}) =>
  adminFetch(url, { ...init, method: 'POST', body });

export const adminPut = (url, body, init = {}) =>
  adminFetch(url, { ...init, method: 'PUT', body });

export const adminDelete = (url, init = {}) =>
  adminFetch(url, { ...init, method: 'DELETE' });

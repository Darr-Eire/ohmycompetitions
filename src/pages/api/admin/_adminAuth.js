// file: src/lib/adminHeaderGuard.js
import crypto from 'crypto';

const COOKIE_NAME = 'omc_admin';
const COOKIE_SECRET =
  process.env.ADMIN_COOKIE_SECRET ||
  process.env.JWT_SECRET ||
  'CHANGE_ME__set_ADMIN_COOKIE_SECRET';

function safeEqual(a = '', b = '') {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  // Ensure equal length to avoid early return timing diffs
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function getEnvCreds() {
  const USER =
    (process.env.ADMIN_USER || process.env.ADMIN_USERNAME || '').trim();
  const PASS =
    (process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || '').trim();
  return { USER, PASS };
}

function parseCookie(header = '') {
  const out = {};
  header.split(';').forEach((pair) => {
    const i = pair.indexOf('=');
    if (i > -1) out[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim());
  });
  return out;
}

function verifySignedCookie(value) {
  if (!value) return null;
  const [b64, sig] = String(value).split('.');
  if (!b64 || !sig) return null;
  const expected = crypto.createHmac('sha256', COOKIE_SECRET).update(b64).digest('base64url');
  if (!safeEqual(sig, expected)) return null;
  try {
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    return JSON.parse(json); // { role: 'admin', user, ... }
  } catch {
    return null;
  }
}

/**
 * Admin guard for API routes.
 * Accepts:
 *  1) Signed cookie "omc_admin" (preferred)
 *  2) Headers "x-admin-user" + "x-admin-pass" (for scripts/CLI)
 *
 * On failure, responds 403 and returns false. On success returns { user }.
 */
export function requireAdmin(req, res) {
  const { USER, PASS } = getEnvCreds();

  // 1) Prefer signed cookie
  const cookies = parseCookie(req.headers.cookie || '');
  const sess = verifySignedCookie(cookies[COOKIE_NAME]);
  if (sess?.role === 'admin') {
    return { user: sess.user || USER || 'admin' };
  }

  // 2) Fall back to header creds (optional)
  const hdrUser = (req.headers['x-admin-user'] || req.headers['x-admin-username'] || '').toString().trim();
  const hdrPass = (req.headers['x-admin-pass'] || req.headers['x-admin-password'] || '').toString();

  const userMatch = USER && hdrUser && hdrUser.toLowerCase() === USER.toLowerCase();
  const passMatch = PASS && hdrPass && safeEqual(hdrPass, PASS);

  if (userMatch && passMatch) {
    return { user: hdrUser };
  }

  // Deny
  res.status(403).json({ message: 'Forbidden' });
  return false;
}

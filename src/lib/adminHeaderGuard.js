// src/lib/adminHeaderGuard.js
import crypto from 'crypto';

const COOKIE_NAME = 'omc_admin';
const COOKIE_SECRET =
  process.env.ADMIN_COOKIE_SECRET ||
  process.env.JWT_SECRET ||
  'CHANGE_ME__set_ADMIN_COOKIE_SECRET';

const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h

function parseCookie(header = '') {
  const out = {};
  header.split(';').forEach((pair) => {
    const i = pair.indexOf('=');
    if (i > -1) out[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim());
  });
  return out;
}

function sign(b64) {
  return crypto.createHmac('sha256', COOKIE_SECRET).update(b64).digest('base64url');
}

function makeSignedValue(obj) {
  const b64 = Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64}.${sign(b64)}`;
}

export function verifySignedCookie(value) {
  if (!value) return null;
  const [b64, sig] = String(value).split('.');
  if (!b64 || !sig) return null;
  if (sig !== sign(b64)) return null;
  try {
    return JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(res, { user, role = 'admin' }, { maxAge = MAX_AGE_SECONDS } = {}) {
  const token = makeSignedValue({ user, role, iat: Math.floor(Date.now() / 1000) });
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge};${secure}`
  );
}

export function clearAdminSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;${secure}`);
}

export function requireAdmin(req, res) {
  const cookies = parseCookie(req.headers.cookie || '');
  const sess = verifySignedCookie(cookies[COOKIE_NAME]);
  if (sess?.role === 'admin') return sess;

  // Optional legacy header fallback:
  const USER = (process.env.ADMIN_USER || process.env.ADMIN_USERNAME || '').trim();
  const PASS = (process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || '').trim();
  const hdrUser = (req.headers['x-admin-user'] || req.headers['x-admin-username'] || '').toString().trim();
  const hdrPass = (req.headers['x-admin-pass'] || req.headers['x-admin-password'] || '').toString();
  if (USER && PASS && hdrUser.toLowerCase() === USER.toLowerCase() && hdrPass === PASS) {
    return { user: hdrUser, role: 'admin' };
  }

  res.status(403).json({ message: 'Forbidden' });
  return false;
}

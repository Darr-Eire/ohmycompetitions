// file: src/lib/adminAuth.js
import crypto from 'crypto';

const COOKIE_NAME = 'omc_admin';
const COOKIE_SECRET =
  process.env.ADMIN_COOKIE_SECRET ||
  process.env.JWT_SECRET ||
  'CHANGE_ME__set_ADMIN_COOKIE_SECRET';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function getEnvCreds() {
  // Accept both new and legacy env var names
  const ADMIN_USER = (process.env.ADMIN_USER || process.env.ADMIN_USERNAME || '').trim();
  const ADMIN_PASS = (process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || '').trim();
  return { ADMIN_USER, ADMIN_PASS };
}

function parseCookie(header) {
  const out = {};
  (header || '').split(';').forEach((pair) => {
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
  if (expected !== sig) return null;

  try {
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Main Guards                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Throws 403 if invalid.
 * Returns the validated admin username if OK.
 */
export function requireAdmin(req) {
  const { ADMIN_USER, ADMIN_PASS } = getEnvCreds();

  // 1) Try signed cookie first
  const cookies = parseCookie(req.headers.cookie || '');
  const sess = verifySignedCookie(cookies[COOKIE_NAME]);
  if (sess && sess.role === 'admin') {
    return String(sess.user || ADMIN_USER || 'admin');
  }

  // 2) Fallback to x-admin-user/x-admin-pass headers
  const hdrUser = (req.headers['x-admin-user'] || '').toString().trim();
  const hdrPass = (req.headers['x-admin-pass'] || '').toString();

  const ok =
    hdrUser &&
    hdrPass &&
    ADMIN_USER &&
    ADMIN_PASS &&
    hdrUser.toLowerCase() === ADMIN_USER.toLowerCase() &&
    hdrPass === ADMIN_PASS;

  if (!ok) {
    const err = new Error('Forbidden: Invalid credentials');
    // @ts-ignore
    err.statusCode = 403;
    throw err;
  }
  return hdrUser;
}

/**
 * Wrapper for Next.js API routes.
 * Example:
 *   export default withAdmin(async (req, res) => { res.json({ ok: true }) })
 */
export function withAdmin(handler) {
  return async function wrapped(req, res) {
    try {
      requireAdmin(req);
      return await handler(req, res);
    } catch (e) {
      return res
        .status(e.statusCode || 403)
        .json({ success: false, error: e.message || 'FORBIDDEN' });
    }
  };
}

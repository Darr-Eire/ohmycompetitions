// file: src/pages/api/admin/whoami.js
import crypto from 'crypto';

const COOKIE_NAME = 'omc_admin';
const COOKIE_SECRET =
  process.env.ADMIN_COOKIE_SECRET ||
  process.env.JWT_SECRET ||
  'CHANGE_ME__use_ADMIN_COOKIE_SECRET_env';

function parseCookie(header) {
  const out = {};
  (header || '').split(';').forEach((pair) => {
    const i = pair.indexOf('=');
    if (i > -1) out[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim());
  });
  return out;
}

function verify(value) {
  if (!value) return null;
  const [b64, sig] = String(value).split('.');
  if (!b64 || !sig) return null;
  const expected = crypto.createHmac('sha256', COOKIE_SECRET).update(b64).digest('base64url');
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const cookies = parseCookie(req.headers.cookie || '');
  const raw = cookies[COOKIE_NAME];
  const session = verify(raw);

  return res.status(200).json({
    cookiePresent: !!raw,
    sessionValid: !!session,
    session,
  });
}

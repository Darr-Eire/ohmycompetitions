// file: src/pages/api/admin/login.js
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

const COOKIE_NAME = 'omc_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day
const COOKIE_SECRET =
  process.env.ADMIN_COOKIE_SECRET ||
  process.env.JWT_SECRET ||
  'CHANGE_ME__use_ADMIN_COOKIE_SECRET_env';

/* cookie helpers */
function b64url(input) {
  return Buffer.from(input).toString('base64url');
}
function sign(value) {
  return crypto.createHmac('sha256', COOKIE_SECRET).update(value).digest('base64url');
}
function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${value}`];
  parts.push(`Path=${options.path || '/'}`);
  if (Number.isFinite(options.maxAge)) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  return parts.join('; ');
}
function setSessionCookie(res, payload) {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64url');
  const sig = crypto.createHmac('sha256', COOKIE_SECRET).update(b64).digest('base64url');
  const value = `${b64}.${sig}`;

  const isProd = process.env.NODE_ENV === 'production';

  const cookieParts = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'HttpOnly',
    `SameSite=${isProd ? 'Strict' : 'Lax'}`,
  ];
  if (isProd) cookieParts.push('Secure'); // only in prod/https

  // Important: set the header and THEN send JSON
  res.setHeader('Set-Cookie', cookieParts.join('; '));
}


/* handler */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // accept email OR username
    const { email: rawEmail, username: rawUsername, password } = req.body || {};
    const loginId = (rawEmail ?? rawUsername ?? '').trim();
    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email/username and password required' });
    }

    // ENV admin fast path
    const nameForEnv = loginId.includes('@') ? loginId.split('@')[0].trim() : loginId;
    const ENV_USER = (process.env.ADMIN_USER || process.env.ADMIN_USERNAME || '').trim();
    const ENV_PASS = (process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || '').trim();

    if (ENV_USER && ENV_PASS) {
      if (nameForEnv.toLowerCase() === ENV_USER.toLowerCase() && password === ENV_PASS) {
        const sid = crypto.randomBytes(16).toString('hex');
        setSessionCookie(res, { sub: 'env-admin', user: ENV_USER, role: 'admin', sid, iat: Date.now() });
        return res.status(200).json({
          success: true,
          message: 'Admin login successful',
          user: { id: 'env-admin', email: loginId, username: ENV_USER, role: 'admin' },
        });
      }
      // else fall through to DB
    }

    // DB admin path
    await connectToDatabase();
    const isEmail = loginId.includes('@');
    const query = isEmail
      ? { email: loginId.toLowerCase(), role: 'admin' }
      : { username: loginId.toLowerCase(), role: 'admin' };

    const admin = await User.findOne(query);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, admin.password || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const sid = crypto.randomBytes(16).toString('hex');
    setSessionCookie(res, {
      sub: String(admin._id),
      user: admin.username || admin.email,
      role: admin.role || 'admin',
      sid,
      iat: Date.now(),
    });

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        role: admin.role || 'admin',
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

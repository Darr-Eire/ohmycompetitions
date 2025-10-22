// file: src/pages/api/admin/login.js
export const config = { api: { bodyParser: true } }; // pages API default, explicit for clarity

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from 'lib/db.js';         // <- fixed path (from src/pages/api/admin/* to src/lib)
import User from 'models/User';             // <- fixed path

const COOKIE_NAME = 'omc_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day
const COOKIE_SECRET =
  process.env.ADMIN_COOKIE_SECRET ||
  process.env.JWT_SECRET ||
  'CHANGE_ME__use_ADMIN_COOKIE_SECRET_env';

// --- cookie helpers (same format as whoami/guard) ---
function sign(b64) {
  return crypto.createHmac('sha256', COOKIE_SECRET).update(b64).digest('base64url');
}
function setSessionCookie(res, payload) {
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = sign(b64);
  const value = `${b64}.${sig}`;
  const isProd = process.env.NODE_ENV === 'production';

  const parts = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'HttpOnly',
    // In prod we can be stricter; AdminGuard reads same-site navigation.
    `SameSite=${isProd ? 'Lax' : 'Lax'}`,
  ];
  if (isProd) parts.push('Secure'); // requires HTTPS

  res.setHeader('Set-Cookie', parts.join('; '));
}

// --- route handler ---
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email: rawEmail, username: rawUsername, password } = req.body || {};
    const loginId = (rawEmail ?? rawUsername ?? '').trim();
    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email/username and password required' });
    }

    // 1) ENV admin fast path
    const ENV_USER = (process.env.ADMIN_USER || process.env.ADMIN_USERNAME || '').trim();
    const ENV_PASS = (process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || '').trim();
    const nameForEnv = loginId.includes('@') ? loginId.split('@')[0].trim() : loginId;

    if (ENV_USER && ENV_PASS &&
        nameForEnv.toLowerCase() === ENV_USER.toLowerCase() &&
        password === ENV_PASS) {
      const sid = crypto.randomBytes(16).toString('hex');
      setSessionCookie(res, { sub: 'env-admin', user: ENV_USER, role: 'admin', sid, iat: Date.now() });
      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        user: { id: 'env-admin', email: loginId, username: ENV_USER, role: 'admin' },
      });
    }

    // 2) DB admin path
    await getDb();
    const isEmail = loginId.includes('@');
    const query = isEmail
      ? { email: loginId.toLowerCase(), role: 'admin' }
      : { username: loginId.toLowerCase(), role: 'admin' };

    const admin = await User.findOne(query).lean ? await User.findOne(query) : await User.findOne(query);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    // If you store bcrypt hashes in admin.password
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

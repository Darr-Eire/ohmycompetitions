// file: src/pages/api/admin/login.js
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

const COOKIE_NAME = 'omc_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day (seconds)
const COOKIE_SECRET =
  process.env.ADMIN_COOKIE_SECRET ||
  process.env.JWT_SECRET ||
  'CHANGE_ME__use_ADMIN_COOKIE_SECRET_env';

/* ------------------------------ cookie utils ------------------------------ */
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
  const b64 = b64url(json);
  const sig = sign(b64);
  const value = `${b64}.${sig}`;

  const cookie = serializeCookie(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  res.setHeader('Set-Cookie', cookie);
}

/* ------------------------------- main handler ------------------------------ */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Normalize username from email (left of @), case-insensitive
    const userFromEmail = (String(email).includes('@') ? String(email).split('@')[0] : String(email))
      .trim();

    // --- 1) ENV ADMIN (fast path; supports ADMIN_USER/ADMIN_PASS and legacy names) ---
    const ENV_USER = (process.env.ADMIN_USER || process.env.ADMIN_USERNAME || '').trim();
    const ENV_PASS = (process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || '').trim();

    if (ENV_USER && ENV_PASS) {
      if (userFromEmail.toLowerCase() === ENV_USER.toLowerCase() && password === ENV_PASS) {
        const sid = crypto.randomBytes(16).toString('hex');
        setSessionCookie(res, { sub: 'env-admin', user: ENV_USER, role: 'admin', sid, iat: Date.now() });
        return res.status(200).json({
          success: true,
          message: 'Admin login successful',
          user: { id: 'env-admin', email, username: ENV_USER, role: 'admin' },
        });
      }
      // if env admin exists but didn’t match, fall through to DB check as a fallback
    }

    // --- 2) DB ADMIN (email or username) ---
    await connectToDatabase();

    const isEmail = String(email).includes('@');
    const query = isEmail
      ? { email: String(email).toLowerCase(), role: 'admin' }
      : { username: String(email).toLowerCase(), role: 'admin' };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sid = crypto.randomBytes(16).toString('hex');
    setSessionCookie(res, {
      sub: String(user._id),
      user: user.username || user.email,
      role: user.role || 'admin',
      sid,
      iat: Date.now(),
    });

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role || 'admin',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

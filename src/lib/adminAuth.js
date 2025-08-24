// src/lib/adminAuth.js
import crypto from 'node:crypto';

/**
 * Safely coerce possibly-array header values to a trimmed string.
 */
function readHeader(req, key) {
  const h = req?.headers?.[key] ?? req?.headers?.[key.toLowerCase()];
  const v = Array.isArray(h) ? h[0] : h;
  return typeof v === 'string' ? v.trim() : undefined;
}

/**
 * Constant-time string comparison (only if lengths match).
 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Admin route protection middleware.
 * Compares incoming request headers to ADMIN_* values from .env.
 * Accepts either ADMIN_USER/PASS or ADMIN_USERNAME/PASSWORD.
 * Expects headers: x-admin-user / x-admin-pass
 */
export function requireAdmin(req) {
  // 1) Read expected envs (both naming styles supported)
  const ADMIN_USER = (process.env.ADMIN_USER || process.env.ADMIN_USERNAME || '').trim();
  const ADMIN_PASS = (process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || '').trim();

  if (!ADMIN_USER || !ADMIN_PASS) {
    const err = new Error('Forbidden: Admin credentials not configured on server (missing env vars).');
    err.statusCode = 403;
    throw err;
  }

  // 2) Read provided credentials from headers
  const userHeader = readHeader(req, 'x-admin-user');
  const passHeader = readHeader(req, 'x-admin-pass');

  // 3) Validate presence
  if (!userHeader || !passHeader) {
    const err = new Error('Forbidden: Missing admin headers.');
    err.statusCode = 403;
    throw err;
  }

  // 4) Timing-safe compare
  const userOK = safeEqual(userHeader, ADMIN_USER);
  const passOK = safeEqual(passHeader, ADMIN_PASS);

  if (!userOK || !passOK) {
    const err = new Error('Forbidden: Invalid credentials');
    err.statusCode = 403;
    throw err;
  }

  // Optional: attach admin identity to req for downstream handlers
  req.admin = { username: ADMIN_USER };
}

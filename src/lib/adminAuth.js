// src/lib/adminAuth.js
import dbConnect from './db';          // optional, but handy if you later check DB
import User from '../models/User';     // optional; not used in basic header check

/**
 * Basic header-based admin check.
 * Expects headers:
 *   x-admin-user: <ADMIN_USER>
 *   x-admin-pass: <ADMIN_PASS>
 *
 * Set env vars in Vercel / .env.local:
 *   ADMIN_USER=...
 *   ADMIN_PASS=...
 */
export function requireAdmin(req) {
  const u = req.headers['x-admin-user'];
  const p = req.headers['x-admin-pass'];
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  const ok =
    u &&
    p &&
    ADMIN_USER &&
    ADMIN_PASS &&
    String(u) === String(ADMIN_USER) &&
    String(p) === String(ADMIN_PASS);

  if (!ok) {
    const err = new Error('Forbidden: Invalid credentials');
    err.statusCode = 403;
    throw err;
  }
}

/**
 * (Optional) Stronger variant that checks an admin record in MongoDB too.
 * Keep only if you actually store admins in the DB.
 */
export async function requireAdminWithDb(req) {
  requireAdmin(req); // header gate first
  await dbConnect();
  const u = req.headers['x-admin-user'];
  const adminDoc = await User.findOne({ username: u }).lean();
  if (!adminDoc) {
    const err = new Error('Forbidden: Admin user not found');
    err.statusCode = 403;
    throw err;
  }
}

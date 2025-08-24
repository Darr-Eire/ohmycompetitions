// src/lib/adminAuth.js
import dbConnect from './dbConnect';
import User from '../models/User';

/**
 * Require Admin Auth for API routes
 */
export function requireAdmin(req) {
  const userHeader = req.headers['x-admin-user'];
  const passHeader = req.headers['x-admin-pass'];

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  const isValid =
    userHeader &&
    passHeader &&
    ADMIN_USER &&
    ADMIN_PASS &&
    String(userHeader) === String(ADMIN_USER) &&
    String(passHeader) === String(ADMIN_PASS);

  if (!isValid) {
    const error = new Error('Forbidden: Invalid credentials');
    error.statusCode = 403;
    throw error;
  }
}

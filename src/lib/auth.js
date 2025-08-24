// lib/auth.js
import { serialize, parse } from 'cookie';

const SESSION_NAME = 'admin_session';
const SESSION_VALUE = process.env.ADMIN_SESSION_SECRET || 'secret-session-token';

/**
 * Set admin session cookie
 */
export function setAdminSession(res) {
  const cookie = serialize(SESSION_NAME, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only https in prod
    sameSite: 'lax', // helps prevent CSRF, use 'strict' if admin-only
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });
  res.setHeader('Set-Cookie', cookie);
}

/**
 * Clear admin session cookie
 */
export function clearAdminSession(res) {
  const cookie = serialize(SESSION_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0), // expire immediately
  });
  res.setHeader('Set-Cookie', cookie);
}

/**
 * Check if request has a valid admin session
 */
export function isAdminAuthenticated(req) {
  try {
    const cookies = parse(req.headers.cookie || '');
    return cookies[SESSION_NAME] === SESSION_VALUE;
  } catch {
    return false;
  }
}

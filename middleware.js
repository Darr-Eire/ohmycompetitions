// file: middleware.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { jwtVerify } from 'jose';

/* ----------------------------- Config & helpers ---------------------------- */
const ADMIN_COOKIE_NAME = 'omc_admin';
const COOKIE_SECRET =
  process.env.ADMIN_COOKIE_SECRET ||
  process.env.JWT_SECRET ||
  'CHANGE_ME__use_ADMIN_COOKIE_SECRET_env';

// For JWT-protected areas (user-facing)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

function verifySignedCookie(value) {
  if (!value) return null;
  const [b64, sig] = String(value).split('.');
  if (!b64 || !sig) return null;

  const expected = crypto.createHmac('sha256', COOKIE_SECRET).update(b64).digest('base64url');
  if (expected !== sig) return null;

  try {
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    return JSON.parse(json); // { sub, user, role, sid, iat }
  } catch {
    return null;
  }
}

/* -------------------------------- Middleware ------------------------------- */
export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // 1) Admin area guard using HMAC cookie (no JWT needed)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = verifySignedCookie(cookie);

    if (!session || session.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = ''; // clean up
      url.searchParams.set('next', pathname + (search || ''));
      return NextResponse.redirect(url);
    }

    // Optionally, you can refresh/extend the cookie here by returning a response that re-sets it.
    return NextResponse.next();
  }

  // 2) JWT-protected user routes
  const isJwtProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/protected');

  if (isJwtProtected) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = '';
      url.searchParams.set('next', pathname + (search || ''));
      return NextResponse.redirect(url);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      console.error('JWT verification failed:', err);
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = '';
      url.searchParams.set('next', pathname + (search || ''));
      return NextResponse.redirect(url);
    }
  }

  // default allow
  return NextResponse.next();
}

/* ------------------------------ Route matcher ------------------------------ */
export const config = {
  matcher: [
    // Admin guard
    '/admin/:path*',
    // JWT user areas
    '/dashboard/:path*',
    '/account/:path*',
    '/protected/:path*',
  ],
};

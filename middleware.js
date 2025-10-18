// middleware.js
import { NextResponse } from 'next/server';

const CANONICAL_HOST =
  process.env.CANONICAL_HOST || 'testnet.ohmycompetitions.com';

const ALLOWED_HOSTS_DEV = (process.env.ALLOWED_HOSTS_DEV || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export function middleware(req) {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent') || '';

  // 1) Pi Browser / Android WebView often adds ":443" and hates 308 loops.
  //    Bypass canonicalization for Pi Browser while we ensure stability.
  if (/PiBrowser|; wv/.test(ua)) {
    return NextResponse.next();
  }

  // 2) Use parsed hostname (not raw Host header which may include :port)
  const hostname = url.hostname;

  const isCanonical = hostname === CANONICAL_HOST;
  const isAllowedDev = ALLOWED_HOSTS_DEV.includes(hostname);

  if (!isCanonical && !isAllowedDev) {
    const target = new URL(req.url);
    target.hostname = CANONICAL_HOST; // keep protocol, path, query, etc.
    // Use 301/307; avoid 308 for WebViews
    return NextResponse.redirect(target, 301);
  }

  return NextResponse.next();
}

// Skip Next internals & static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};

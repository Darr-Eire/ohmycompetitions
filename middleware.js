// middleware.ts (or middleware.js)
import { NextResponse } from 'next/server';

const CANONICAL_HOST = process.env.CANONICAL_HOST || 'testnet.ohmycompetitions.com';
const ALLOWED_HOSTS_DEV = (process.env.ALLOWED_HOSTS_DEV || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export function middleware(req: Request) {
  const url = new URL(req.url);
  const ua = (req.headers as any).get?.('user-agent') || '';

  // 1) Pi Browser / Android WebView can append :443 in Host and hates 308s.
  //    Also, while debugging, just bypass canonicalization for Pi Browser.
  if (/PiBrowser|wv;/.test(ua)) {
    return NextResponse.next();
  }

  // 2) Compare hostname only (not raw Host header with port)
  const hostname = url.hostname;

  const isCanonical = hostname === CANONICAL_HOST;
  const isAllowedDev = ALLOWED_HOSTS_DEV.includes(hostname);

  if (!isCanonical && !isAllowedDev) {
    const target = new URL(req.url);
    target.hostname = CANONICAL_HOST; // keep scheme, path, query
    // Use 301 (or 307) — avoid 308 for WebViews
    return NextResponse.redirect(target, 301);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals & static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};

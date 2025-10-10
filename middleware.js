import { NextResponse } from 'next/server';
const CANONICAL_HOST = process.env.CANONICAL_HOST || 'testnet.ohmycompetitions.com';
const ALLOWED_HOSTS_DEV = (process.env.ALLOWED_HOSTS_DEV || '').split(',').map(s=>s.trim()).filter(Boolean);

export function middleware(req){
  const host = req.headers.get('host') || '';
  const isCanonical = host === CANONICAL_HOST;
  const isAllowedDev = ALLOWED_HOSTS_DEV.includes(host);
  if(!isCanonical && !isAllowedDev){
    const url = req.nextUrl.clone(); url.hostname = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}
export const config = { matcher: ['/:path*'] };

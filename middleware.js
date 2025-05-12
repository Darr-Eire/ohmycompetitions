import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Your JWT secret
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next(); // ✅ token is valid, allow access
  } catch (err) {
    console.error('JWT verification failed:', err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// 👇 Only run middleware for these routes:
export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/protected/:path*'],
};

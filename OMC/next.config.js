/** @type {import('next').NextConfig} */

// ---- CSP strings
const relaxedDebugCsp = [
  "default-src 'self' https:",
  // allow inline only on debug page
  "script-src 'self' https: 'unsafe-inline'",
  "style-src  'self' https: 'unsafe-inline'",
  "img-src 'self' https: data:",
  // Pi SDK + APIs
  "connect-src 'self' https://api.minepi.com https://*.minepi.com https://socialchain.app https://*.socialchain.app https://sandbox.minepi.com",
  // framing
  "frame-src https://*.minepi.com https://app-cdn.minepi.com",
  "frame-ancestors 'self' https://*.minepi.com https://sandbox.minepi.com https://app-cdn.minepi.com"
].join("; ");

const strictGlobalCsp = [
  "default-src 'self' https:",
  "script-src 'self' https:",
  "style-src  'self' https:",
  "img-src 'self' https: data:",
  // keep socialchain + sandbox for auth outside debug page too
  "connect-src 'self' https://api.minepi.com https://*.minepi.com https://socialchain.app https://*.socialchain.app https://sandbox.minepi.com",
  "frame-src https://*.minepi.com https://app-cdn.minepi.com",
  "frame-ancestors 'self' https://*.minepi.com https://sandbox.minepi.com https://app-cdn.minepi.com"
].join("; ");

const nextConfig = {
  async headers() {
    return [
      // Relaxed ONLY for /debug-auth
      {
        source: "/debug-auth",
        headers: [{ key: "Content-Security-Policy", value: relaxedDebugCsp }],
      },
      // Strict for everything else (negative look-ahead avoids overriding /debug-auth)
      {
        source: "/((?!debug-auth).*)",
        headers: [{ key: "Content-Security-Policy", value: strictGlobalCsp }],
      },
    ];
  },
};

module.exports = nextConfig;

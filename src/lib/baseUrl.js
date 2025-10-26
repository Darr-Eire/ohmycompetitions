export function getSelfBaseUrl(req) {
  // Prefer proxy headers in prod
  const proto = (req.headers['x-forwarded-proto'] || '').toString();
  const host  = (req.headers['x-forwarded-host']  || req.headers.host || '').toString();

  if (proto && host) return `${proto}://${host}`;
  if (req.headers.origin) return req.headers.origin.toString();

  // Last resort: env var or dev default
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

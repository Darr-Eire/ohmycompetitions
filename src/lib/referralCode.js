// src/lib/referralCode.js
export function generateReferralCode(username, fallback) {
  const core = (username || fallback || 'pioneer')
    .toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12);
  const suffix = Math.random().toString(36).slice(2,6);
  return `${core}${suffix}`; // unique-ish; check DB and retry if collision
}

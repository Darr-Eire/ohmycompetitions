// src/lib/xp.js

/** Economy rule:
 * Stage 1 entry costs 0.15 π and awards 1 XP.
 * Therefore, when spending XP:
 *   xp_cost = ceil(entryFee(π) / PI_PER_XP)
 */
export const PI_PER_XP = 0.15;          // 1 XP is anchored to 0.15 π of spend
export const MAX_XP_COST = 10000;       // optional cap; set to Infinity if you wish

// If a comp has no entryFee recorded, estimate a π fee by theme (so legacy docs still work).
function fallbackPiByTheme(theme = '') {
  const t = String(theme || '').toLowerCase();
  if (t === 'daily')   return 1;  // light, frequent
  if (t === 'launch')  return 3;  // promo mid-tier
  if (t === 'pi')      return 3;  // pi pools
  if (t === 'tech')    return 5;  // higher perceived value
  if (t === 'premium') return 6;  // premium prizes
  if (t === 'free')    return 0;  // free comps shouldn't require XP
  return 2;                       // sensible default
}

/** Level gating (optional): roughly 1 level per +50 XP cost */
export function levelFromXP(xpCost) {
  return Math.max(1, 1 + Math.floor((Number(xpCost) || 0) / 50));
}

/** Compute XP spend cost for a competition document */
export function computeXPCost(compDoc = {}) {
  // Prefer explicit π entry fee if present
  const piFeeRaw = compDoc?.comp?.entryFee;
  const theme = compDoc?.comp?.theme || compDoc?.theme || '';

  // If we truly know it's free, no XP
  if (piFeeRaw === 0 || String(theme).toLowerCase() === 'free') return 0;

  // Choose which π fee to use
  const piFee = (typeof piFeeRaw === 'number' && piFeeRaw > 0)
    ? piFeeRaw
    : fallbackPiByTheme(theme);

  if (!piFee || piFee <= 0) return 0;

  // Core rule: ceil(π / 0.15)
  let xpCost = Math.ceil(piFee / PI_PER_XP);

  // Cap if you keep a cap
  if (Number.isFinite(MAX_XP_COST)) {
    xpCost = Math.min(xpCost, MAX_XP_COST);
  }

  // Enforce minimum of 1 XP when there is a positive fee
  return Math.max(1, xpCost);
}

/** Utility: get slug from comp.slug or href like /competitions/foo */
export function deriveSlug(compDoc = {}) {
  const s = compDoc?.comp?.slug || compDoc?.slug || '';
  if (s) return s.replace(/^\/+|\/+$/g, '').split('/').pop();
  const href = compDoc?.comp?.href || compDoc?.href || '';
  if (!href) return '';
  return href.replace(/^\/+|\/+$/g, '').split('/').pop();
}

/** Utility: normalize end date fields */
export function deriveEndsAt(compDoc = {}) {
  return (
    compDoc?.comp?.endsAt ||
    compDoc?.comp?.closeAt ||
    compDoc?.comp?.drawAt ||
    compDoc?.comp?.drawDate ||
    compDoc?.endsAt ||
    compDoc?.closeAt ||
    compDoc?.drawAt ||
    compDoc?.drawDate ||
    null
  );
}

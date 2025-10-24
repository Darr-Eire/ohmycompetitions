// file: src/data/descriptions.js

/**
 * Centralized competition descriptions.
 * Import wherever needed:
 *   import { getDescriptionForSlug, listDescriptions, DESCRIPTIONS, DEFAULT_DESCRIPTION } from 'data/descriptions';
 */

export const DEFAULT_DESCRIPTION =
  'Enter the draw by securing a ticket and passing the skill question. Check the page for live prize details, end time, and any ticket caps.';

export const DESCRIPTIONS = {
  // === Examples / live slugs ===
  '55-smart-tv': {
    title: '55″ Smart TV',
    description:
      'Win a brand-new 55″ Smart TV and upgrade movie nights in one hit. Answer the skill question, grab a ticket for just 0.35 π, and you’re in. Simple entry, big screen, bigger vibes.',
    bullets: [
      'Entry fee: 0.35 π',
      'Limited tickets',
      'Winner selected at random after end time',
    ],
    lastUpdated: '2025-10-22',
  },

  'pi-to-the-moon': {
    title: 'Pi To The Moon (7,500 π)',
    description:
      '7,500 π up for grabs! Enter “Pi To The Moon,” answer the skill check, and shoot your shot. One ticket = one entry — the prize pot is pure π.',
    bullets: ['Total prize: 7,500 π', 'Skill question required', 'No cash alternative'],
    lastUpdated: '2025-10-22',
  },

  'omc-5000-pi-prize-pool': {
    title: '5,000 π Prize Pool',
    description:
      'The 5,000 π Prize Pool is live. Stack your entries, pass the skill question, and let the RNG gods decide. Payouts are in π — no fluff, just digital gold.',
    bullets: ['Total pool: 5,000 π', 'Multiple winners possible', 'RNG draw at end'],
    lastUpdated: '2025-10-22',
  },

  'omc-1000-pi-prize-pool': {
    title: '10,000 π Prize Pool',
    description:
      'Go big with the 10,000 π Prize Pool. Secure entries, beat the skill gate, and you’re in the running for a serious π haul.',
    bullets: ['Total pool: 10,000 π', 'Entries limited per user (if shown)', 'Payouts in π'],
    lastUpdated: '2025-10-22',
  },

  'ps5-bundle-giveaway': {
    title: 'PS5 Bundle Giveaway',
    description:
      'Next-gen gaming starts here. Win a PS5 bundle — console plus extras (varies by region). Enter with a ticket, clear the skill check, and level up IRL.',
    bullets: ['PS5 console + extras', 'Winner notified within 7 days', 'Delivery may vary by region'],
    lastUpdated: '2025-10-22',
  },

  'pi-daily-draw': {
    title: 'Pi Daily Draw (100 π)',
    description:
      'Daily shot at 100 π. Quick entry, quick draw — perfect for regulars. Check the cutoff in-app, answer the skill Q, and you’re in today’s pool.',
    bullets: ['100 π per draw', 'Entries don’t roll over', 'One winner unless stated'],
    lastUpdated: '2025-10-22',
  },

  'weekly-micro-monday': {
    title: 'Weekly Micro Monday (15 π)',
    description:
      'Kick off the week with a tidy 15 π micro-pot. Light, fast, every Monday — clean mechanics, quick results.',
    bullets: ['Total: 15 π per micro-draw', 'Weekly cadence', 'Random draw after cutoff'],
    lastUpdated: '2025-10-22',
  },

  // === Tests / placeholders ===
  'test-competition': {
    title: 'Test Competition',
    description:
      'Internal testing/QA item. Not intended for public participation. Entries may be reset or voided at any time.',
    bullets: ['Testing only', 'State can reset', 'No real prize obligation'],
    lastUpdated: '2025-10-22',
  },

  test2: {
    title: 'Test 2',
    description:
      'Secondary internal test. Content and state may change without notice. Not a public competition.',
    bullets: ['Testing environment', 'No guarantees', 'Data may be cleared'],
    lastUpdated: '2025-10-22',
  },
};

/** Normalize keys like titles/slugs into a consistent lookup form. */
function normalizeKey(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

/**
 * Return a nice description string for the given slug (or title).
 * Falls back to DEFAULT_DESCRIPTION if none found.
 */
export function getDescriptionForSlug(slugOrTitle) {
  const key = normalizeKey(slugOrTitle);
  if (key && DESCRIPTIONS[key]?.description) return DESCRIPTIONS[key].description;

  // Try to fuzzy-match by stripping common words (optional, simple)
  const loose = key.replace(/(giveaway|bundle|prize|pool|draw)/g, '').replace(/-+/g, '-');
  for (const [k, v] of Object.entries(DESCRIPTIONS)) {
    const kk = normalizeKey(k).replace(/(giveaway|bundle|prize|pool|draw)/g, '').replace(/-+/g, '-');
    if (kk === loose && v?.description) return v.description;
  }

  return DEFAULT_DESCRIPTION;
}

/** Return the whole object for a slug/title (useful for admin UI lists). */
export function getDescriptionObject(slugOrTitle) {
  const key = normalizeKey(slugOrTitle);
  if (key && DESCRIPTIONS[key]) return DESCRIPTIONS[key];
  return null;
}

/** List all descriptions as an array (useful for admin pages). */
export function listDescriptions() {
  return Object.entries(DESCRIPTIONS).map(([key, val]) => ({ key, ...val }));
}

// file: src/data/competition-terms.js

/** Normalize any slug-ish value to a kebab-case lookup key */
export function normalizeSlug(v) {
  return String(v || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Generic fallback terms used when a slug is not explicitly listed */
export function buildGenericTerms({
  title = 'Competition',
  entryFee,
  prizeLabel = 'Prize / Prize Pool',
  prizeValue,
  scheduleText = 'See the competition page for the exact timing.',
} = {}) {
  const feeText =
    entryFee == null
      ? 'Entry fee as shown on the page (if any).'
      : `Entry fee: ${String(entryFee)} π per ticket (unless otherwise stated).`;

  const prizeText =
    prizeValue == null
      ? `${prizeLabel} as displayed on the page.`
      : `${prizeLabel}: ${String(prizeValue)} π (as displayed on the page).`;

  return {
    title: `Terms & Conditions — ${title}`,
    sections: [
      { h: 'Eligibility', p: 'Open to verified Pi users, 18+, where lawful. Void where prohibited.' },
      { h: 'How to Enter', p: 'Sign in with Pi, answer the skill question correctly (where applicable), and complete entry.' },
      { h: 'Entry Fee', p: feeText },
      { h: 'Tickets', p: 'Each valid ticket equals one (1) entry. Per-user caps may apply and will be shown on the page.' },
      { h: 'Prize', p: prizeText },
      { h: 'Draw Timing', p: `Random draw occurs at or after the end date/time. ${scheduleText}` },
      { h: 'Winner Verification', p: 'Winner(s) must pass account and eligibility checks. Failure results in redraw.' },
      { h: 'Notification', p: 'Winner(s) are notified in-app/email within a reasonable timeframe (typically within 7 days).' },
      { h: 'Delivery / Payout', p: 'Payouts are in π (for π prizes). Physical items are delivered where feasible; customs/duties/taxes are the winner’s responsibility.' },
      { h: 'Fair Play', p: 'Multiple accounts, bots, or manipulation lead to disqualification and forfeiture.' },
      { h: 'Cancellations & Refunds', p: 'We may amend/cancel for reasons beyond our control. If cancelled prior to a draw, entries in π may be refunded.' },
      { h: 'Liability', p: 'Not liable for technical issues, outages, or delays beyond our control.' },
      { h: 'General', p: 'These terms supplement platform terms and any policies shown on the page. Organizer decisions are final.' },
    ],
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

/* ----------------------- Explicit competition terms ----------------------- */
/*  Keys must be lowercase kebab-case to match your runtime comp.slug        */

export const COMPETITION_TERMS = {
  'iphone-15-giveaway': {
    title: 'Terms & Conditions — iPhone 15 Giveaway',
    sections: [
      { h: 'Eligibility', p: 'Open to Pioneers 18+ where local laws allow. Void where prohibited.' },
      { h: 'How to Enter', p: 'Purchase a ticket or claim a free ticket if available. Skill question must be answered correctly.' },
      { h: 'Prizes', p: 'One (1) iPhone 15. Color and storage may vary subject to availability.' },
      { h: 'Winners & Notification', p: 'Winners drawn at random and notified via app/email within 7 days.' },
      { h: 'Delivery', p: 'Physical prizes shipped to winner; customs/duties are winner’s responsibility.' },
      { h: 'General', p: 'We may cancel or amend the competition for reasons beyond our control.' },
    ],
    lastUpdated: '2025-10-01',
  },

  'pi-week-mega-pot': {
    title: 'Terms & Conditions — Pi Week Mega Pot',
    sections: [
      { h: 'Eligibility', p: 'Open worldwide to verified Pi users where permitted by law.' },
      { h: 'Tickets', p: 'Each ticket is one entry; max tickets may apply per user.' },
      { h: 'Prize Pool', p: 'Prize pool displayed on the page. Payouts in π as stated.' },
      { h: 'Draw', p: 'Random draw at the end date shown. On-chain proof may be provided.' },
      { h: 'Disputes', p: 'Organizer decisions are final.' },
    ],
    lastUpdated: '2025-10-01',
  },

  '55-smart-tv': {
    title: 'Terms & Conditions 55″ Smart TV',
    sections: [
      { h: 'Eligibility', p: 'Open to Pioneers aged 18+ where local laws permit. Void where prohibited.' },
      { h: 'Entry Fee', p: '0.35 π per ticket as shown. Each valid ticket equals one (1) entry.' },
      { h: 'Ticket Limits', p: 'Per-user ticket caps may apply as shown on the competition page.' },
      { h: 'How to Enter', p: 'Sign in with Pi, answer the skill question correctly, and complete payment in π.' },
      { h: 'Prize', p: 'One (1) 55″ Smart TV. Brand/model may vary by availability and region.' },
      { h: 'Draw & Winner Selection', p: 'Random draw from all eligible entries after the end date shown on the page.' },
      { h: 'Notification', p: 'Winner notified in-app/email within 7 days of draw. Failure to respond within the timeframe stated may forfeit the prize.' },
      { h: 'Delivery', p: 'Physical delivery arranged to the winner’s eligible address. Any customs/duties/taxes are the winner’s responsibility.' },
      { h: 'Refunds & Cancellations', p: 'All entries are final. We may cancel or amend for reasons beyond our control; if cancelled before a draw, entries will be refunded in π.' },
      { h: 'Fair Play', p: 'Multiple accounts, bots, or manipulation lead to disqualification and forfeiture.' },
      { h: 'Liability', p: 'Not liable for technical issues, outages, or delays beyond our control.' },
      { h: 'Governing Terms', p: 'These terms supplement the general platform terms and the policies shown on the page.' },
    ],
    lastUpdated: '2025-10-22',
  },

  'pi-to-the-moon': {
    title: 'Terms & Conditions — Pi To The Moon (7,500 π)',
    sections: [
      { h: 'Eligibility', p: 'Open worldwide to verified Pi users where lawful. Void where prohibited.' },
      { h: 'Tickets', p: 'Each ticket equals one entry. Any per-user limits are shown on the page.' },
      { h: 'Prize', p: 'Total prize of 7,500 π as displayed. Distribution details are as shown on the page.' },
      { h: 'No Cash Alternative', p: 'Payout is in π. No cash alternative.' },
      { h: 'Skill Question', p: 'A correct skill answer is required for a valid paid entry.' },
      { h: 'Draw', p: 'Random draw at or after the end date/time shown on the page.' },
      { h: 'Verification', p: 'Winner must pass account and eligibility checks. Failure results in redraw.' },
      { h: 'Disputes', p: 'Organizer decisions are final.' },
    ],
    lastUpdated: '2025-10-22',
  },

  'omc-5000-pi-prize-pool': {
    title: 'Terms & Conditions — 5,000 π Prize Pool',
    sections: [
      { h: 'Eligibility', p: 'Verified Pi users, 18+, where legal.' },
      { h: 'Entries', p: 'Each ticket is one entry. Any cap per user is shown on the page.' },
      { h: 'Prize Pool', p: 'Total 5,000 π. The live/prior breakdown on the page governs if different from any examples.' },
      { h: 'Payout', p: 'Payouts made in π to the winner(s) after verification.' },
      { h: 'Draw & Odds', p: 'Random draw from all eligible entries. Odds depend on the number of entries.' },
      { h: 'Fraud Prevention', p: 'Bots, duplicate accounts, or manipulation are prohibited and will void entries.' },
      { h: 'Cancellations', p: 'If cancelled prior to a draw, π entries are refunded.' },
    ],
    lastUpdated: '2025-10-22',
  },

  'omc-1000-pi-prize-pool': {
    title: 'Terms & Conditions — 10,000 π Prize Pool',
    sections: [
      { h: 'Eligibility', p: 'Verified Pi users, 18+, where legal.' },
      { h: 'Entries', p: 'Each valid ticket equals one entry, subject to any per-user caps shown.' },
      { h: 'Prize Pool', p: 'Total 10,000 π. Distribution as displayed on the competition page.' },
      { h: 'Draw Timing', p: 'Draw occurs at or after the end date/time shown.' },
      { h: 'Verification & Payout', p: 'Winner(s) must pass verification; payouts in π only.' },
      { h: 'Liability', p: 'We are not responsible for technical issues outside our control.' },
      { h: 'Amendments', p: 'We may amend/cancel in case of fraud, legal changes, or force majeure.' },
    ],
    lastUpdated: '2025-10-22',
  },

  'ps5-bundle-giveaway': {
    title: 'Terms & Conditions — PS5 Bundle',
    sections: [
      { h: 'Eligibility', p: 'Open to Pioneers 18+ where legal. Void where prohibited.' },
      { h: 'How to Enter', p: 'Sign in with Pi, answer the skill question, and complete entry as shown.' },
      { h: 'Prize', p: 'One (1) PS5 bundle. Contents (games/accessories) may vary by region and availability.' },
      { h: 'Draw & Notification', p: 'Random draw after the end date shown. Winner notified within 7 days.' },
      { h: 'Delivery', p: 'Physical delivery arranged; customs/duties/taxes are the winner’s responsibility.' },
      { h: 'Substitutions', p: 'We may offer an equivalent item if the advertised model is unavailable.' },
      { h: 'Fair Use', p: 'Cheating or abuse leads to disqualification and forfeiture.' },
    ],
    lastUpdated: '2025-10-22',
  },

  'pi-daily-draw': {
    title: 'Terms & Conditions — Pi Daily Draw (100 π)',
    sections: [
      { h: 'Eligibility', p: 'Verified Pi users, 18+, where lawful.' },
      { h: 'Frequency', p: 'Intended as a daily draw; exact cutoffs and draw times are as shown in the app.' },
      { h: 'Prize', p: '100 π per draw unless otherwise stated on the page.' },
      { h: 'Entries', p: 'Each valid ticket equals one entry for that day’s draw only.' },
      { h: 'Carryover', p: 'Entries do not roll over unless explicitly stated.' },
      { h: 'Winners', p: 'One winner per draw (unless the page states multiple). Odds depend on entries received.' },
      { h: 'Abuse Prevention', p: 'Automation, multi-accounting, or manipulation is prohibited.' },
    ],
    lastUpdated: '2025-10-22',
  },

  'weekly-micro-monday': {
    title: 'Terms & Conditions — Weekly Micro Monday (15 π)',
    sections: [
      { h: 'Eligibility', p: 'Open to verified Pi users, 18+, where lawful.' },
      { h: 'Schedule', p: 'A weekly micro-draw; cadence and cutoff times are as shown in the app.' },
      { h: 'Prize', p: '15 π total per scheduled draw unless otherwise stated.' },
      { h: 'Entries', p: 'Each valid ticket equals one entry for the scheduled draw; no rollover unless stated.' },
      { h: 'Winner Selection', p: 'Random draw from eligible entries after the cutoff.' },
      { h: 'General', p: 'Organizer decisions are final. Abuse leads to disqualification.' },
    ],
    lastUpdated: '2025-10-22',
  },

  // Dev/test examples
  'psuedo:test-competition-fallback': undefined,

  'test-competition': {
    title: 'Terms & Conditions — Test Competition',
    sections: [
      { h: 'Purpose', p: 'This competition is used for testing, QA, and development. It may be disabled, reset, or cancelled at any time.' },
      { h: 'Eligibility', p: 'Not intended for public participation. Any entries may be voided without notice.' },
      { h: 'Prizes', p: 'No guaranteed prize. Any displayed values are placeholders for testing.' },
      { h: 'Refunds', p: 'If payments are enabled during testing and a draw is cancelled, entries may be refunded at our discretion.' },
      { h: 'Data', p: 'Test entries may be deleted during resets. Do not rely on persistence.' },
    ],
    lastUpdated: '2025-10-22',
  },

  'test2': {
    title: 'Terms & Conditions — Test 2',
    sections: [
      { h: 'Purpose', p: 'Internal testing/QA only. Subject to change or removal without notice.' },
      { h: 'Public Use', p: 'Not open to public participation. Any tickets/entries may be invalidated.' },
      { h: 'Prize', p: 'No real-world prize obligation exists for this test item.' },
      { h: 'Liability', p: 'No liability is accepted for data loss or resets in test environments.' },
    ],
    lastUpdated: '2025-10-22',
  },
};

/* --------------------------- Defaults / Descriptions --------------------------- */

export const DEFAULT_TERMS = buildGenericTerms({ title: 'Competition' });

export const COMPETITION_DESCRIPTIONS = {
  '55-smart-tv': `Win a brand-new 55″ Smart TV and upgrade movie nights in one hit. Answer the skill question, grab a ticket for just 0.35 π, and you’re in. Simple entry, big screen, bigger vibes.`,
  'pi-to-the-moon': `7,500 π up for grabs! Enter “Pi To The Moon,” answer the skill check, and shoot your shot. One ticket = one entry — the prize pot is pure π.`,
  'omc-5000-pi-prize-pool': `The 5,000 π Prize Pool is live. Stack your entries, pass the skill question, and let the RNG gods decide. Payouts are in π — no fluff, just digital gold.`,
  'omc-1000-pi-prize-pool': `Go big with the 10,000 π Prize Pool. Secure entries, beat the skill gate, and you’re in the running for a serious π haul.`,
  'ps5-bundle-giveaway': `Next-gen gaming starts here. Win a PS5 bundle — console plus extras (varies by region). Enter with a ticket, clear the skill check, and level up IRL.`,
  'pi-daily-draw': `Daily shot at 100 π. Quick entry, quick draw — perfect for regulars. Check the cutoff in-app, answer the skill Q, and you’re in today’s pool.`,
  'weekly-micro-monday': `Kick off the week with a tidy 15 π micro-pot. Light, fast, every Monday — clean mechanics, quick results.`,
  'test-competition': `Internal testing/QA item. Not intended for public participation. Entries may be reset or voided at any time.`,
  'test2': `Secondary internal test. Content and state may change without notice. Not a public competition.`,
};

export const DEFAULT_DESCRIPTION =
  'Enter the draw by securing a ticket and passing the skill question. Check the page for live prize details, end time, and any ticket caps.';

/* ------------------------------ Lookup helpers ------------------------------ */

export function getTermsForSlug(slug) {
  const key = normalizeSlug(slug);
  const explicit = COMPETITION_TERMS[key];
  if (explicit && typeof explicit === 'object') return explicit;
  if (Object.prototype.hasOwnProperty.call(COMPETITION_TERMS, key)) return DEFAULT_TERMS;
  return DEFAULT_TERMS;
}

export function getDescriptionForSlug(slug) {
  const key = normalizeSlug(slug);
  return COMPETITION_DESCRIPTIONS[key] ?? DEFAULT_DESCRIPTION;
}

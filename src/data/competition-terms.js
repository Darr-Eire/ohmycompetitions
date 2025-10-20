// Minimal example; add more slugs as needed.
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
};

// Fallback/default terms (used if slug not found)
export const DEFAULT_TERMS = {
  title: 'Terms & Conditions',
  sections: [
    { h: 'Eligibility', p: 'Open where legally permitted. Void where prohibited.' },
    { h: 'Entries', p: 'No purchase necessary where applicable. Skill question required for paid entries.' },
    { h: 'Liability', p: 'Organizer not liable for technical failures, delays, or lost communications.' },
  ],
  lastUpdated: '2025-10-01',
};

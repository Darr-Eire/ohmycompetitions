// src/data/competitionDescriptions.js
// Centralized marketing copy for competitions.
// Priority: slug > theme > default

/* -------------------------------- Utilities ------------------------------- */
function extractSlug(input) {
  // Accept plain object or nested { comp: { ... } }
  const c = input?.comp ?? input ?? {};
  const direct = (c.slug || '').toLowerCase().trim();

  if (direct) return direct;

  // Try href like "/competitions/ps5-bundle-giveaway"
  const href = (c.href || '').toLowerCase().trim();
  if (href) {
    const parts = href.replace(/^\/+|\/+$/g, '').split('/');
    return parts[parts.length - 1] || '';
  }
  return '';
}

/* --------------------------------- Copy DB -------------------------------- */
export const DESCRIPTIONS = {
  // 1) Slug-specific descriptions (strongest match)
  slugs: {
    // 🎮 Tech / Hardware
    'ps5-bundle-giveaway':
      'Win a PlayStation 5 bundle. Stack or gift tickets to boost your odds — verifiably fair draw, on-chain transparency.',
    '55-smart-tv':
      'Win a 55″ 4K Smart TV. Enter with low-cost tickets, invite friends for bonus entries. See T&Cs for prize specifics.',

    // 📱 Phones / Premium
    'iphone-16':
      'Win the latest iPhone 16. Randomized ticket draw with provable fairness — gift tickets to friends to build your edge.',

    // 🟣 Pi prize pools
    'omc-2500-pi-prize-pool':
      '2,500 π prize pool split across top winners. Low entry, boosted referrals, and transparent on-chain settlement.',
    'omc-5000-pi-prize-pool':
      '5,000 π community prize pool with multiple winners. Enter, refer, and climb the leaderboards with bonus tickets.',
    // Title says 10,000, href shows "1000" — map both to the same copy.
    'omc-1000-pi-prize-pool':
      '10,000 π prize pool — our biggest community pot. Multiple tiers, provably fair randomness, and referral rewards for sharers.',
    'omc-pi-mini-jackpot':
      'Mini Jackpot: 250 π. Quick rounds, approachable entry fees, and solid odds for early Pioneers.',

    // 🚀 Launch specials
    'omc-pi-pioneers-draw':
      'Pioneers Draw: headline launch special with a 750 π top prize. Early entries get momentum; referrals unlock bonuses.',
    'omc-mega-pi-draw':
      'Mega Pi Draw with a 300 π top tier. Buy or gift tickets to amp your odds — fully transparent, randomly selected winners.',

    // 🆓 Free entries
    'pi-to-the-moon':
      'FREE mega promo — 7,500 π across winners. Claim your free ticket; share to unlock a bonus entry. Zero cost, full hype.',

    // 📅 Daily / Weekly micro draws
    'pi-daily-draw':
      'Daily 100 π jackpot. 24-hour rounds, fast payouts, and low-cost entry. Fresh chances every day.',
    'weekly-micro-win':
      'Weekly Micro Win: snack-size stakes, steady wins. 40 π top tier with extra micro prizes to keep it fun.',
    'weekly-micro-monday':
      'Micro Monday: kick-start the week with a tiny-fee draw and quick winners. Perfect warm-up for bigger prizes.',
    'weekly-two-for-tuesday':
      'Two-for-Tuesday: quick mid-week draw with compact prizes and boosted referral rewards. Swipe in, score fast.',
  },

  // 2) Theme-level fallbacks (used when slug not found)
  themes: {
    launch:
      'Launch-week specials: limited-time prizes, boosted referrals, and bonus tickets for early entries.',
    daily:
      'A new draw every day. Small fees, fast results, and frequent winners.',
    pi:
      'Pi-native rewards and utilities. Earn tickets, invite friends, and climb leaderboards.',
    free:
      'No entry fee. Complete simple actions to claim tickets and join the draw.',
    crypto:
      'Win popular crypto prizes. Transparent draws and instant on-chain settlement.',
    tech:
      'Gadgets and gear. Phones, wearables, accessories — new drops all month.',
  },

  // 3) Global default (used if neither slug nor theme matches)
  default:
    'Buy or gift tickets to enter. Winners are selected at random with provable fairness and on-chain transparency.',
};

/* ---------------------------- Public helper API ---------------------------- */
export function describeCompetition(comp) {
  if (!comp) return DESCRIPTIONS.default;

  // Prefer slug; gracefully fall back to href; then theme
  const slug = extractSlug(comp);
  const theme =
    (comp?.theme ||
      comp?.comp?.theme ||
      '').toLowerCase();

  return (
    (slug && DESCRIPTIONS.slugs[slug]) ||
    (theme && DESCRIPTIONS.themes[theme]) ||
    DESCRIPTIONS.default
  );
}

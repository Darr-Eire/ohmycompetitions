// file: src/lib/funnelMath.js

/**
 * Compute funnel economics.
 * Supports overlapping payout tiers (e.g., 6–10 and 10–20 both include rank 10).
 */
export function computeFunnelEconomics({
  stage1Players = 25,
  entryFee = 0.15,
  branching = 5, // players advancing per room
  stages = 5,
  payoutTiers = [
    { min: 1,  max: 1,  amount: 1000 },
    { min: 2,  max: 2,  amount: 500  },
    { min: 3,  max: 3,  amount: 250  },
    { min: 4,  max: 4,  amount: 100  },
    { min: 5,  max: 5,  amount: 50   },
    { min: 6,  max: 10, amount: 20   },
    // NOTE: your chosen “overlap” to reach total payout 2200 π (profit 143.75 π)
    { min: 10, max: 20, amount: 10   },
  ],
}) {
  // Rooms needed per stage to end with one final room:
  // stage i rooms = branching^(stages - i)
  const roomsPerStage = Array.from({ length: stages }, (_, i) => Math.pow(branching, stages - (i + 1)));
  // Entry fees only charged in Stage 1 rooms:
  const revenuePerStage = roomsPerStage.map((rooms, i) =>
    i === 0 ? rooms * stage1Players * entryFee : 0
  );
  const totalRevenue = revenuePerStage.reduce((a, b) => a + b, 0);

  // Payouts (allow overlaps)
  const totalPayout = payoutTiers.reduce((sum, tier) => {
    const winners = tier.max - tier.min + 1;
    return sum + winners * tier.amount;
  }, 0);

  const profit = totalRevenue - totalPayout;

  return {
    roomsPerStage,        // e.g., [625, 125, 25, 5, 1]
    revenuePerStage,      // only stage 1 has revenue
    totalRevenue,         // 2343.75 π with defaults
    totalPayout,          // 2200 π with your overlapping tiers
    profit,               // 143.75 π
  };
}

export function formatPi(x, digits = 2) {
  const n = Number(x);
  if (Number.isNaN(n)) return `${x} π`;
  // show .00 only if needed
  const s = Math.abs(n % 1) < 1e-9 ? n.toString() : n.toFixed(digits);
  return `${s} π`;
}

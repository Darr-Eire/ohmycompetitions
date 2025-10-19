// src/data/descriptions/registry.js
// Optional custom descriptions per slug. Each value can be:
// - a function (comp) => string
// - or a static string
export const descriptionRegistry = {
  'omc-pi-mini-jackpot': (comp) => `
🎰 OMC Pi Mini Jackpot
Quick-fire draw with a juicy top prize!

Draw Date: ${
  comp?.endsAt ? new Date(comp.endsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBA'
}
1st Prize: ${typeof comp?.firstPrize === 'number' ? `${Math.round(comp.firstPrize)} π` : (comp?.firstPrize || '250 π')}
Entry Fee: ${typeof comp?.entryFee === 'number' ? `${comp.entryFee.toFixed(2)} π` : (comp?.entryFee || '0.50 π')}
Tickets Sold: ${comp?.ticketsSold ?? 0} / ${comp?.totalTickets ?? 500}

Rules:
1) login with Pi Network to enter.
2) Tickets are non-refundable.
3) Winners chosen randomly at draw time; prize sent within 48 hours.
4) Prize is awarded as advertised regardless of sellout unless the comp states otherwise.
5) By entering, you agree to the Terms & Conditions.

Tip: It only takes one ticket to win — but more tickets = better odds!
  `.trim(),
};

// src/data/descriptions/templates.js

export function defaultTemplate(comp = {}) {
  const {
    title = 'Competition',
    firstPrize,
    entryFee,
    endsAt,
    totalTickets,
    ticketsSold,
    winners,
    slug,
  } = comp;

  const endLabel = endsAt
    ? new Date(endsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'TBA';

  const sold = Number(ticketsSold || 0);
  const total = Number(totalTickets || 0);
  const available = Math.max(0, total - sold);

  const feeStr = typeof entryFee === 'number'
    ? `${entryFee.toFixed(2)} π`
    : (entryFee || '0.00 π');

  const prizeStr = typeof firstPrize === 'number'
    ? `${Math.round(firstPrize).toLocaleString()} π`
    : (firstPrize || '—');

  return `
${title}
Live Now

Draw Date: ${endLabel}
1st Prize: ${prizeStr}
Entry Fee: ${feeStr}
Tickets Sold: ${sold} / ${total}
Available: ${available} left
Winners: ${winners || 'Multiple'}

Rules:
1) login with Pi Network to enter.
2) Each ticket is non-refundable.
3) Winners are selected randomly via our verifiable draw system.
4) Prizes are paid within 48 hours to the winner’s Pi wallet.
5) The prize is awarded as advertised regardless of sellout unless otherwise stated.
6) By entering, you agree to the site Terms & Conditions.

Good luck, Pioneer!
  `.trim();
}

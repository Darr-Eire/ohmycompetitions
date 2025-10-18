// pages/competitions/pi-to-the-moon.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import LaunchCompetitionDetailCard from 'components/LaunchCompetitionDetailCard';

export default function PiToTheMoonPage() {
  // Dates can remain; we force "upcoming" via comingSoon flag.
  const startsAt = '2025-09-30T00:00:00Z';
  const endsAt   = '2025-10-01T18:00:00Z';
  const total    = 5000;
  const sold     = 0;

  const comp = {
    slug: 'pi-to-the-moon',
    title: 'Pi To The Moon',
    entryFee: 0, // Free
    firstPrize: 3000,
    prizeBreakdown: {
      '1st Place': '3,000 ',
      '2nd–5th Places': '1,000',
      '6th–10th Places': '100',
    },
    winners: 'Multiple',
    totalTickets: total,
    ticketsSold: sold,
    maxTicketsPerUser: null,
    startsAt,
    endsAt,
    theme: 'pi',
    comingSoon: true, // <— force “Coming Soon”
    description: '',
  };

  const status = useMemo(() => {
    if (comp.comingSoon) return 'upcoming';
    const now = Date.now();
    const sTs = comp.startsAt ? new Date(comp.startsAt).getTime() : null;
    const eTs = comp.endsAt ? new Date(comp.endsAt).getTime() : null;
    if (sTs && now < sTs) return 'upcoming';
    if (eTs && now > eTs) return 'ended';
    return 'active';
  }, [comp.comingSoon, comp.startsAt, comp.endsAt]);

  const [sharedBonus, setSharedBonus] = useState(false);
  const slugKey = comp.slug;

  useEffect(() => {
    setSharedBonus(localStorage.getItem(`${slugKey}-shared`) === 'true');
  }, [slugKey]);

  const claimFreeTicket = () => {
    // Disabled by wrapper; keep for API parity.
    const key = `${slugKey}-claimed`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    const max = sharedBonus ? 2 : 1;
    if (current >= max) return;
    localStorage.setItem(key, String(current + 1));
  };

  const handleShare = () => {
    // Disabled by wrapper; keep for API parity.
    if (sharedBonus) return;
    localStorage.setItem(`${slugKey}-shared`, 'true');
    setSharedBonus(true);
  };

  const handlePaymentSuccess = async () => {
    // Disabled by wrapper; keep for API parity.
    return;
  };

  const description = `
Pi To The Moon — Community Grand Giveaway

Prize Pool: 7,500 π
• 1st Place: 3,000 π
• 2nd–5th Place: 1,000 π each
• 6th–10th Place: 100 π each

Entry Fee: Free
Total Tickets: ${total.toLocaleString()}
Location: Online Global Draw

How It Works:
1) Sign up for an Oh My Competitions account.
2) When the app launches, a free ticket is automatically credited.
3) Watch the live results in-app at draw time.
4) Winners claim prizes instantly to their Pi wallet.

Rules:
1) You must log in with Pi Network to receive the free ticket.
2) One account per person; attempts to create multiple accounts will void entries.
3) Winners are selected randomly using our verifiable draw system.
4) Prizes are paid within 48 hours to the winner’s Pi wallet.
5) No purchase necessary. Free entry only.
6) The prize pool is awarded as advertised.
7) By entering, you agree to our Terms & Conditions.
  `.trim();

  return (
    <>
      <Head>
        <title>Pi To The Moon | Oh My Competitions</title>
        <meta
          name="description"
          content="Pi To The Moon — a free global giveaway for Pioneers with a 7,500 π prize pool."
        />
      </Head>

      <main className="min-h-screen px-4 py-6 text-white bg-[#070d19] font-orbitron">
        <div className="max-w-xl mx-auto">
          {/* Coming Soon banner */}
          <div className="mb-4 text-center">
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-bold text-black
                         bg-gradient-to-r from-[#00ffd5] to-[#0077ff]"
              aria-live="polite"
            >
              Coming Soon
            </span>
          </div>

          {/* Disable all CTAs (links/buttons) inside this wrapper */}
          <div className="disable-cta" aria-disabled="true">
            <LaunchCompetitionDetailCard
              comp={comp}
              title={comp.title}
              prize={comp.firstPrize}
              fee={comp.entryFee}
              imageUrl={comp.imageUrl}
              endsAt={comp.endsAt}
              startsAt={comp.startsAt}
              ticketsSold={comp.ticketsSold}
              totalTickets={comp.totalTickets}
              status={status}
              description={description}
              handlePaymentSuccess={handlePaymentSuccess}
              claimFreeTicket={claimFreeTicket}
              handleShare={handleShare}
              sharedBonus={sharedBonus}
              /* Optional: if your card accepts these, it will show the disabled label */
              ctaDisabled
              ctaLabel="Coming Soon"
            />
          </div>

          {/* Hard-disable CTAs via CSS without touching the card implementation */}
          <style jsx>{`
            .disable-cta a,
            .disable-cta button {
              pointer-events: none !important;
              cursor: not-allowed !important;
              opacity: 0.6 !important;
              filter: grayscale(15%);
            }
          `}</style>
        </div>
      </main>
    </>
  );
}

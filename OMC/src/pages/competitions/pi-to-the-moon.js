// pages/competitions/pi-to-the-moon.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import LaunchCompetitionDetailCard from 'components/LaunchCompetitionDetailCard';

export default function PiToTheMoonPage() {
  // --- Competition data (normalized like your slug pages expect) ---
  const startsAt = '2025-09-30T00:00:00Z';        // future -> shows "Coming Soon"
  const endsAt   = '2025-10-01T18:00:00Z';
  const total    = 5000;
  const sold     = 0;

  const comp = {
    slug: 'pi-to-the-moon',
    title: 'Pi To The Moon',
    entryFee: 0,                       // Free
    firstPrize: 3000,                  // 1st place (from your breakdown)
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
    // imageUrl: '/images/pi-to-the-moon.jpg', // optional (card only shows images for tech/premium)
    description: '',                   // we’ll pass a full description below
  };

  // Status logic mirrors your slug page: upcoming if startsAt is in the future
  const status = useMemo(() => {
    const now = Date.now();
    const sTs = comp.startsAt ? new Date(comp.startsAt).getTime() : null;
    const eTs = comp.endsAt   ? new Date(comp.endsAt).getTime()   : null;
    if (sTs && now < sTs) return 'upcoming';
    if (eTs && now > eTs) return 'ended';
    return 'active';
  }, [comp.startsAt, comp.endsAt]);

  // Free ticket / share bonus UX hooks (reuses the same pattern as your slug page)
  const [sharedBonus, setSharedBonus] = useState(false);
  const slugKey = comp.slug;

  useEffect(() => {
    setSharedBonus(localStorage.getItem(`${slugKey}-shared`) === 'true');
  }, [slugKey]);

  const claimFreeTicket = () => {
    const key = `${slugKey}-claimed`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    const max = sharedBonus ? 2 : 1;
    if (current >= max) {
      alert('You have claimed the maximum free tickets.');
      return;
    }
    localStorage.setItem(key, String(current + 1));
    alert('✅ Free ticket claimed!');
  };

  const handleShare = () => {
    if (sharedBonus) {
      alert('You already received your bonus ticket.');
      return;
    }
    localStorage.setItem(`${slugKey}-shared`, 'true');
    setSharedBonus(true);
    alert('✅ Thanks for sharing! Bonus ticket unlocked.');
  };

  const handlePaymentSuccess = async () => {
    // Free comp: nothing special here, card expects handler; keep consistent API.
    alert('🎉 Entry confirmed!');
  };

  // Rich description + rules (what shows under “View Competition Details” in the card)
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

Good luck, Pioneer!
  `.trim();

  return (
    <>
      <Head>
        <title>Pi To The Moon | Oh My Competitions</title>
        <meta name="description" content="Pi To The Moon — a free global giveaway for Pioneers with a 7,500 π prize pool." />
      </Head>

      <main className="min-h-screen px-4 py-6 text-white bg-[#070d19] font-orbitron">
        <div className="max-w-xl mx-auto">
          <LaunchCompetitionDetailCard
            comp={comp}
            title={comp.title}
            prize={comp.firstPrize}
            fee={comp.entryFee}
            imageUrl={comp.imageUrl}           // optional, not shown unless theme is tech/premium
            endsAt={comp.endsAt}
            startsAt={comp.startsAt}
            ticketsSold={comp.ticketsSold}
            totalTickets={comp.totalTickets}
            status={status}

            description={description}
            handlePaymentSuccess={handlePaymentSuccess}

            /* free-ticket UX */
            claimFreeTicket={claimFreeTicket}
            handleShare={handleShare}
            sharedBonus={sharedBonus}
          />

  
        </div>
      </main>
    </>
  );
}

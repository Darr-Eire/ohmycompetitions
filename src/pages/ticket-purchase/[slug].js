'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import BuyTicketButton from '@components/BuyTicketButton';
import { loadPiSdk } from 'lib/pi';
import { techItems, premiumItems, piItems, dailyItems, freeItems, cryptoGiveawaysItems } from '../../data/competitions';

// Flatten all competitions
const flattenCompetitions = [
  ...techItems, ...premiumItems, ...piItems, ...dailyItems, ...freeItems, ...cryptoGiveawaysItems,
];

const COMPETITIONS = {};
flattenCompetitions.forEach(item => {
  COMPETITIONS[item.comp.slug] = {
    ...item.comp,
    title: item.title,
    prize: item.prize,
    imageUrl: item.imageUrl,
    location: item.location || 'Online',
    date: item.date || 'N/A',
    time: item.time || 'N/A',
  };
});

const FREE_TICKET_COMPETITIONS = ['pi-to-the-moon'];

export default function TicketPurchasePage() {
  const router = useRouter();
  const { slug } = router.query;
  const comp = COMPETITIONS[slug];

  const [sdkReady, setSdkReady] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sharedBonus, setSharedBonus] = useState(false);

  // Load Pi SDK
  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  // Load claimed/bonus status for free competitions
  useEffect(() => {
    if (!slug || !FREE_TICKET_COMPETITIONS.includes(slug)) return;
    const saved = parseInt(localStorage.getItem(`${slug}-claimed`) || 0);
    setQuantity(saved || 1);
    setSharedBonus(localStorage.getItem(`${slug}-shared`) === 'true');
  }, [slug]);

  const claimFreeTicket = () => {
    const maxTickets = sharedBonus ? 2 : 1;
    if (quantity >= maxTickets) {
      alert('You have claimed the maximum tickets.');
      return;
    }
    const updated = quantity + 1;
    setQuantity(updated);
    localStorage.setItem(`${slug}-claimed`, updated);
  };

  const handleShare = () => {
    if (sharedBonus) {
      alert('You already received your bonus ticket.');
      return;
    }
    setSharedBonus(true);
    localStorage.setItem(`${slug}-shared`, 'true');
    claimFreeTicket();
  };

  if (!router.isReady) return null;

  if (!comp) {
    return (
      <div className="p-6 text-center text-white bg-[#0b1120] min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Competition Not Found</h1>
        <p className="mt-4">We couldn’t find “{slug}”.</p>
        <Link href="/" className="mt-6 inline-block text-blue-400 underline font-semibold">← Back to Home</Link>
      </div>
    );
  }

  const isFree = FREE_TICKET_COMPETITIONS.includes(slug);
  const totalPrice = comp.entryFee * quantity;

  return (
    <div className="bg-[#0b1120] min-h-screen text-white py-6 px-4">
      <div className="max-w-xl mx-auto border border-blue-500 rounded-xl shadow-xl bg-[#0b1120]">
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-black uppercase">{comp.title}</h1>
        </div>

        <div className="p-6 space-y-6 text-center">
          {comp.imageUrl && (
            <img src={comp.imageUrl} alt={comp.title}
              className="w-full max-h-64 object-cover rounded-lg border border-blue-500 mx-auto" />
          )}
          <p className="text-white text-2xl font-bold">{comp.prize}</p>

          <div className="max-w-md mx-auto text-sm text-white space-y-2">
            <div className="flex justify-between"><span className="font-semibold">Date</span>
              <span>{new Date(comp.endsAt).toLocaleDateString('en-GB')}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Start Time</span>
              <span>{new Date(comp.endsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC</span></div>
            <div className="flex justify-between"><span className="font-semibold">Location</span><span>{comp.location}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Entry Fee</span><span>{comp.entryFee.toFixed(2)} π</span></div>
            <div className="flex justify-between"><span className="font-semibold">Tickets Sold</span><span>{comp.ticketsSold} / {comp.totalTickets}</span></div>
          </div>

          {isFree ? (
            <>
              <p className="text-cyan-300 font-semibold text-lg">Free Ticket Claimed: {quantity}/2</p>
              <button onClick={claimFreeTicket} disabled={quantity >= (sharedBonus ? 2 : 1)}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl mb-3">
                Claim Free Ticket
              </button>

              {!sharedBonus && (
                <button onClick={handleShare}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-4 rounded-xl">
                  Share for Bonus Ticket
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-center gap-4">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="bg-blue-500 px-4 py-1 rounded-full disabled:opacity-50" disabled={quantity <= 1}>−</button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="bg-blue-500 px-4 py-1 rounded-full">+</button>
              </div>

              <p className="text-lg font-bold mt-6">Total {totalPrice.toFixed(2)} π</p>
              <p className="text-white text-sm mt-2">Secure your entry to win <strong>{comp.prize}</strong>.</p>

              {sdkReady ? (
  <BuyTicketButton competitionSlug={slug} entryFee={comp.entryFee} quantity={quantity} />
) : (
  <p className="text-red-500 mt-2">⚠️ Pi SDK not ready yet. Please wait…</p>
)}
            </>
          )}

          <p className="text-xs mt-2 text-gray-400">
            <Link href="/terms" className="underline hover:text-cyan-400" target="_blank" rel="noopener noreferrer">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

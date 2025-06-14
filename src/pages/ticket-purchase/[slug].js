'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BuyTicketButton from '@components/BuyTicketButton';
import { usePiAuth } from '../../context/PiAuthContext';
import {
  techItems,
  premiumItems,
  piItems,
  dailyItems,
  freeItems,
  cryptoGiveawaysItems,
} from '../../data/competitions';

const flattenCompetitions = [
  ...techItems,
  ...premiumItems,
  ...piItems,
  ...dailyItems,
  ...freeItems,
  ...cryptoGiveawaysItems,
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
  const { user, login } = usePiAuth();

  const comp = typeof slug === 'string' ? COMPETITIONS[slug] : null;
  const isFree = FREE_TICKET_COMPETITIONS.includes(slug);

  const [quantity, setQuantity] = useState(1);
  const [sharedBonus, setSharedBonus] = useState(false);

  useEffect(() => {
    if (!slug || !isFree) return;
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
      <div className="p-6 text-center text-white bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Competition Not Found</h1>
        <p className="mt-4">We couldn’t find “{slug}”.</p>
        <Link href="/" className="mt-6 inline-block text-blue-400 underline font-semibold">Back to Home</Link>
      </div>
    );
  }

  const totalPrice = (comp?.entryFee || 0) * quantity;

  return (
    <main className="min-h-screen px-4 py-10 text-white bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] font-orbitron">
      <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-lg border border-cyan-400 rounded-2xl shadow-[0_0_60px_#00ffd577] p-6">
        
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-center rounded-xl mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-black uppercase">{comp.title}</h1>
        </div>

        <div className="space-y-6 text-center">
          {comp.imageUrl && (
            <Image
              src={comp.imageUrl}
              alt={comp.title}
              width={600}
              height={300}
              className="w-full max-h-64 object-cover rounded-lg border border-blue-500 mx-auto"
            />
          )}

          <p className="text-white text-2xl font-bold">{comp.prize}</p>

          <div className="max-w-md mx-auto text-sm text-white space-y-2">
            <div className="flex justify-between"><span className="font-semibold">Date</span><span>{new Date(comp.endsAt).toLocaleDateString('en-GB')}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Start Time</span><span>{new Date(comp.endsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC</span></div>
            <div className="flex justify-between"><span className="font-semibold">Location</span><span>{comp.location}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Entry Fee</span><span>{comp.entryFee.toFixed(2)} π</span></div>
            <div className="flex justify-between"><span className="font-semibold">Tickets Sold</span><span>{comp.ticketsSold} / {comp.totalTickets}</span></div>
          </div>

          {isFree ? (
            <>
              <p className="text-cyan-300 font-semibold text-lg">Free Ticket Claimed: {quantity}/2</p>
              <button
                onClick={claimFreeTicket}
                disabled={quantity >= (sharedBonus ? 2 : 1)}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl mb-3"
              >
                Claim Free Ticket
              </button>
              {!sharedBonus && (
                <button
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-4 rounded-xl"
                >
                  Share for Bonus Ticket
                </button>
              )}
            </>
          ) : (
            <>
              {!user && (
                <div className="text-sm bg-red-600 p-3 rounded-lg font-semibold">
                  Please <button onClick={login} className="underline text-cyan-200">log in</button> with Pi to buy tickets.
                </div>
              )}

              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="bg-blue-500 px-4 py-1 rounded-full disabled:opacity-50"
                  disabled={quantity <= 1}
                >−</button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="bg-blue-500 px-4 py-1 rounded-full"
                >+</button>
              </div>

              <p className="text-lg font-bold mt-6">Total {totalPrice.toFixed(2)} π</p>
              <p className="text-white text-sm mt-2">Secure your entry to win <strong>{comp.prize}</strong>.</p>

              <BuyTicketButton
                competitionSlug={slug}
                entryFee={comp.entryFee}
                quantity={quantity}
                piUser={user}
              />
            </>
          )}

          <p className="text-xs mt-2 text-gray-400">
            <Link href="/terms" className="underline hover:text-cyan-400" target="_blank" rel="noopener noreferrer">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

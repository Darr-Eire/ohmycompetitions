'use client';

import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
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

import ps5BundleDetails from '../../data/descriptions/ps5-bundle-giveaway';
import tvDescription from '../../data/descriptions/55-inch-tv-giveaway';
import xboxDescription from '../../data/descriptions/xbox-one-bundle';
import raybanDescription from '../../data/descriptions/ray-ban';
import switchDescription from '../../data/descriptions/nintendo-switch';
import everydayPioneerDescription from '../../data/descriptions/everyday-pioneer';
import dailyPiSliceDescription from '../../data/descriptions/daily-pi-slice';
import dailyJackpotDescription from '../../data/descriptions/daily-jackpot';

const flattenCompetitions = [
  ...techItems,
  ...premiumItems,
  ...piItems,
  ...dailyItems,
  ...freeItems,
  ...cryptoGiveawaysItems,
];

const COMPETITIONS = {};
flattenCompetitions.forEach((item) => {
  COMPETITIONS[item.comp.slug] = {
    ...item.comp,
    title: item.title,
    prize: item.prize,
    imageUrl: item.imageUrl,
    thumbnails: item.thumbnails || [],
    location: item.location || 'Online',
    date: item.date || 'N/A',
    time: item.time || 'N/A',
    entryFee: Number(item.entryFee) || 0,
    ticketsSold: item.ticketsSold || 0,
    endsAt: item.endsAt || new Date().toISOString(),
  };
});

const FREE_TICKET_COMPETITIONS = ['pi-to-the-moon'];

export default function TicketPurchasePage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user, login } = usePiAuth();

  const comp = typeof slug === 'string' ? COMPETITIONS[slug] : null;
  const isFree = FREE_TICKET_COMPETITIONS.includes(slug);
  const isDaily = dailyItems.some((item) => item.comp.slug === slug);

  const [quantity, setQuantity] = useState(1);
  const [sharedBonus, setSharedBonus] = useState(false);
  const [skillAnswer, setSkillAnswer] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [showSkillQuestion, setShowSkillQuestion] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (comp?.imageUrl) setMainImage(comp.imageUrl);
  }, [comp]);

  useEffect(() => {
    if (!slug || !isFree) return;
    const saved = parseInt(localStorage.getItem(`${slug}-claimed`) || '0');
    setQuantity(saved || 1);
    setSharedBonus(localStorage.getItem(`${slug}-shared`) === 'true');
  }, [slug, isFree]);

  const claimFreeTicket = () => {
    const maxTickets = sharedBonus ? 2 : 1;
    if (quantity >= maxTickets) {
      alert('You have claimed the maximum tickets.');
      return;
    }
    const updated = quantity + 1;
    setQuantity(updated);
    localStorage.setItem(`${slug}-claimed`, updated.toString());
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
        <Link
          href="/"
          className="mt-6 inline-block text-cyan-300 underline font-semibold"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Use useMemo for stable and efficient calculation
  const totalPrice = useMemo(() => {
    const fee = Number(comp.entryFee) || 0;
    return fee * quantity;
  }, [comp.entryFee, quantity]);

  const miniImages = comp.thumbnails.length
    ? comp.thumbnails.slice(0, 3)
    : ['/images/playstation1.jpeg', '/images/playstation2.jpeg', '/images/playstation3.jpeg'];

  return (
    <main className="min-h-screen px-4 py-10 text-white bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] font-orbitron">
      <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-lg border border-cyan-400 rounded-2xl shadow-[0_0_60px_#00ffd577] p-6">
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-center rounded-xl mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-black uppercase">{comp.title}</h1>
        </div>

        <div className="space-y-6 text-center">
          {/* Only render images if NOT a daily competition */}
          {!isDaily && mainImage && (
            <>
              <Image
                src={mainImage}
                alt={comp.title}
                width={600}
                height={300}
                className="w-fit max-h-64 object-cover rounded-lg border border-blue-500 mx-auto"
              />
              <div className="flex justify-center gap-4 mt-2">
                {miniImages.map((img, i) => (
                  <Image
                    key={i}
                    src={img}
                    alt={`Thumb ${i + 1}`}
                    width={150}
                    height={90}
                    className="rounded-lg border border-cyan-400"
                  />
                ))}
              </div>
            </>
          )}

          <p className="text-white text-2xl font-bold">{comp.prize}</p>

          <div className="max-w-md mx-auto text-sm text-white space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Date</span>
              <span>{new Date(comp.endsAt).toLocaleDateString('en-GB')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Start Time</span>
              <span>
                {new Date(comp.endsAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                UTC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Location</span>
              <span>{comp.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Entry Fee</span>
              <span>{comp.entryFee.toFixed(2)} π</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Tickets Sold</span>
              <span>{comp.ticketsSold}</span>
            </div>

            <button
              onClick={() => setShowDetails((prev) => !prev)}
              className="w-fit mt-4 text-center px-3 py-2 bg-[#1e293b] rounded-md font-semibold hover:bg-cyan-600 transition"
            >
              {showDetails ? 'Hide Competition Details ▲' : 'Competition Details ▼'}
            </button>

          {showDetails && (
  <div className="mt-3 p-3 bg-white/10 rounded-md border border-cyan-400 whitespace-pre-wrap text-white text-sm leading-relaxed">
    {slug === 'ps5-bundle-giveaway' ? (
      <>
        <h2 className="text-center font-bold text-white text-lg mb-2">
          PlayStation 5 Console
        </h2>
        <pre className="whitespace-pre-wrap text-white text-sm leading-relaxed">
          {ps5BundleDetails.description}
        </pre>
        <div className="mt-4 bg-white/20 p-3 rounded border border-cyan-400 text-center font-semibold text-cyan-300">
          <p>- Starts: 26th July 2025</p>
          <p>- Ends: 2nd August 2025</p>
          <p>- Entry Fee: 0.40 π per ticket</p>
          <p>- Total Tickets: 1100</p>
          <p className="mt-2">Join now for your chance to win!</p>
        </div>
      </>
    ) : slug === '55-inch-tv-giveaway' ? (
      <>
        <h2 className="text-center font-bold text-white text-lg mb-2">
          55″ Smart TV
        </h2>
        <pre className="whitespace-pre-wrap text-white text-sm leading-relaxed">
          {tvDescription}
        </pre>
      </>
    ) : slug === 'xbox-one-bundle' ? (
      <>
        <h2 className="text-center font-bold text-white text-lg mb-2">
          Xbox One Bundle
        </h2>
        <pre className="whitespace-pre-wrap text-white text-sm leading-relaxed">
          {xboxDescription}
        </pre>
      </>
    ) : slug === 'ray-ban' ? (
      <>
        <h2 className="text-center font-bold text-white text-lg mb-2">
          Ray-Ban Meta Smart Glasses
        </h2>
        <pre className="whitespace-pre-wrap text-white text-sm leading-relaxed">
          {raybanDescription}
        </pre>
      </>
    ) : slug === 'nintendo-switch' ? (
      <>
        <h2 className="text-center font-bold text-white text-lg mb-2">
          Nintendo Switch 2
        </h2>
        <pre className="whitespace-pre-wrap text-white text-sm leading-relaxed">
          {switchDescription}
        </pre>
      </>
    ) : slug === 'daily-pi-slice' ? (
      <>
        <h2 className="text-center font-bold text-white text-lg mb-2">
          Daily Pi Slice
        </h2>
        <p className="mb-2 text-center font-semibold text-cyan-300">Prize: 500 π</p>
        <p><strong>Date:</strong> 21/06/2025</p>
        <p><strong>Start Time:</strong> 18:18 UTC</p>
        <p><strong>Location:</strong> Online</p>
        <p><strong>Entry Fee:</strong> 0.00 π</p>
        <p><strong>Tickets Sold:</strong> 0</p>
        <p className="mt-3">
          Our daily competition with a prize of 500 π!  
          Every day a winner is chosen. Participate daily and increase your chances of winning!
        </p>
      </>
    ) : slug === 'daily-jackpot' ? (
      <>
        <h2 className="text-center font-bold text-white text-lg mb-2">
          Daily Jackpot
        </h2>
        <p className="mb-2 text-center font-semibold text-cyan-300">Prize: 750 π</p>
        <p><strong>Date:</strong> 21/06/2025</p>
        <p><strong>Start Time:</strong> 18:18 UTC</p>
        <p><strong>Location:</strong> Online</p>
        <p><strong>Entry Fee:</strong> 0.00 π</p>
        <p><strong>Tickets Sold:</strong> 0</p>
        <p className="mt-3">
          Enter the Daily Jackpot to win 750 π. A winner is selected every day at 18:18 UTC.  
          Join in and secure your chance to win this daily prize!
        </p>
      </>
    ) : slug === 'everyday-pioneer' ? (
      <>
        <h2 className="text-center font-bold text-white text-lg mb-2">
          Everyday Pioneer
        </h2>
        <p className="mb-2 text-center font-semibold text-cyan-300">Prize: 600 π</p>
        <p><strong>Date:</strong> 21/06/2025</p>
        <p><strong>Start Time:</strong> 18:18 UTC</p>
        <p><strong>Location:</strong> Online</p>
        <p><strong>Entry Fee:</strong> 0.00 π (Free Entry)</p>
        <p><strong>Tickets Sold:</strong> 0</p>
        <p className="mt-3">
          Free daily competition with a prize of 600 π.  
          A winner is chosen every day.  
          Participate every day for your chance to become the next Pioneer winner!
        </p>
      </>
    ) : (
      <p>{comp.description}</p>
    )}
  </div>
)}

          </div>

          {isFree ? (
            <>
              <p className="text-cyan-300 font-semibold text-lg">
                Free Ticket Claimed: {quantity}/2
              </p>
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
                  Please{' '}
                  <button onClick={login} className="underline text-cyan-200">
                    log in
                  </button>{' '}
                  with Pi to buy tickets.
                </div>
              )}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="bg-blue-500 px-4 py-1 rounded-full disabled:opacity-50"
                >
                  −
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="bg-blue-500 px-4 py-1 rounded-full"
                >
                  +
                </button>
              </div>
              <p className="text-lg font-bold mt-6">
                Total {totalPrice.toFixed(2)} π
              </p>
              <p className="text-white text-sm mt-2">
                Secure your entry to win <strong>{comp.prize}</strong>.
              </p>

          {!showSkillQuestion ? (
  <button
    onClick={() => setShowSkillQuestion(true)}
    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl mt-6"
  >
    Proceed to Payment
  </button>
) : (
  <div className="mt-6 max-w-md mx-auto text-center">
    <label
      htmlFor="skill-question"
      className="block font-semibold mb-1 text-white"
    >
      Skill Question (Required to Enter):
    </label>
    <p className="mb-2">What is 3 + 4?</p>
    <input
      id="skill-question"
      type="text"
      className="w-full px-4 py-2 rounded-lg bg-[#0f172a]/60 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 mx-auto"
      value={skillAnswer}
      onChange={(e) => setSkillAnswer(e.target.value)}
      placeholder="Enter your answer"
      style={{ maxWidth: '300px' }}
    />
    {skillAnswer.trim() !== '7' && skillAnswer !== '' && (
      <p className="text-sm text-red-400 mt-1">
        You must answer correctly to proceed.
      </p>
    )}

    <BuyTicketButton
      competitionSlug={slug}
      entryFee={comp.entryFee}
      quantity={quantity}
      piUser={user}
      disabled={skillAnswer.trim() !== '7'}
      className="mt-4 w-full"
    />
  </div>
)}

            </>
          )}

          <div className="mt-6 text-xs text-white flex flex-col items-center space-y-2">
        
            <Link
              href="/terms-conditions"
              className="underline hover:text-cyan-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import BuyTicketButton from '@/components/BuyTicketButton';

const COMPETITIONS = {
  'ps5-bundle-giveaway': {
    title: 'PS5 Bundle Giveaway',
    prize: 'PlayStation 5 + Extra Controller',
    entryFee: 0.8,
    imageUrl: '/images/playstation.jpeg',
    date: 'June 14, 2025',
    time: '3:14 PM UTC',
    location: 'Online',
    endsAt: '2025-06-14T15:14:00Z',
  },
  '55-inch-tv-giveaway': {
    title: '55″ Smart TV Giveaway',
    prize: '55″ Ultra HD Smart TV',
    entryFee: 0.25,
    imageUrl: '/images/tv.jpg',
    date: 'May 8, 2025',
    time: '11:30 AM UTC',
    location: 'Online',
    endsAt: '2025-05-08T11:30:00Z',
  },
  'xbox-one-bundle': {
    title: 'Xbox One Bundle',
    prize: 'Xbox One + 3 Months Game Pass',
    entryFee: 0.3,
    imageUrl: '/images/xbox.jpeg',
    date: 'May 9, 2025',
    time: '5:45 PM UTC',
    location: 'Online',
    endsAt: '2025-05-09T17:45:00Z',
  },
  'electric-bike': {
    title: 'Electric Bike Giveaway',
    prize: 'High-Speed Electric Bike',
    entryFee: 0.25,
    imageUrl: '/images/bike.jpeg',
    date: 'May 8, 2025',
    time: '11:30 AM UTC',
    location: 'Online',
    endsAt: '2025-05-08T11:30:00Z',
  },
  'matchday-tickets': {
    title: 'Matchday Tickets',
    prize: 'x2 Tickets to Liverpool Vs Crystal Palace',
    entryFee: 0.25,
    imageUrl: '/images/liverpool.jpeg',
    date: 'July 20, 2025',
    time: '1:30 PM UTC',
    location: 'Anfield Stadium, Liverpool',
    endsAt: '2025-07-20T13:30:00Z',
  },
  'dubai-luxury-holiday': {
    title: 'Dubai Luxury Holiday',
    prize: '7-Day All-Inclusive Dubai Trip',
    entryFee: 20,
    imageUrl: '/images/dubai-luxury-holiday.jpg',
    date: 'May 18, 2025',
    time: '10:00 PM UTC',
    location: 'Online',
    endsAt: '2025-05-18T22:00:00Z',
  },
  'penthouse-stay': {
    title: 'Penthouse Stay',
    prize: 'Luxury Penthouse Hotel Stay',
    entryFee: 15,
    imageUrl: '/images/hotel.jpeg',
    date: 'May 15, 2025',
    time: '9:00 PM UTC',
    location: 'Online',
    endsAt: '2025-05-15T21:00:00Z',
  },
  'first-class-flight': {
    title: 'First Class Flight',
    prize: 'Return First Class Flights Worldwide',
    entryFee: 15,
    imageUrl: '/images/first.jpeg',
    date: 'May 15, 2025',
    time: '9:00 PM UTC',
    location: 'Online',
    endsAt: '2025-05-15T21:00:00Z',
  },
  'pi-giveaway-100k': {
    title: '100,000 Pi Giveaway',
    prize: '100,000 π Tokens',
    entryFee: 10,
    imageUrl: '/images/100000.png',
    date: 'May 20, 2025',
    time: '12:00 AM UTC',
    location: 'Online',
    endsAt: '2025-05-20T00:00:00Z',
  },
  'pi-giveaway-50k': {
    title: '50,000 Pi Giveaway',
    prize: '50,000 π Tokens',
    entryFee: 5,
    imageUrl: '/images/50000.png',
    date: 'May 11, 2025',
    time: '12:00 AM UTC',
    location: 'Online',
    endsAt: '2025-05-11T00:00:00Z',
  },
  'pi-giveaway-25k': {
    title: '25,000 Pi Giveaway',
    prize: '25,000 π Tokens',
    entryFee: 2,
    imageUrl: '/images/25000.png',
    date: 'May 11, 2025',
    time: '12:00 AM UTC',
    location: 'Online',
    endsAt: '2025-05-11T00:00:00Z',
  },
  'daily-jackpot': {
    title: 'Daily Jackpot',
    prize: '750 π Tokens',
    entryFee: 0.375,
    imageUrl: '/images/jackpot.png',
    date: 'May 3, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-05-03T23:59:59Z',
  },
  'everyday-pioneer': {
    title: 'Everyday Pioneer',
    prize: '1,000 π Tokens',
    entryFee: 0.314,
    imageUrl: '/images/everyday.png',
    date: 'May 3, 2025',
    time: '3:14 PM UTC',
    location: 'Online',
    endsAt: '2025-05-03T15:14:00Z',
  },
  'daily-pi-slice': {
    title: 'Daily Pi Slice',
    prize: '1,000 π Tokens',
    entryFee: 0.314,
    imageUrl: '/images/daily.png',
    date: 'May 3, 2025',
    time: '3:14 PM UTC',
    location: 'Online',
    endsAt: '2025-05-03T15:14:00Z',
  },
  'pi-to-the-mon': {
    title: 'Pi To The Moon',
    prize: '10,000 π Tokens',
    entryFee: 0,
    imageUrl: '',
    date: 'May 10, 2025',
    time: '6:00 PM UTC',
    location: 'Online',
    endsAt: '2025-05-10T18:00:00Z',
  },
  'crypto-btc': {
    title: 'Win BTC',
    prize: '0.01 BTC',
    entryFee: 0,
    imageUrl: '',
    date: 'June 2, 2025',
    time: '12:59 AM UTC',
    location: 'Online',
    endsAt: '2025-06-02T00:59:00Z',
  },
  'crypto-eth': {
    title: 'Win ETH',
    prize: '0.5 ETH',
    entryFee: 0,
    imageUrl: '',
    date: 'June 3, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-06-03T23:59:00Z',
  },
  'crypto-xrp': {
    title: 'Win XRP',
    prize: '1000 XRP',
    entryFee: 0,
    imageUrl: '',
    date: 'June 9, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-06-09T23:59:00Z',
  },
  'crypto-sol': {
    title: 'Win SOL',
    prize: '10 SOL',
    entryFee: 0,
    imageUrl: '',
    date: 'June 5, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-06-05T23:59:00Z',
  },
  'crypto-bnb': {
    title: 'Win BNB',
    prize: '2 BNB',
    entryFee: 0,
    imageUrl: '',
    date: 'June 7, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-06-07T23:59:00Z',
  },
  'crypto-doge': {
    title: 'Win DOGE',
    prize: '10,000 DOGE',
    entryFee: 0,
    imageUrl: '',
    date: 'June 11, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-06-11T23:59:00Z',
  },
  'main-prize': {
    title: 'Main Prize €250,000',
    prize: '€250,000 in Pi (One Winner)',
    entryFee: 15,
    imageUrl: '/images/250000.png',
    date: 'May 28, 2025',
    time: '10:00 PM UTC',
    location: 'Global Online Draw',
    endsAt: '2025-05-28T22:00:00Z',
  },
};


export default function TicketPurchasePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [piUser, setPiUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    if (!window.Pi?.getCurrentPioneer) {
      setLoadingUser(false);
      return;
    }
    window.Pi.getCurrentPioneer()
      .then(user => {
        if (user) setPiUser(user);
      })
      .catch(console.error)
      .finally(() => setLoadingUser(false));
  }, [router.isReady]);

  useEffect(() => {
    if (!COMPETITIONS[slug]?.endsAt) return;

    const interval = setInterval(() => {
      const end = new Date(COMPETITIONS[slug].endsAt).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        clearInterval(interval);
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [slug]);

  const handlePiLogin = async () => {
    setLoadingLogin(true);
    try {
      const { user } = await window.Pi.authenticate(['username', 'payments']);
      setPiUser(user);
    } catch (err) {
      alert(`Login failed: ${err.message || err}`);
    } finally {
      setLoadingLogin(false);
    }
  };

  if (!router.isReady) return null;
  const comp = COMPETITIONS[slug];
  if (!comp) {
    return (
      <div className="p-6 text-center text-white bg-[#0b1120] min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Competition Not Found</h1>
        <p className="mt-4">We couldn’t find “{slug}”.</p>
        <Link href="/" className="mt-6 inline-block text-blue-400 underline font-semibold">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const currentPrice = comp.entryFee - discount;
  const totalPrice = currentPrice * quantity;

  return (
    <div className="bg-[#0b1120] min-h-screen text-white py-6 px-4">
      <div className="max-w-xl mx-auto border border-blue-500 rounded-xl shadow-xl overflow-hidden bg-[#0b1120]">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-black uppercase">{comp.title}</h1>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-center">
          {/* Image */}
          {comp.imageUrl && (
            <img
              src={comp.imageUrl}
              alt={comp.title}
              className="w-full max-h-64 object-cover rounded-lg border border-blue-500 mx-auto"
            />
          )}

          {/* Prize Info */}
          <p className="text-gray-300"><strong>Prize:</strong> {comp.prize}</p>

          {/* Countdown */}
          {timeLeft && (
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 rounded-lg inline-block mx-auto">
              <p className="text-sm text-black font-mono font-bold">
                ⏳ Ends In: <span>{timeLeft}</span>
              </p>
            </div>
          )}

          {/* Event Info */}
          <div className="space-y-1 text-sm">
            <p><strong>Date:</strong> {comp.date}</p>
            <p><strong>Time:</strong> {comp.time}</p>
            <p><strong>Location:</strong> {comp.location}</p>
          </div>

          {/* Ticket Info */}
          <div className="space-y-1 text-sm">
            <p>Entry Fee: <strong>{comp.entryFee} π</strong></p>
            {discount > 0 && (
              <p className="text-green-400">Discount: <strong>-{discount} π</strong></p>
            )}
            <p className="font-semibold">Price per ticket: {currentPrice.toFixed(2)} π</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="bg-blue-500 text-white px-4 py-1 rounded-full font-bold disabled:opacity-50"
                disabled={quantity <= 1}
              >−</button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="bg-blue-500 text-white px-4 py-1 rounded-full font-bold"
              >+</button>
            </div>
          </div>

          {/* Total */}
          <div>
            <p className="text-lg font-bold">Total: {totalPrice.toFixed(2)} π</p>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm">
            Secure your entry to win <strong>{comp.prize}</strong> — don’t miss out!
          </p>

          {/* Action Button */}
          {loadingUser ? (
            <p className="text-center text-gray-400">Checking session…</p>
          ) : !piUser ? (
            <button
              onClick={handlePiLogin}
              disabled={loadingLogin}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold py-3 px-4 rounded-xl shadow-lg"
            >
              {loadingLogin ? 'Logging in…' : 'Log in with Pi to continue'}
            </button>
          ) : (
            <BuyTicketButton
              competitionSlug={slug}
              entryFee={currentPrice}
              quantity={quantity}
            />
          )}
        </div>
      </div>
    </div>
  );
}

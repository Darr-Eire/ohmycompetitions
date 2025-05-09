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
  prize: '55″ 4K UHD Smart TV',
  entryFee: 0.25,
  imageUrl: '/images/tv.jpg',
  date: 'May 8, 2025',
  time: '11:30 AM UTC',
  location: 'Online',
  endsAt: '2025-05-08T11:30:00Z',
},
'xbox-one-bundle': {
  title: 'Xbox One + Game Pass',
  prize: 'Xbox One Console + Game Pass',
  entryFee: 0.3,
  imageUrl: '/images/xbox.jpeg',
  date: 'May 9, 2025',
  time: '5:45 PM UTC',
  location: 'Online',
  endsAt: '2025-05-09T17:45:00Z',
},
'rare-pokemon-card': {
  title: 'Rare Pokémon Card',
  prize: 'Charizard Pokémon Card',
  entryFee: 0.25,
  imageUrl: '/images/pokemon.jpeg',
  date: 'May 8, 2025',
  time: '11:30 AM UTC',
  location: 'Online',
  endsAt: '2025-05-08T11:30:00Z',
},
'electric-bike': {
  title: 'Electric Bike Giveaway',
  prize: 'High-Performance Electric Bike',
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
'pi-giveaway-100k': {
  title: '100,000 Pi Giveaway',
  prize: '100,000 π',
  entryFee: 10,
  imageUrl: '/images/100000.png',
  date: 'May 20, 2025',
  time: '12:00 AM UTC',
  location: 'Online',
  endsAt: '2025-05-20T00:00:00Z',
},
'pi-giveaway-50k': {
  title: '50,000 Pi Giveaway',
  prize: '50,000 π',
  entryFee: 5,
  imageUrl: '/images/50000.png',
  date: 'May 11, 2025',
  time: '12:00 AM UTC',
  location: 'Online',
  endsAt: '2025-05-11T00:00:00Z',
},
'pi-giveaway-25k': {
  title: '25,000 Pi Giveaway',
  prize: '25,000 π',
  entryFee: 2,
  imageUrl: '/images/25000.png',
  date: 'May 11, 2025',
  time: '12:00 AM UTC',
  location: 'Online',
  endsAt: '2025-05-11T00:00:00Z',
},
'main-prize-250k-euro': {
  title: 'Main Prize €250,000',
  prize: '€250,000 in Pi (One Winner)',
  entryFee: 15,
  imageUrl: '/images/main.png',
  date: 'May 28, 2025',
  time: '10:00 PM UTC',
  location: 'Global Online Draw',
  endsAt: '2025-05-28T22:00:00Z',
},
'dubai-luxury-holiday': {
  title: 'Dubai Luxury Holiday',
  prize: '7-Day Dubai Trip',
  entryFee: 20,
  imageUrl: '/images/dubai-luxury-holiday.jpg',
  date: 'May 18, 2025',
  time: '10:00 PM UTC',
  location: 'Dubai, UAE',
  endsAt: '2025-05-18T22:00:00Z',
},
'penthouse-stay': {
  title: 'Penthouse Stay',
  prize: 'Penthouse Hotel Stay of your choice',
  entryFee: 15,
  imageUrl: '/images/hotel.jpeg',
  date: 'May 15, 2025',
  time: '9:00 PM UTC',
  location: 'Any City Worldwide',
  endsAt: '2025-05-15T21:00:00Z',
},
'first-class-flight': {
  title: 'First Class Flight',
  prize: 'Return Flights Anywhere in the World',
  entryFee: 15,
  imageUrl: '/images/first.jpeg',
  date: 'May 15, 2025',
  time: '9:00 PM UTC',
  location: 'Departing Airport of Choice',
  endsAt: '2025-05-15T21:00:00Z',
},
'daily-jackpot': {
  title: 'Daily Jackpot',
  prize: '750 π',
  entryFee: 0.375,
  imageUrl: '/images/jackpot.png',
  date: 'May 3, 2025',
  time: '11:59 PM UTC',
  location: 'Online',
  endsAt: '2025-05-03T23:59:59Z',
},
'everyday-pioneer': {
  title: 'Everyday Pioneer',
  prize: '1,000 π',
  entryFee: 0.314,
  imageUrl: '/images/everyday.png',
  date: 'May 3, 2025',
  time: '3:14 PM UTC',
  location: 'Online',
  endsAt: '2025-05-03T15:14:00Z',
},
'daily-pi-slice': {
  title: 'Daily Pi Slice',
  prize: '1,000 π',
  entryFee: 0.314,
  imageUrl: '/images/daily.png',
  date: 'May 3, 2025',
  time: '3:14 PM UTC',
  location: 'Online',
  endsAt: '2025-05-03T15:14:00Z',
},
'pi-day-freebie': {
  title: 'Pi‑Day Freebie',
  prize: 'Special Badge',
  entryFee: 0,
  imageUrl: '/images/freebie.png',
  date: 'May 6, 2025',
  time: '8:00 PM UTC',
  location: 'Online',
  endsAt: '2025-05-06T20:00:00Z',
},
'everyone-wins': {
  title: 'Everyone Wins',
  prize: '9,999 / 5,555 / 1,111 π',
  entryFee: 0,
  imageUrl: '/images/winner2.png',
  date: 'May 10, 2025',
  time: '6:00 PM UTC',
  location: 'Online',
  endsAt: '2025-05-10T18:00:00Z',
},
'weekly-giveaway': {
  title: 'Weekly Giveaway',
  prize: '1,000 π',
  entryFee: 0,
  imageUrl: '/images/weekly.png',
  date: 'May 5, 2025',
  time: '11:59 PM UTC',
  location: 'Online',
  endsAt: '2025-05-05T23:59:59Z',
},
  'main-prize': {
  title: 'Main Prize €250,000',
  prize: '€250,000 in Pi (One Winner)',
  entryFee: 15,
  imageUrl: '/images/main.png',
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
     <img
  src={comp.imageUrl}
  alt={comp.title}
  className="w-full max-h-86 object-cover rounded-lg border border-blue-500 mx-auto"
/>

          

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

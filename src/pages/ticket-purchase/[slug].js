'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import BuyTicketButton from '@components/BuyTicketButton';


const COMPETITIONS = {
  
  'ps5-bundle-giveaway': {
    title: 'PS5 Bundle Giveaway',
    prize: 'PlayStation 5 + Extra Controller',
    entryFee: 0.25,
    imageUrl: '/images/playstation.jpeg',
    totalTickets: 2000,
    date: 'June 14, 2025',
    time: '3:14 PM UTC',
    location: 'Online',
    endsAt: '2025-06-14T15:14:00Z',
 
  },
  '55-inch-tv-giveaway': {
    title: '55″ Smart TV Giveaway',
    prize: '55″ Smart TV',
    entryFee: 0.25,
    imageUrl: '/images/tv.jpg',
    date: 'June 8, 2025',
    time: '11:30 AM UTC',
    location: 'Online',
    endsAt: '2025-05-08T11:30:00Z',
    totalTickets: 1500,
  },
  'xbox-one-bundle': {
    title: 'Xbox One Giveaway',
    prize: 'Xbox One + Game Pass',
    entryFee: 0.35,
    imageUrl: '/images/xbox.jpeg',
    date: 'June 9, 2025',
    time: '5:45 PM UTC',
    location: 'Online',
    endsAt: '2025-05-09T17:45:00Z',
    totalTickets: 1300,
  },
  'gamer-pc-bundle': {
    title: 'Gaming PC Giveaway',
    prize: 'Gamer PC Bundle',
    entryFee: 0.25,
    imageUrl: '/images/bundle.jpeg',
    date: 'June 8, 2025',
    time: '11:30 AM UTC',
    location: 'Online',
    endsAt: '2025-05-08T11:30:00Z',
    totalTickets: 1500,
  },
  'electric-bike': {
    title: 'Electric Bike Giveaway',
    prize: 'Electric Bike',
    entryFee: 0.65,
    imageUrl: '/images/bike.jpeg',
    date: 'June 8, 2025',
    time: '11:30 AM UTC',
    location: 'Online',
    endsAt: '2025-05-08T11:30:00Z',
    totalTickets: 1850,
  },
  'matchday-tickets': {
    title: 'Matchday Tickets Giveaway',
    prize: 'Matchday Tickets',
    entryFee: 0.25,
    imageUrl: '/images/liverpool.jpeg',
    date: 'June 8, 2025',
    time: '11:30 AM UTC',
    location: 'Online',
    endsAt: '2025-05-08T11:30:00Z',
     totalTickets: 1200,
  },
  'apple-smart-watch': {
    title: 'Apple Smart Watch Giveaway',
    prize: 'Apple Smart Watch',
    entryFee: 0.25,
    imageUrl: '/images/watch.png',
    date: 'June 1, 2025',
    time: '12:00 PM UTC',
    location: 'Online',
    endsAt: '2025-06-01T12:00:00Z',
  },
  'gamingchair': {
    title: 'Gaming Chair Giveaway',
    prize: 'Gaming Chair',
    entryFee: 0.3,
    imageUrl: '/images/chair.png',
    date: 'June 2, 2025',
    time: '2:00 PM UTC',
    location: 'Online',
    endsAt: '2025-06-02T14:00:00Z',
  },
  'macbook-pro': {
    title: 'MacBook Pro Giveaway',
    prize: 'MacBook Pro',
    entryFee: 0.5,
    imageUrl: '/images/macbook.jpeg',
    date: 'June 5, 2025',
    time: '3:00 PM UTC',
    location: 'Online',
    endsAt: '2025-06-05T15:00:00Z',
  },
  'projector': {
    title: 'Mini Projector Giveaway',
    prize: 'Projector',
    entryFee: 0.3,
    imageUrl: '/images/projector.png',
    date: 'June 2, 2025',
    time: '2:00 PM UTC',
    location: 'Online',
    endsAt: '2025-06-02T14:00:00Z',
  },
  'amazon-firestick': {
    title: 'Amazon Fire Stick Giveaway',
    prize: 'Amazon Fire Stick',
    entryFee: 0.15,
    imageUrl: '/images/stick.jpeg',
    date: 'June 30, 2025',
    time: '10:00 AM UTC',
    location: 'Online',
    endsAt: '2025-05-30T10:00:00Z',
  },
  'gopro': {
    title: 'GoPro Giveaway',
    prize: 'GoPro Camera',
    entryFee: 0.3,
    imageUrl: '/images/gopro.png',
    date: 'June 2, 2025',
    time: '2:00 PM UTC',
    location: 'Online',
    endsAt: '2025-06-02T14:00:00Z',
  },
  'nintendo-switch': {
    title: 'Nintendo Switch Giveaway',
    prize: 'Nintendo Switch',
    entryFee: 0.35,
    imageUrl: '/images/nintendo.png',
    date: 'June 3, 2025',
    time: '1:30 PM UTC',
    location: 'Online',
    endsAt: '2025-06-03T13:30:00Z',
  },
  'apple-airpods': {
    title: 'Apple AirPods Giveaway',
    prize: 'Apple AirPods',
    entryFee: 0.2,
    imageUrl: '/images/airpods.png',
    date: 'June 4, 2025',
    time: '11:45 AM UTC',
    location: 'Online',
    endsAt: '2025-06-04T11:45:00Z',
  },


  'dubai-luxury-holiday': {
    title: 'Dubai Luxury Holiday',
    prize: '7-Day All-Inclusive Dubai Trip',
    entryFee: 2.5,
    imageUrl: '/images/dubai-luxury-holiday.jpg',
    date: 'June 18, 2025',
    time: '10:00 PM UTC',
    location: 'Online',
    endsAt: '2025-05-18T22:00:00Z',
     totalTickets: 4000,
  },
  'penthouse-stay': {
    title: 'Penthouse Stay',
    prize: 'Luxury Penthouse Hotel Stay',
    entryFee: 1.5,
    imageUrl: '/images/hotel.jpeg',
    date: 'June 15, 2025',
    time: '9:00 PM UTC',
    location: 'Online',
    endsAt: '2025-05-15T21:00:00Z',
     totalTickets: 3000,
  },
  'first-class-flight': {
    title: 'First Class Flight',
    prize: 'Return First Class Flights Worldwide',
    entryFee: 2,
    imageUrl: '/images/first.jpeg',
    date: 'June 15, 2025',
    time: '9:00 PM UTC',
    location: 'Online',
    endsAt: '2025-05-15T21:00:00Z',
     totalTickets: 2500,
  },
  'pi-giveaway-100k': {
    title: '100,000 Pi Giveaway',
    prize: '100,000 π',
    entryFee: 10,
    imageUrl: '', // Add image path if available
    date: 'june 20, 2025',
    time: '12:00 AM UTC',
    location: 'Online',
    endsAt: '2025-05-20T00:00:00Z',
  },
  'pi-giveaway-50k': {
    title: '50,000 Pi Giveaway',
    prize: '50,000 π',
    entryFee: 5,
    imageUrl: '', // Add image path if available
    date: 'June 11, 2025',
    time: '12:00 AM UTC',
    location: 'Online',
    endsAt: '2025-05-11T00:00:00Z',
  },
  'pi-giveaway-25k': {
    title: '25,000 Pi Giveaway',
    prize: '25,000 π',
    entryFee: 2,
    imageUrl: '', // Add image path if available
    date: 'June 11, 2025',
    time: '12:00 AM UTC',
    location: 'Online',
    endsAt: '2025-05-11T00:00:00Z',
  },

 
  'everyday-pioneer': {
    title: 'Everyday Pioneer',
    prize: '1,000 π',
    entryFee: 0.314,
    imageUrl: '', // Add image path if needed
    date: 'June 25, 2025',
    time: '3:14 PM UTC',
    location: 'Online',
    endsAt: '2025-05-03T15:14:00Z',
  },
  'pi-to-the-moon': {
    title: 'Pi to the Moon',
    prize: '5,000 π',
    entryFee: 3.14,
    imageUrl: '', // Add image path if needed
    date: 'June 25, 2025',
    time: '12:00 PM UTC',
    location: 'Online',
    endsAt: '2025-06-25T12:00:00Z',
  },
  'hack-the-vault': {
    title: 'Hack The Vault',
    prize: '7,750 π',
    entryFee: 0.375,
    imageUrl: '', // Add image path if needed
    date: 'June 3, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-05-03T23:59:59Z',
  },
  '5000 Pi': {
    title: '5000 Pi',
    prize: '5000',
    entryFee: 1.314,
    imageUrl: '', // Add image path if needed
    date: 'June 25, 2025',
    time: '3:14 PM UTC',
    location: 'Online',
    endsAt: '2025-05-03T15:14:00Z',
  },
  'daily-jackpot': {
    title: 'Daily Jackpot',
    prize: '750 π',
    entryFee: 0.375,
    imageUrl: '', // Add image path if needed
    date: 'June 3, 2025',
    time: '11:59 PM UTC',
    location: 'Online',
    endsAt: '2025-05-03T23:59:59Z',
  },
  'the-daily-dash': {
    title: 'The Daily Dash',
    prize: '5,000 π',
    entryFee: 3.14,
    imageUrl: '', // Add image path if needed
    date: 'June 4, 2025',
    time: '12:00 PM UTC',
    location: 'Online',
    endsAt: '2025-05-04T12:00:00Z',
  },
  'main-prize': {
    title: 'Main Prize 250,000 Pi',
    prize: '250,000 Pi in Pi (One Winner)',
    entryFee: 15,
    imageUrl: '/images/250000.png',
    date: 'June 28, 2025',
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

  // *** MOCK ticketsSold — replace with real data from your API or state
  const ticketsSold = 750; // example value

  // Get current user if available
  useEffect(() => {
    if (!router.isReady || !window?.Pi?.getCurrentPioneer) {
      setLoadingUser(false);
      return;
    }
    window.Pi.getCurrentPioneer()
      .then((user) => {
        if (user) {
          setPiUser(user);
          console.log('🔐 Pioneer already logged in:', user);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingUser(false));
  }, [router.isReady]);

  // Countdown timer
  useEffect(() => {
    const comp = COMPETITIONS[slug];
    if (!comp?.endsAt) return;

    const interval = setInterval(() => {
      const end = new Date(comp.endsAt).getTime();
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

    if (!window?.Pi) {
      alert('⚠️ Pi SDK not available. Use the Pi Browser.');
      setLoadingLogin(false);
      return;
    }

    try {
      const user = await window.Pi.authenticate(['username', 'payments'], async (incompletePayment) => {
        if (incompletePayment?.identifier) {
          alert(`⚠️ Found incomplete payment: ${incompletePayment.identifier}`);

          try {
            const res = await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: incompletePayment.identifier,
                txid: incompletePayment.transaction?.txid || 'missing-txid'
              }),
            });

            const result = await res.json();
            console.log('[✅] Tried to complete pending payment:', result);
          } catch (err) {
            console.warn('[❌] Failed to complete pending payment:', err);
          }
        }
      });

      setPiUser(user);
      console.log('✅ Logged in:', user);
    } catch (err) {
      alert(`Login failed: ${err.message}`);
      console.error('❌ Authentication error:', err);
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
        <Link href="/" className="mt-6 inline-block text-blue-400 underline font-semibold">← Back to Home</Link>
      </div>
    );
  }

  const currentPrice = comp.entryFee - discount;
  const totalPrice = currentPrice * quantity;

  return (
    <div className="bg-[#0b1120] min-h-screen text-white py-6 px-4">
      <div className="max-w-xl mx-auto border border-blue-500 rounded-xl shadow-xl overflow-hidden bg-[#0b1120]">
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-black uppercase">{comp.title}</h1>
        </div>

        <div className="p-6 space-y-6 text-center">
          {comp.imageUrl && (
            <img
              src={comp.imageUrl}
              alt={comp.title}
              className="w-full max-h-64 object-cover rounded-lg border border-blue-500 mx-auto"
            />
          )}

          {timeLeft && (
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 rounded-lg inline-block mx-auto">
              <span className="font-mono font-bold text-black">{timeLeft}</span>
            </div>
          )}

          <p className="text-white text-2xl font-bold">{comp.prize}</p>

          {/* Details container, centered with right-aligned label/value pairs */}
          <div className="max-w-md mx-auto text-sm text-white space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Date</span>
              <span className="text-right">{comp.date}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Location</span>
              <span className="text-right">{comp.location}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Entry Fee</span>
              <span className="text-right">{comp.entryFee} π</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-400 font-semibold">
                <span>Discount:</span>
                <span className="text-right">-{discount} π</span>
              </div>
            )}

            {typeof comp.totalTickets === 'number' && (
              <div className="flex justify-between text-white font-semibold">
                <span>Total Tickets:</span>
                <span className="text-right">{comp.totalTickets}</span>
              </div>
            )}
          </div>

          {/* Progress bar for tickets sold */}
          {typeof comp.totalTickets === 'number' && typeof ticketsSold === 'number' && (
            <div className="max-w-md mx-auto mt-4">
              <p className="text-sm text-white mb-1 font-semibold">
                Tickets Sold: {ticketsSold} / {comp.totalTickets}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-cyan-400 h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (ticketsSold / comp.totalTickets) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="bg-blue-500 px-4 py-1 rounded-full disabled:opacity-50"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="text-lg font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="bg-blue-500 px-4 py-1 rounded-full"
            >
              +
            </button>
          </div>

<p className="text-lg font-bold mt-6">Total {totalPrice.toFixed(2)} π</p>

<p className="text-white text-sm mt-2">
  Secure your entry to win <strong>{comp.prize}</strong>. Good luck!
</p>

<p className="text-xs mt-1 text-gray-400">
  <Link
    href="/terms/playstation5"
    className="underline hover:text-cyan-400"
    target="_blank"
    rel="noopener noreferrer"
  >
    Terms & Conditions
  </Link>
</p>


          {loadingUser ? (
            <p className="text-center text-white">Checking session…</p>
          ) : !piUser ? (
            <button
              onClick={handlePiLogin}
              disabled={loadingLogin}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl"
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



'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BuyTicketButton from '@components/BuyTicketButton';
import { usePiAuth } from '../../context/PiAuthContext';

export default function TicketPurchasePage() {
  const router = useRouter();
  const { user, login } = usePiAuth();

  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [competitionStatus, setCompetitionStatus] = useState('loading');

  // Extract slug from router for easier debugging
  const slug = router.query.slug;

  // Fetch competition data from the database
  const fetchCompetition = async (competitionSlug) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Attempting to fetch competition:', { 
        competitionSlug,
        routerReady: router.isReady,
        query: router.query
      });
      
      // Use the correct base URL based on environment
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      
      // Use the new game details endpoint with proper CORS headers
      const response = await fetch(`${baseUrl}/api/game/details/${competitionSlug}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch game details' }));
        throw new Error(errorData.error || 'Failed to fetch game details');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch game details');
      }
      
      console.log('✅ Game details:', {
        slug: competitionSlug,
        title: result.data.title,
        entryFee: result.data.entryFee,
        ticketsSold: result.data.ticketsSold,
        totalTickets: result.data.totalTickets
      });
      
      setComp(result.data);
    } catch (err) {
      console.error('❌ Error fetching game details:', {
        error: err.message || 'Failed to fetch',
        slug: competitionSlug
      });
      setError(err.message || 'Failed to load game details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for router to be ready and have the slug
    if (!router.isReady) {
      console.log('⏳ Router not ready yet');
      return;
    }

    if (!slug || slug === 'undefined') {
      console.error('❌ Invalid slug:', { slug, query: router.query });
      setError('Invalid competition URL');
      setLoading(false);
      return;
    }

    fetchCompetition(slug);
  }, [router.isReady, slug]); // Use slug from router.query.slug

  // Handler for successful payment to refresh competition data
  const handlePaymentSuccess = (result) => {
    console.log('🎉 Payment successful, refreshing competition data:', result);
    // Refresh competition data to show updated ticket count
    if (slug) {
      fetchCompetition(slug);
    }
  };

  // Update competition status
  useEffect(() => {
    if (!comp) return;

    const checkStatus = () => {
      const now = Date.now();
      const start = new Date(comp.startsAt).getTime();
      const end = new Date(comp.endsAt).getTime();

      if (now < start) {
        setCompetitionStatus('upcoming');
      } else if (now > end) {
        setCompetitionStatus('ended');
      } else {
        setCompetitionStatus('active');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [comp]);

  if (!router.isReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !comp) {
    return (
      <div className="p-6 text-center text-white bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Competition Not Found</h1>
        <p className="mt-4">{error || `We couldn't find this competition.`}</p>
        <div className="mt-4 text-sm text-gray-400">
          <p>Debug info: Router ready: {router.isReady ? 'Yes' : 'No'}</p>
          <p>Slug: {slug || 'undefined'}</p>
          <p>Query: {JSON.stringify(router.query)}</p>
        </div>
        <Link href="/" className="mt-6 inline-block text-blue-400 underline font-semibold">Back to Home</Link>
      </div>
    );
  }

  const totalPrice = (comp.entryFee || 0) * quantity;

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
            <div className="flex justify-between"><span className="font-semibold">Start Date</span><span>{new Date(comp.startsAt).toLocaleDateString('en-GB')}</span></div>
            <div className="flex justify-between"><span className="font-semibold">End Date</span><span>{new Date(comp.endsAt).toLocaleDateString('en-GB')}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Location</span><span>{comp.location || 'Online'}</span></div>
            <div className="flex justify-between"><span className="font-semibold">Entry Fee</span><span>{comp.entryFee.toFixed(2)} π</span></div>
            <div className="flex justify-between"><span className="font-semibold">Tickets Sold</span><span>{comp.ticketsSold} / {comp.totalTickets}</span></div>
          </div>

          {/* Ticket Sales Progress */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000" 
                style={{ width: `${Math.min(100, Math.floor((comp.ticketsSold / comp.totalTickets) * 100))}%` }} 
              />
            </div>
            <div className="flex justify-between text-xs text-gray-300">
              <span>{comp.ticketsSold} sold</span>
              <span>{Math.min(100, Math.floor((comp.ticketsSold / comp.totalTickets) * 100))}%</span>
              <span>{comp.totalTickets - comp.ticketsSold} remaining</span>
            </div>
          </div>

          {competitionStatus === 'ended' && (
            <div className="bg-red-500 text-white p-4 rounded-xl">
              <p className="font-bold">Competition has ended</p>
            </div>
          )}

          {competitionStatus === 'upcoming' && (
            <div className="bg-orange-500 text-white p-4 rounded-xl">
              <p className="font-bold">Competition starts {new Date(comp.startsAt).toLocaleDateString('en-GB')}</p>
            </div>
          )}

          {competitionStatus === 'active' && (
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
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="bg-blue-500 px-4 py-1 rounded-full"
                  disabled={quantity >= 10}
                >+</button>
              </div>

              <p className="text-lg font-bold mt-6">Total {totalPrice.toFixed(2)} π</p>
              <p className="text-white text-sm mt-2">Secure your entry to win <strong>{comp.prize}</strong>.</p>

              <BuyTicketButton
                competitionSlug={slug}
                entryFee={comp.entryFee}
                quantity={quantity}
                piUser={user}
                onPaymentSuccess={handlePaymentSuccess}
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

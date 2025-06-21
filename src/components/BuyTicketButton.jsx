'use client';

import { useState } from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import { createPiPayment } from '../lib/pi';

export default function BuyTicketButton({ competition }) {
  const { user } = usePiAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBuyTicket = async () => {
    if (!user) {
      alert('Please login with Pi to enter the competition');
      return;
    }

    if (competition.comp.ticketsSold >= competition.comp.totalTickets) {
      alert('Sorry, this competition is full');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createPiPayment({
        competitionId: competition._id,
        amount: competition.comp.piAmount,
        memo: `Entry ticket for ${competition.title}`
      });

      // Handle successful payment
      if (result.ticketNumber) {
        alert(`Success! Your ticket number is ${result.ticketNumber}`);
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Check if competition or comp is undefined/null
  if (!competition?.comp) {
    return <button disabled className="btn btn-disabled">Competition Not Available</button>;
  }

  // Check if competition is not active
  if (competition.comp.status !== 'active') {
    return <button disabled className="btn btn-disabled">Competition Ended</button>;
  }

  return (
    <div>
      <button
        onClick={handleBuyTicket}
        disabled={loading || !user}
        className={`px-4 py-2 rounded-lg font-semibold ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
        } text-white transition-colors`}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Enter with ${competition.comp.piAmount} π`
        )}
      </button>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {!user && (
        <p className="text-sm text-gray-500 mt-2">
          Please login with Pi to enter this competition
        </p>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { createPiPayment } from '../lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity = 1, piUser, onPaymentSuccess, endsAt }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if competition has ended
  const isCompetitionEnded = () => {
    if (!endsAt) return false;
    return new Date() > new Date(endsAt);
  };

  const handleBuyTicket = async () => {
    if (!piUser) {
      alert('Please login with Pi to enter the competition');
      return;
    }

    // Check if competition has ended before processing payment
    if (isCompetitionEnded()) {
      alert('This competition has ended. You can no longer purchase tickets.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const totalAmount = entryFee * quantity;
      const result = await createPiPayment({
        competitionSlug,
        amount: totalAmount,
        memo: `${quantity} ticket${quantity > 1 ? 's' : ''} for ${competitionSlug}`
      });

      // Handle successful payment
      if (result.ticketNumber) {
        const ticketText = result.ticketNumber.toString().includes('-') 
          ? `ticket numbers are ${result.ticketNumber}`
          : `ticket number is ${result.ticketNumber}`;
        
        const message = result.competitionStatus === 'completed' 
          ? `Success! Your ${ticketText}. This competition is now full!`
          : `Success! Your ${ticketText}`;
        
        alert(message);
        
        // Trigger refresh of competition data if callback provided
        if (onPaymentSuccess) {
          onPaymentSuccess(result);
        }
        
        // If competition is full, refresh the page to update UI
        if (result.competitionStatus === 'completed') {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Check if required props are missing
  if (!competitionSlug || typeof entryFee !== 'number') {
    return <button disabled className="w-full bg-gray-500 text-white font-bold py-3 px-4 rounded-xl opacity-50 cursor-not-allowed">
      Competition Not Available
    </button>;
  }

  // Check if competition has ended
  const hasEnded = isCompetitionEnded();

  return (
    <div className="w-full">
      <button
        onClick={handleBuyTicket}
        disabled={loading || !piUser || hasEnded}
        className={`w-full font-bold py-3 px-4 rounded-xl ${
          loading || !piUser || hasEnded
            ? 'bg-gray-500 opacity-50 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600'
        } text-black transition-colors`}
      >
        {hasEnded ? (
          'Competition Ended'
        ) : loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''} for ${(entryFee * quantity).toFixed(2)} π`
        )}
      </button>

      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}

      {hasEnded && (
        <p className="text-sm text-red-400 mt-2 text-center">
          This competition has ended. No more tickets can be purchased.
        </p>
      )}

      {!piUser && !hasEnded && (
        <p className="text-sm text-gray-300 mt-2 text-center">
          Please login with Pi to enter this competition
        </p>
      )}
    </div>
  );
}

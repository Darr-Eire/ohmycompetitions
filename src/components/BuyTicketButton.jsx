'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity, piUser }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  const handlePayment = async () => {
    if (!sdkReady) {
      setError('Pi SDK not ready. Please wait.');
      return;
    }

    if (!piUser) {
      setError('Please log in with Pi first.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // NEW: Server-side payment status check
      const response = await fetch(`/api/payments/status?userUid=${piUser.uid}`);
      const status = await response.json();

      if (status.pending) {
        setError('You have a pending payment. Please wait or complete it.');
        setProcessing(false);
        return;
      }

      const paymentData = {
        amount: (entryFee * quantity).toFixed(8),
        memo: `Ticket purchase for ${competitionSlug}`,
        metadata: { competitionSlug, quantity }
      };

      const payment = window.Pi.createPayment(paymentData);

      payment.onReadyForServerApproval(async (paymentId) => {
        await fetch('/api/payments/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
      });

      payment.onReadyForServerCompletion(async (paymentId, txid) => {
        await fetch('/api/payments/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        });
        setProcessing(false);
      });

      payment.onCancelled(() => {
        setProcessing(false);
      });

      payment.onError((err) => {
        console.error('Payment error:', err);
        setError('Payment failed.');
        setProcessing(false);
      });

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Unexpected error occurred.');
      setProcessing(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={!sdkReady || processing}
        className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-md hover:bg-green-600"
      >
        {processing ? 'Processing...' : 'Confirm Ticket Purchase'}
      </button>

      {error && (
        <div className="mt-4 text-red-500 font-semibold">
          {error}
        </div>
      )}
    </div>
  );
}

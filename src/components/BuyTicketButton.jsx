'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const paymentData = {
        amount: (entryFee * quantity).toFixed(8),
        memo: `Ticket purchase for ${competitionSlug}`,
        metadata: { competitionSlug, quantity }
      };

      // First: check for existing payment
      const currentPayment = await window.Pi.createPayment.fetchCurrentPayment();

      if (currentPayment) {
        console.log('Pending payment found:', currentPayment);

        if (currentPayment.status === 'INCOMPLETE') {
          setError('You have a pending payment already. Please complete or wait for it to expire.');
          setProcessing(false);
          return;
        }

        if (currentPayment.status === 'PENDING') {
          setError('Previous payment still waiting for developer approval. Try again later.');
          setProcessing(false);
          return;
        }
      }

      // No pending payment -> proceed
      const payment = await window.Pi.createPayment(paymentData);

      payment.onReadyForServerApproval(async (paymentId) => {
        console.log('Payment ready for server approval:', paymentId);
        await fetch('/api/payments/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
      });

      payment.onReadyForServerCompletion(async (paymentId, txid) => {
        console.log('Payment ready for server completion:', paymentId, txid);
        await fetch('/api/payments/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        });
      });

      payment.onCancelled(() => {
        console.log('Payment cancelled');
        setProcessing(false);
      });

      payment.onError((err) => {
        console.error('Payment error:', err);
        setError('Payment failed, please try again.');
        setProcessing(false);
      });

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred.');
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

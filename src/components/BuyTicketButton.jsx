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
      const currentPayment = await fetchCurrentPaymentSafe();

      if (currentPayment) {
        if (['INCOMPLETE', 'PENDING'].includes(currentPayment.status)) {
          setError('You have a pending payment. Please complete or wait.');
          setProcessing(false);
          return;
        }
      }

      const paymentData = {
        amount: (entryFee * quantity).toFixed(8),
        memo: `Ticket purchase for ${competitionSlug}`,
        metadata: { competitionSlug, quantity }
      };

      const payment = await window.Pi.createPayment(paymentData);

      payment.onReadyForServerApproval(async (paymentId) => {
        console.log('Ready for server approval', paymentId);
        await fetch('/api/payments/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
      });

      payment.onReadyForServerCompletion(async (paymentId, txid) => {
        console.log('Ready for server completion', paymentId, txid);
        await fetch('/api/payments/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        });
        setProcessing(false);
      });

      payment.onCancelled(() => {
        console.log('Payment cancelled');
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

  const fetchCurrentPaymentSafe = async () => {
    try {
      return await window.Pi.createPayment.fetchCurrentPayment();
    } catch (err) {
      console.warn('No pending payment or SDK error', err);
      return null;
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

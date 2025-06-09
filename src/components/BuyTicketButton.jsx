'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi'; // ✅ Ensure this helper is working

export default function BuyTicketButton({ competitionSlug, entryFee, quantity, piUser }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPiSdk(() => setSdkReady(true));
  }, []);

  const handlePayment = async () => {
    if (!sdkReady) {
      return setError('⚠️ Pi SDK not ready.');
    }

    if (!piUser || !piUser.uid) {
      console.warn('Missing piUser or uid:', piUser);
      return setError('⚠️ Could not detect Pi user session.');
    }

    setProcessing(true);
    setError(null);

    try {
      // Check backend for pending payments
      const statusRes = await fetch(`/api/payments/status?uid=${piUser.uid}`);
      const statusJson = await statusRes.json();
      if (statusJson?.pending) {
        setError('⚠️ You already have a pending payment.');
        setProcessing(false);
        return;
      }

      // Check for SDK-held payment
      const existingPayment = await fetchCurrentPaymentSafe();
      if (existingPayment && ['INCOMPLETE', 'PENDING'].includes(existingPayment.status)) {
        setError('⚠️ Unresolved payment exists in Pi SDK.');
        setProcessing(false);
        return;
      }

      const amount = (entryFee * quantity).toFixed(8);
      const payment = window.Pi.createPayment({
        amount,
        memo: `Buy ${quantity} ticket(s) for ${competitionSlug}`,
        metadata: { competitionSlug, quantity, uid: piUser.uid },
      });

      payment.onReadyForServerApproval(async (paymentId) => {
        await fetch('/api/payments/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, uid: piUser.uid }),
        });
      });

      payment.onReadyForServerCompletion(async (paymentId, txid) => {
        await fetch('/api/payments/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid, uid: piUser.uid }),
        });
        alert('✅ Payment successful!');
        setProcessing(false);
      });

      payment.onCancelled(() => {
        setError('❌ Payment was cancelled.');
        setProcessing(false);
      });

      payment.onError((err) => {
        console.error('❌ Pi payment error:', err);
        setError('❌ Error during payment. Please try again.');
        setProcessing(false);
      });

    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('❌ Unexpected error occurred.');
      setProcessing(false);
    }
  };

  const fetchCurrentPaymentSafe = async () => {
    try {
      return await window.Pi.createPayment.fetchCurrentPayment();
    } catch (err) {
      console.warn('No existing Pi SDK payment:', err);
      return null;
    }
  };

  return (
    <div className="text-center mt-4">
      <button
        onClick={handlePayment}
        disabled={!sdkReady || processing}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg transition disabled:opacity-50"
      >
        {processing ? 'Processing Payment…' : 'Buy Tickets with Pi'}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [piUser, setPiUser] = useState(null);

  useEffect(() => {
    loadPiSdk(() => setSdkReady(true));

    const storedUser = localStorage.getItem('piUser');
    if (storedUser) {
      try {
        setPiUser(JSON.parse(storedUser));
      } catch {
        console.error('Invalid piUser in localStorage');
      }
    }
  }, []);

  const handlePayment = async () => {
    if (!sdkReady) return setError('⚠️ Pi SDK not ready.');
    if (!piUser || !piUser.uid) return setError('⚠️ You must be logged in with Pi.');

    setProcessing(true);
    setError(null);

    try {
      // Check for pending payments
      const statusRes = await fetch(`/api/payments/status?uid=${piUser.uid}`);
      const statusJson = await statusRes.json();
      if (statusJson?.pending) {
        setError('⚠️ You already have a pending payment.');
        setProcessing(false);
        return;
      }

      // Check Pi SDK for existing session
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
        metadata: { competitionSlug, quantity, uid: piUser.uid }
      });

      payment.onReadyForServerApproval(async (paymentId) => {
        await fetch('/api/payments/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            uid: piUser.uid,
            competitionSlug,
            amount: parseFloat(amount),
          }),
        });
      });

      payment.onReadyForServerCompletion(async (paymentId, txid) => {
        await fetch('/api/payments/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            txid,
            uid: piUser.uid,
          }),
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
    } catch {
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

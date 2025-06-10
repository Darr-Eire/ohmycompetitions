'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [piUser, setPiUser] = useState(null);

  useEffect(() => {
    // Load Pi SDK
    loadPiSdk(() => setSdkReady(true));

    // Get user from localStorage
    const storedUser = localStorage.getItem('piUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setPiUser(parsed);
      } catch (err) {
        console.error('Invalid piUser in localStorage:', err);
      }
    }
  }, []);

  const handlePayment = async () => {
    if (!sdkReady) return setError('⚠️ Pi SDK not ready.');
    if (!piUser || !piUser.uid) return setError('⚠️ You must be logged in with Pi.');

    setProcessing(true);
    setError(null);

    try {
      const amount = (entryFee * quantity).toFixed(8);

      const payment = await window.Pi.createPayment({
        amount,
        memo: `Buy ${quantity} ticket(s) for ${competitionSlug}`,
        metadata: { competitionSlug, quantity, uid: piUser.uid },

        // Pi SDK callbacks
        callbacks: {
          onReadyForServerApproval: async (paymentId) => {
            console.log('🟢 onReadyForServerApproval:', paymentId);
            try {
              const res = await fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, uid: piUser.uid, competitionSlug, amount }),
              });
              if (!res.ok) throw new Error('Approve API failed');
            } catch (err) {
              console.error('❌ Approval failed:', err);
              setError('❌ Failed during server approval.');
              setProcessing(false);
            }
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            console.log('🟢 onReadyForServerCompletion:', { paymentId, txid });
            try {
              const res = await fetch('/api/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid, uid: piUser.uid }),
              });
              if (!res.ok) throw new Error('Completion API failed');
              alert('✅ Payment successful!');
            } catch (err) {
              console.error('❌ Completion failed:', err);
              setError('❌ Failed to finalize payment.');
            } finally {
              setProcessing(false);
            }
          },

          onCancel: () => {
            console.warn('❌ Payment cancelled');
            setError('❌ Payment was cancelled.');
            setProcessing(false);
          },

          onError: (err) => {
            console.error('❌ Payment error:', err);
            setError(`❌ SDK Error: ${err?.message || 'Unknown error'}`);
            setProcessing(false);
          },
        },
      });

      return payment;
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError(`❌ Unexpected error: ${err?.message || 'Check console'}`);
      setProcessing(false);
    }
  };

  return (
    <div className="text-center mt-4">
      <button
        onClick={handlePayment}
        disabled={!sdkReady || processing}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg transition disabled:opacity-50"
      >
        {processing ? 'Processing Payment…' : `Buy ${quantity} Ticket(s) for ${entryFee * quantity} π`}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}

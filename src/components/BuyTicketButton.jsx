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
      } catch (err) {
        console.error('Invalid piUser in localStorage:', err);
      }
    }
  }, []);

  const loginWithPi = async () => {
    try {
      const result = await window.Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
      localStorage.setItem('piUser', JSON.stringify(result.user));
      setPiUser(result.user);
      return result.user;
    } catch (err) {
      console.error('❌ Pi login failed:', err);
      setError('❌ Login with Pi failed.');
      return null;
    }
  };

  const onIncompletePaymentFound = (payment) => {
    console.warn('⚠️ Incomplete payment found at login:', payment);
    // Optional: auto-resume or alert
  };

  const handlePayment = async () => {
    if (!sdkReady) return setError('⚠️ Pi SDK not ready.');

    let user = piUser;
    if (!user || !user.uid) {
      user = await loginWithPi();
      if (!user) return; // login failed
    }

    setProcessing(true);
    setError(null);

    try {
      const amount = (entryFee * quantity).toFixed(8);

      const payment = await window.Pi.createPayment({
        amount,
        memo: `Buy ${quantity} ticket(s) for ${competitionSlug}`,
        metadata: { competitionSlug, quantity, uid: user.uid },
        callbacks: {
          onReadyForServerApproval: async (paymentId) => {
            try {
              const res = await fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, uid: user.uid, competitionSlug, amount }),
              });
              if (!res.ok) throw new Error('Approval failed');
            } catch (err) {
              console.error('❌ Approval error:', err);
              setError('❌ Failed during server approval.');
              setProcessing(false);
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              const res = await fetch('/api/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid, uid: user.uid }),
              });
              if (!res.ok) throw new Error('Completion failed');
              alert('✅ Payment successful!');
            } catch (err) {
              console.error('❌ Completion error:', err);
              setError('❌ Failed to finalize payment.');
            } finally {
              setProcessing(false);
            }
          },
          onCancel: () => {
            setError('❌ Payment was cancelled.');
            setProcessing(false);
          },
          onError: (err) => {
            setError(`❌ SDK Error: ${err?.message || 'Unknown error'}`);
            setProcessing(false);
          },
        },
      });

      return payment;
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(`❌ Could not create payment: ${err?.message || 'Unknown error'}`);
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
        {processing ? 'Processing Payment…' : `Buy ${quantity} Ticket(s) for ${(entryFee * quantity).toFixed(2)} π`}
      </button>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [piUser, setPiUser] = useState(null);

  useEffect(() => {
    // Load Pi SDK dynamically
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      if (window.Pi) {
        window.Pi.init({ version: '2.0' });
        setSdkReady(true);
      }
    };
    script.onerror = () => console.error('❌ Pi SDK failed to load');
    document.body.appendChild(script);

    // Try to restore logged in user
    const stored = localStorage.getItem('piUser');
    if (stored) {
      try {
        setPiUser(JSON.parse(stored));
      } catch {
        console.warn('Invalid piUser in localStorage');
      }
    }
  }, []);

  const handlePayment = async () => {
    if (!sdkReady) return setError('⚠️ Pi SDK not ready.');

    // Authenticate if needed
    let user = piUser;
    if (!user || !user.uid) {
      try {
        const result = await window.Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        user = result.user;
        localStorage.setItem('piUser', JSON.stringify(result.user));
        setPiUser(result.user);
      } catch (err) {
        console.error('❌ Login failed:', err);
        return setError('⚠️ You must be logged in with Pi to continue.');
      }
    }

    setProcessing(true);
    setError(null);

    const amount = (entryFee * quantity).toFixed(8);

    try {
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
              setError('❌ Failed during approval.');
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
              setError('❌ Failed to complete payment.');
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
        }
      });

    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError(`❌ Unexpected error: ${err?.message || 'Check console'}`);
      setProcessing(false);
    }
  };

  const onIncompletePaymentFound = (payment) => {
    console.warn('⚠️ Incomplete payment:', payment);
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
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}

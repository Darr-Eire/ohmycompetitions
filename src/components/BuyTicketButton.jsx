'use client';

import React, { useState } from 'react';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [loading, setLoading] = useState(false);

  const total = Number(entryFee * quantity).toFixed(6); // Limit to 6 decimals
  const memo = `Entry for ${competitionSlug}`;
  const metadata = { slug: competitionSlug, quantity };

  const handlePurchase = async () => {
    if (!window?.Pi?.createPayment) {
      alert('⚠️ Pi SDK not loaded. Please use the Pi Browser.');
      return;
    }

    setLoading(true);

    const onIncompletePaymentFound = (payment) => {
      console.log('🔁 Resuming incomplete payment:', payment);
      // Optional: Show UI to resume/retry payment
    };

    const onReadyForServerApproval = async (paymentId) => {
      console.log('🟡 Approving payment:', paymentId);
      try {
        const res = await fetch('/api/approve-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
        if (!res.ok) throw new Error('Approval failed');
      } catch (err) {
        console.error('❌ Server approval failed:', err);
        alert('Payment approval failed. Try again later.');
        throw err;
      }
    };

    const onReadyForServerCompletion = async (paymentId, txid) => {
      console.log('🟢 Completing payment:', paymentId, txid);
      try {
        const res = await fetch('/api/complete-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        });
        if (!res.ok) throw new Error('Completion failed');
        alert('✅ Payment completed successfully!');
      } catch (err) {
        console.error('❌ Server completion failed:', err);
        alert('Payment completion failed. Contact support.');
      }
    };

    const onCancel = (paymentId) => {
      console.warn('❌ Payment cancelled:', paymentId);
      alert('Payment was cancelled.');
    };

    const onError = (error, payment) => {
      console.error('❌ Payment error:', error, payment);
      alert('Payment failed: ' + (error?.message || 'unknown error'));
    };

    try {
      await window.Pi.createPayment({
        amount: total,
        memo,
        metadata,
        callbacks: {
          onIncompletePaymentFound,
          onReadyForServerApproval,
          onReadyForServerCompletion,
          onCancel,
          onError,
        },
      });
    } catch (err) {
      console.error('❌ createPayment error:', err);
      alert('Could not create a payment: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition"
    >
      {loading ? 'Processing…' : `Confirm Entry with Pi (${total} π)`}
    </button>
  );
}

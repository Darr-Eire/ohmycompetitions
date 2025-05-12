'use client';

import React, { useState } from 'react';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [loading, setLoading] = useState(false);

  const total = Number(entryFee * quantity).toFixed(6); // max 6 decimals
  const memo = `Entry for ${competitionSlug}`;
  const metadata = { slug: competitionSlug, quantity };

  const handlePurchase = async () => {
    if (!window?.Pi?.createPayment) {
      alert('Pi SDK not loaded. Please use the Pi Browser.');
      return;
    }

    setLoading(true);

    // ✅ REQUIRED CALLBACKS
    const onIncompletePaymentFound = (payment) => {
      console.log('🔁 Resuming incomplete payment:', payment);
      // You could optionally re-call createPayment or show a resume flow
    };

    const onReadyForServerApproval = async (paymentId) => {
      console.log('🟡 onReadyForServerApproval:', paymentId);
      await fetch('/api/approve-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
    };

    const onReadyForServerCompletion = async (paymentId, txid) => {
      console.log('🟢 onReadyForServerCompletion:', paymentId, txid);
      await fetch('/api/complete-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, txid }),
      });
    };

    const onCancel = (paymentId) => {
      console.warn('❌ Payment cancelled:', paymentId);
      alert('Payment was cancelled.');
    };

    const onError = (error, payment) => {
      console.error('❌ Payment error:', error, payment);
      alert('Payment failed: ' + error.message);
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

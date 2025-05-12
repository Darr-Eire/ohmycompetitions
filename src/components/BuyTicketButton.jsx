'use client';

import React, { useState } from 'react';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [loading, setLoading] = useState(false);

  const total = Number(entryFee * quantity).toFixed(6); // Ensure precision
  const paymentMemo = `Entry for ${competitionSlug}`;
  const paymentMetadata = { slug: competitionSlug, quantity };

  const handlePurchase = async () => {
    if (!window?.Pi) {
      alert('Pi SDK not loaded. Make sure you are in the Pi Browser.');
      return;
    }

    setLoading(true);
    try {
      const payment = await window.Pi.createPayment({
        amount: total,
        memo: paymentMemo,
        metadata: paymentMetadata,
        callbacks: {
          onReadyForServerApproval: async (paymentId) => {
            console.log('🟡 Payment ready for approval:', paymentId);
            await fetch('/api/approve-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            console.log('🟢 Payment ready for completion:', paymentId, txid);
            await fetch('/api/complete-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
          },
          onCancel: (paymentId) => {
            console.warn('❌ Payment was canceled:', paymentId);
            alert('Payment was canceled.');
          },
          onError: (error, payment) => {
            console.error('❌ Payment error:', error, payment);
            alert('Payment failed: ' + error.message);
          },
        },
      });

      console.log('✅ Payment created successfully:', payment);
    } catch (err) {
      console.error('❌ createPayment failed:', err);
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

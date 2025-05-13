'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from '@/lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [sdkReady, setSdkReady] = useState(false);

  // ✅ Load Pi SDK on mount
  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  // ✅ Debug log
  useEffect(() => {
    console.log('[DEBUG] sdkReady:', sdkReady);
    console.log('[DEBUG] window.Pi:', typeof window !== 'undefined' && window.Pi);
  }, [sdkReady]);

  // ✅ Trigger payment
  const handlePayment = async () => {
    if (
      typeof window === 'undefined' ||
      !window.Pi ||
      typeof window.Pi.createPayment !== 'function'
    ) {
      alert('⚠️ Pi SDK not ready. Make sure you are in the Pi Browser.');
      return;
    }

    console.log('🚀 Starting Pi.createPayment...');

    const total = (entryFee * quantity).toFixed(2);

    window.Pi.createPayment(
      {
        amount: parseFloat(total),
        memo: `Entry for ${competitionSlug}`,
        metadata: { competitionSlug, quantity },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          console.log('[APP] Approving payment:', paymentId);
          await fetch('/api/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log('[APP] Completing payment:', paymentId);
          await fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        onCancel: (paymentId) => {
          console.warn('[APP] Payment cancelled:', paymentId);
        },
        onError: (error, payment) => {
          console.error('[APP] Payment error:', error, payment);
        },
      }
    );
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow transition"
    >
      Confirm Ticket Purchase
    </button>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from '@/lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [sdkReady, setSdkReady] = useState(false);

  // Load Pi SDK on mount
  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  // Debug logs
  useEffect(() => {
    console.log('[DEBUG] sdkReady:', sdkReady);
    console.log('[DEBUG] window.Pi:', typeof window !== 'undefined' && window.Pi);
  }, [sdkReady]);

  // Handle payment
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
      try {
        const res = await fetch('/api/payments/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        console.log('[✅] Payment approved on server');
      } catch (err) {
        console.error('[ERROR] Approving payment:', err);
        alert('❌ Server approval failed. See console.');
      }
    },

    onReadyForServerCompletion: async (paymentId, txid) => {
      try {
        console.log('🧾 Completing with txid:', txid);
        const res = await fetch('/api/payments/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        console.log('[🎟️] Ticket issued:', data);
        alert(`✅ Ticket purchased successfully!\n🎟️ ID: ${data.ticketId}`);
      } catch (err) {
        console.error('[ERROR] Completing payment:', err);
        alert('❌ Server completion failed. See console.');
      }
    },

    onCancel: (paymentId) => {
      console.warn('[APP] Payment cancelled:', paymentId);
    },

    onError: (error, payment) => {
      console.error('[APP] Payment error:', error, payment);
    },
  }
);

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow transition"
    >
      Confirm Ticket Purchase
    </button>
  );
}

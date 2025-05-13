'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from '@/lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  const handlePayment = async () => {
    if (!sdkReady || !window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('⚠️ Pi SDK not ready. Try again in Pi Browser.');
      return;
    }

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
            if (!res.ok) throw new Error(await res.text());
          } catch (err) {
            console.error('❌ Approval error:', err);
          }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            const res = await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            if (!res.ok) throw new Error(await res.text());
          } catch (err) {
            console.error('❌ Completion error:', err);
          }
        },
        onCancel: (paymentId) => {
          console.warn('⚠️ Payment cancelled:', paymentId);
        },
        onError: (error, payment) => {
          console.error('❌ Pi SDK error:', error, payment);
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

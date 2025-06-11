'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity, piUser }) {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  const handlePayment = async () => {
    if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
      alert('⚠️ Pi SDK not ready. Use Pi Browser.');
      return;
    }

    if (!piUser || !piUser.uid) {
      alert('⚠️ You must be logged in with Pi.');
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
              body: JSON.stringify({
                paymentId,
                uid: piUser.uid,
                competitionSlug,
                amount: parseFloat(total),
              }),
            });

            if (!res.ok) throw new Error(await res.text());

            console.log('[✅] Payment approved');
          } catch (err) {
            console.error('[❌] Approving payment:', err);
            alert('❌ Approval failed. See console.');
          }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            const res = await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            alert(`✅ Ticket purchased!\n🎟️ ID: ${data.ticketId}`);
          } catch (err) {
            console.error('[❌] Completing payment:', err);
            alert('❌ Completion failed. See console.');
          }
        },

        onCancel: (paymentId) => {
          console.warn('[⛔] Payment cancelled:', paymentId);
        },

        onError: (error, payment) => {
          console.error('[❌] Payment error:', error, payment);
          alert('❌ Payment failed. See console.');
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

'use client';

import React, { useEffect, useState } from 'react';
import { loadPiSdk } from '../lib/pi';

export default function PiCashCodeBuyButton({ weekStart, quantity }) {
  const [sdkReady, setSdkReady] = useState(false);
  const ticketPrice = 1.25;
  const total = (ticketPrice * quantity).toFixed(2);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  const handlePayment = async () => {
    if (typeof window === 'undefined' || !window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('⚠️ Pi SDK not ready. Make sure you are in the Pi Browser.');
      return;
    }

    try {
      window.Pi.createPayment(
        {
          amount: parseFloat(total),
          memo: `Pi Cash Code Entry Week ${weekStart}`,
          metadata: { type: 'pi-cash-ticket', weekStart, quantity },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            try {
              const res = await fetch('/api/pi-cash-code/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId }),
              });
              if (!res.ok) throw new Error(await res.text());
              console.log('[✅] Payment approved');
            } catch (err) {
              console.error('[ERROR] Server approval failed:', err);
              alert('❌ Server approval failed.');
            }
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              const res = await fetch('/api/pi-cash-code/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid, weekStart }),
              });
              if (!res.ok) throw new Error(await res.text());
              const data = await res.json();
              alert(`✅ Ticket purchased! 🎟️ ID: ${data.ticketId}`);
            } catch (err) {
              console.error('[ERROR] Completing payment:', err);
              alert('❌ Server completion failed.');
            }
          },

          onCancel: () => {
            console.warn('Payment cancelled');
          },

          onError: (err) => {
            console.error('Payment error:', err);
            alert('Payment failed');
          }
        }
      );
    } catch (err) {
      console.error('Payment failed', err);
      alert('Payment error');
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow transition"
    >
      Confirm Pi Cash Ticket
    </button>
  );
}

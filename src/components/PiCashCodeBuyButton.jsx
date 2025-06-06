// src/components/PiCashCodeBuyButton.jsx

'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi';

export default function PiCashCodeBuyButton({ weekStart, quantity, userId }) {
  const [sdkReady, setSdkReady] = useState(false);
  const ticketPrice = 1.25;
  const total = (ticketPrice * quantity).toFixed(2);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  const handlePayment = async () => {
    if (typeof window === 'undefined' || !window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('⚠️ Pi SDK not ready.');
      return;
    }

    window.Pi.createPayment(
      {
        amount: parseFloat(total),
        memo: `Pi Cash Code Week ${weekStart}`,
        metadata: { type: 'pi-cash-code', weekStart, quantity, userId },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          await fetch('/api/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          await fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid, type: 'pi-cash-code', weekStart, quantity, userId }),
          });
          alert('✅ Ticket purchased!');
        },
        onCancel: () => {
          alert('Payment cancelled');
        },
        onError: (error) => {
          console.error('Payment error:', error);
          alert('Payment failed');
        },
      }
    );
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow transition"
    >
      Buy Pi Cash Code Ticket
    </button>
  );
}

'use client';

import { useEffect, useState } from 'react';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [piSdkReady, setPiSdkReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      if (window?.Pi) {
        window.Pi.init({ version: '2.0' });
        setPiSdkReady(true);
        console.log('✅ Pi SDK ready');
      }
    };
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    const Pi = window?.Pi;
    if (!Pi || !piSdkReady) {
      alert('Pi SDK not loaded yet.');
      return;
    }

    const totalAmount = parseFloat((entryFee * quantity).toFixed(6));

    await Pi.createPayment(
      {
        amount: totalAmount,
        memo: `Entry for ${competitionSlug} x${quantity}`,
        metadata: { competitionSlug, quantity },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          await fetch('/api/approve-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          await fetch('/api/complete-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
          alert('✅ Payment completed. You are now entered!');
        },
        onCancel: (paymentId) => {
          console.log('❌ Payment cancelled:', paymentId);
        },
        onError: (error, payment) => {
          console.error('💥 Payment error:', error, payment);
          alert('An error occurred during payment.');
        },
      }
    );
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-4 rounded-xl shadow-lg transition"
    >
      Confirm Entry with Pi ({entryFee.toFixed(2)} π × {quantity} = {(entryFee * quantity).toFixed(2)} π)
    </button>
  );
}

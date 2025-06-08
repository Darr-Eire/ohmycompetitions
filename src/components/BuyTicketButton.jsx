'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  const handlePayment = async () => {
    if (!sdkReady) {
      alert('⚠️ Pi SDK not ready. Make sure you are in the Pi Browser.');
      return;
    }

    if (processing) return;
    setProcessing(true);

    const totalAmount = parseFloat((entryFee * quantity).toFixed(2));

    try {
      if (!window?.Pi || typeof window.Pi.createPayment !== 'function') {
        alert('⚠️ Pi SDK not ready or unavailable.');
        setProcessing(false);
        return;
      }

      await window.Pi.createPayment(
        {
          amount: totalAmount,
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
                const errorText = await res.text();
                console.error('[SERVER APPROVAL FAILED]:', errorText);
                throw new Error(errorText);
              }

              console.log('[✅] Server approved payment.');
            } catch (err) {
              console.error('[APPROVAL ERROR]:', err);
              alert('❌ Payment approval failed.');
              setProcessing(false);
            }
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              const res = await fetch('/api/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid }),
              });

              if (!res.ok) {
                const errorText = await res.text();
                console.error('[SERVER COMPLETION FAILED]:', errorText);
                throw new Error(errorText);
              }

              const data = await res.json();

              // Update tickets after successful payment
              const updateRes = await fetch('/api/competitions/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: competitionSlug, quantity }),
              });

              if (!updateRes.ok) throw new Error('Failed to update tickets.');

              alert(`✅ Ticket purchased successfully!\n🎟️ Ticket ID: ${data.ticketId}`);
            } catch (err) {
              console.error('[COMPLETION ERROR]:', err);
              alert('❌ Payment completion failed.');
            } finally {
              setProcessing(false);
            }
          },

          onCancel: (paymentId) => {
            console.warn('[PAYMENT CANCELLED]:', paymentId);
            setProcessing(false);
          },

          onError: (error, payment) => {
            console.error('[SDK ERROR]:', error, payment);
            alert('❌ Payment failed. Check console.');
            setProcessing(false);
          },
        }
      );
    } catch (err) {
      console.error('[START PAYMENT ERROR]:', err);
      alert('❌ Payment initialization failed.');
      setProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={processing || !sdkReady}
      className={`w-full py-3 px-4 rounded-xl font-bold shadow transition ${
        processing || !sdkReady
          ? 'bg-gray-500 cursor-not-allowed text-white'
          : 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
      }`}
    >
      {processing ? 'Processing...' : 'Confirm Ticket Purchase'}
    </button>
  );
}

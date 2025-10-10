// src/components/PiCashCodeBuyButton.jsx
'use client';

import React, { useState, useEffect } from 'react';
import loadPiSdk from '../lib/loadPiSdk';         // shim loader you added
import { getPi } from '../lib/piClient';          // unified client (browser init)

export default function PiCashCodeBuyButton({ weekStart, quantity = 1, userId }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // price config
  const ticketPrice = 1.25;
  const total = Number((ticketPrice * quantity).toFixed(4)); // Pi amounts as number

  useEffect(() => {
    loadPiSdk((ok) => setSdkReady(!!ok));
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1) Ensure SDK is ready and init
      const Pi = getPi();
      if (!Pi || typeof Pi.createPayment !== 'function') {
        alert('⚠️ Pi SDK not ready.');
        return;
      }

      // 2) Authenticate to get accessToken + user (needed by backend)
      const scopes = ['payments', 'username', 'roles'];
      const { accessToken, user } = await Pi.authenticate(scopes);
      if (!accessToken) throw new Error('Missing accessToken from Pi.authenticate');

      const memo = `Pi Cash Code Week ${weekStart}`;
      const metadata = { type: 'pi-cash-code', weekStart, quantity, userId };

      // 3) Create payment (client-side)
      await Pi.createPayment(
        { amount: total, memo, metadata },
        {
          // 4) Server approval (with retry handled on server)
          onReadyForServerApproval: async (paymentId) => {
            await fetch('/api/pi/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                accessToken,
                amount: total,
                memo,
                uid: user?.uid,
                username: user?.username,
              }),
            });
          },

          // 5) Server completion (idempotent)
          onReadyForServerCompletion: async (paymentId, txid) => {
            const res = await fetch('/api/pi/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                txid,
                accessToken,
                type: 'pi-cash-code',
                weekStart,
                quantity,
                userId,
              }),
            });
            if (!res.ok) throw new Error('Complete failed');
            alert('✅ Ticket purchased!');
          },

          onCancel: () => {
            setLoading(false);
            alert('Payment cancelled');
          },

          onError: (error) => {
            console.error('Payment error:', error);
            setLoading(false);
            alert('Payment failed: ' + (error?.message || 'Unknown error'));
          },
        }
      );
    } catch (e) {
      console.error(e);
      alert('Payment failed: ' + (e?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={!sdkReady || loading}
      className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow transition
        ${!sdkReady || loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
      title={!sdkReady ? 'Pi SDK not ready in this browser' : 'Buy Pi Cash Code Ticket'}
    >
      {loading ? 'Processing…' : `Buy Pi Cash Code Ticket (${total} π)`}
    </button>
  );
}

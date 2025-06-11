// components/PiPaymentButton.js
'use client'

import { useState } from 'react'
import { usePiAuth } from '@/context/PiAuthContext'

export default function PiPaymentButton({ amount, memo, metadata }) {
  const { user } = usePiAuth();
  const [busy, setBusy] = useState(false);

  const start = () => {
    if (!user?.uid) {
      alert('You must log in first.');
      return;
    }

    setBusy(true);

    window.Pi.createPayment(
      { amount, memo, metadata },
      {
        onReadyForServerApproval: async (paymentId) => {
          await fetch('/api/pi/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          await fetch('/api/pi/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid, uid: user.uid }),
          });
          setBusy(false);
          alert('🎉 Payment complete!');
        },
        onCancel: () => setBusy(false),
        onError: (err) => {
          alert('❌ Payment failed: ' + err.message);
          setBusy(false);
        },
      }
    );
  };

  return (
    <button onClick={start} disabled={busy} className="mt-2 comp-button w-full">
      {busy ? 'Processing…' : `Pay ${amount} π`}
    </button>
  );
}
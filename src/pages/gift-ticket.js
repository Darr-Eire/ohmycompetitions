// src/pages/gift-ticket.js
'use client';
import { useState } from 'react';

export default function GiftTicketPage() {
  const [fromUsername, setFromUsername] = useState('');
  const [toUsername, setToUsername] = useState('');
  const [competitionSlug, setCompetitionSlug] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(null);

  // Helper: create a Pi payment then call your API
  const handleGift = async () => {
    try {
      if (!window.Pi) {
        setStatus({ error: 'Pi SDK not available. Open in Pi Browser.' });
        return;
      }

      // REQUIRED: make sure the user is authenticated with Pi SDK
      // const scopes = ['payments']; // plus 'username' if you need it
      // const user = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      // Amount the user needs to pay (you can also fetch from server)
      const amount = quantity; // or compute based on comp.piAmount
      const memo = `Gift ${quantity} ticket(s) for ${competitionSlug}`;
      const metadata = { kind: 'gift', competitionSlug, quantity, fromUsername, toUsername };

      await window.Pi.createPayment(
        { amount, memo, metadata },
        {
          // 1) Client tells your server to approve this payment id
          onReadyForServerApproval: async (paymentId) => {
            await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
          },

          // 2) After blockchain tx is done, Pi SDK gives you tx data
          // Send BOTH paymentId and transaction to your gift API
          onReadyForServerCompletion: async (paymentId, tx) => {
            const res = await fetch('/api/gift-ticket', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fromUsername,
                toUsername,
                competitionSlug,
                quantity,
                paymentId,
                transaction: tx, // <— REAL transaction object from Pi SDK
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gift failed');
            setStatus(data);

            // Optional: call complete to finish the Pi flow
            await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid: tx?.txid }),
            });
          },

          onCancel: (reason) => setStatus({ canceled: true, reason }),
          onError: (error) => setStatus({ error: error?.message || 'Payment error' }),
        }
      );
    } catch (e) {
      setStatus({ error: e.message });
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      {/* inputs... */}
      <button onClick={handleGift} className="bg-cyan-500 text-white px-4 py-2 rounded">
        Send Gift
      </button>
      {status && <pre className="mt-4 text-xs bg-black text-white p-3 rounded">{JSON.stringify(status, null, 2)}</pre>}
    </div>
  );
}

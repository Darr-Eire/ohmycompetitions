'use client';
import { useCallback, useMemo, useState } from 'react';
import { usePiAuth } from '../context/PiAuthContext';

export default function PiPaymentButton({ amount, memo = 'Competition Ticket', metadata = {} }) {
  const { user, login } = usePiAuth() || {};
  const [busy, setBusy] = useState(false);
  const env = useMemo(() => (process.env.NEXT_PUBLIC_PI_ENV || 'testnet').toLowerCase(), []);

  const start = useCallback(async () => {
    if (!window?.Pi) return alert('Pi SDK not loaded. Open in Pi Browser.');
    // auto-login if needed
    if (!user) {
      const r = await (login?.().catch(() => null));
      if (!r || r.ok === false) return; // user canceled / failed
    }
    if (!amount || Number.isNaN(+amount)) return alert('Invalid amount');

    setBusy(true);
    try {
      const mergedMetadata = {
        ...metadata,
        username: user?.username || null,
        userId: user?.uid || user?._id || user?.id || null,
      };

      await window.Pi.createPayment(
        { amount, memo, metadata: mergedMetadata },
        {
          onReadyForServerApproval: async (paymentId) => {
            const r = await fetch('/api/pi/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            if (!r.ok) throw new Error('Server approval failed');
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            const r = await fetch('/api/pi/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            if (!r.ok) throw new Error(await r.text());
            alert('🎉 Payment complete! Tickets added.');
            setBusy(false);
          },
          onCancel: () => setBusy(false),
          onError: (err) => {
            console.error('Pi payment error:', err);
            alert('❌ Payment failed. Please try again.');
            setBusy(false);
          },
        }
      );
    } catch (err) {
      console.error('Payment flow error:', err);
      alert(err?.message || 'Payment failed.');
      setBusy(false);
    }
  }, [user, login, amount, memo, metadata]);

  return (
    <button
      onClick={start}
      disabled={busy}
      className="mt-2 comp-button w-full disabled:opacity-60"
      title={`Pi Browser (${env})`}
    >
      {busy ? 'Processing…' : `Pay ${amount} π`}
    </button>
  );
}
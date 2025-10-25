// src/components/PiPaymentButton.jsx
'use client';
import { useCallback, useMemo, useState } from 'react';
import { usePiAuth } from '../context/PiAuthContext';

/**
 * Props:
 *  - amount: number (π)
 *  - slug: string (e.g. "playstation-5")
 *  - ticketQty: number (defaults 1)
 *  - memoTitle: optional readable title (kept in metadata; memo itself is JSON for server parsing)
 *  - extraMetadata: object merged into metadata
 */
export default function PiPaymentButton({
  amount,
  slug,
  ticketQty = 1,
  memoTitle = 'Competition Ticket',
  extraMetadata = {},
}) {
  const { user, login } = usePiAuth() || {};
  const [busy, setBusy] = useState(false);
  const env = useMemo(
    () => (process.env.NEXT_PUBLIC_PI_ENV || 'testnet').toLowerCase(),
    []
  );

  const start = useCallback(async () => {
    if (!window?.Pi) return alert('Pi SDK not loaded. Open in Pi Browser.');

    // auto-login if needed
    if (!user) {
      const r = await (login?.().catch(() => null));
      if (!r || r.ok === false) return; // user canceled / failed
    }

    if (!amount || Number.isNaN(+amount)) return alert('Invalid amount');
    if (!slug) return alert('Missing competition slug');

    setBusy(true);
    try {
      // Put the important bits BOTH in memo (JSON) and metadata
      const memoObj = { slug, ticketQty: Number(ticketQty) || 1 };
      const memoJson = JSON.stringify(memoObj);

      const metadata = {
        ...extraMetadata,
        ...memoObj,
        memoTitle, // human readable label
        username: user?.username || null,
        userId: user?.uid || user?._id || user?.id || null,
      };

      await window.Pi.createPayment(
        { amount, memo: memoJson, metadata },
        {
          onReadyForServerApproval: async (paymentId) => {
            // Send slug & ticketQty too (robust)
            const r = await fetch('/api/pi/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, slug, ticketQty }),
            });
            if (!r.ok) {
              const msg = await r.text();
              throw new Error(msg || 'Server approval failed');
            }
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            // Send slug & ticketQty again (robust)
            const r = await fetch('/api/pi/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid, slug, ticketQty }),
            });
            if (!r.ok) {
              const msg = await r.text();
              throw new Error(msg || 'Server completion failed');
            }
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
  }, [user, login, amount, slug, ticketQty, memoTitle, extraMetadata]);

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

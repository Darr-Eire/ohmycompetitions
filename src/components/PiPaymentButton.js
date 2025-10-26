'use client';
import { useCallback, useMemo, useState } from 'react';
import { usePiAuth } from '../context/PiAuthContext';

export default function PiPaymentButton({
  amount,
  slug,
  ticketQty = 1,
  memoTitle = 'Competition Ticket',
  extraMetadata = {},
  onSuccess,
}) {
  const { user, login } = usePiAuth() || {};
  const [busy, setBusy] = useState(false);
  const env = useMemo(
    () => (process.env.NEXT_PUBLIC_PI_ENV || 'testnet').toLowerCase(),
    []
  );

  /* --------------------------------- start -------------------------------- */
  const start = useCallback(async () => {
    if (!window?.Pi) {
      alert('Pi SDK not loaded. Please open in Pi Browser.');
      return;
    }

    if (!user) {
      const r = await (login?.().catch(() => null));
      if (!r || r.ok === false) {
        alert('Login cancelled or failed.');
        return;
      }
    }

    if (!amount || Number.isNaN(+amount)) {
      alert('Invalid payment amount.');
      return;
    }

    if (!slug) {
      alert('Missing competition slug.');
      return;
    }

    setBusy(true);
    try {
      const qty = Number(ticketQty) || 1;
      const memoObj = { slug, ticketQty: qty };
      const memoJson = JSON.stringify(memoObj);

      const metadata = {
        ...extraMetadata,
        ...memoObj,
        memoTitle,
        username: user?.username || null,
        userId: user?.uid || user?._id || user?.id || null,
      };

      await window.Pi.createPayment(
        { amount, memo: memoJson, metadata },
        {
          onReadyForServerApproval: async (paymentId) => {
            const res = await fetch('/api/pi/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, slug, ticketQty: qty }),
            });
            if (!res.ok) throw new Error('Server approval failed.');
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            const res = await fetch('/api/pi/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid, slug, ticketQty: qty }),
            });
            if (!res.ok) throw new Error('Server completion failed.');

            // Notify UI immediately
            window.dispatchEvent(new CustomEvent('omc:tickets:updated', { detail: { slug, qty } }));
            onSuccess?.({ paymentId, txid, slug, ticketQty: qty });
            setBusy(false);
          },

          onCancel: () => setBusy(false),
          onError: () => setBusy(false),
        }
      );
    } catch (err) {
      console.error('Pi payment error:', err);
      setBusy(false);
    }
  }, [user, login, amount, slug, ticketQty, memoTitle, extraMetadata, onSuccess]);

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

// src/components/PiPaymentButton.jsx
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

  const start = useCallback(async () => {
    if (!window?.Pi) return alert('Pi SDK not loaded. Open in Pi Browser.');

    // auto-login if needed
    if (!user) {
      const r = await (login?.().catch(() => null));
      if (!r || r.ok === false) return;
    }

    if (!amount || Number.isNaN(+amount)) return alert('Invalid amount');
    if (!slug) return alert('Missing competition slug');

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
          onIncompletePaymentFound: async (payment) => {
            // Helpful when users refresh; lets you finish an in-flight payment.
            console.log('[Pi] onIncompletePaymentFound', payment);
            try {
              const r = await fetch('/api/pi/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  paymentId: payment.identifier,
                  txid: payment.transaction?.txID || payment.transaction?.txid || '', // may be empty pre-chain
                  slug,
                  ticketQty: qty,
                }),
              });
              console.log('[Pi] recover complete ->', r.status);
            } catch (e) {
              console.warn('[Pi] recover complete failed', e);
            }
          },

          onReadyForServerApproval: async (paymentId) => {
            console.log('[Pi] onReadyForServerApproval', { paymentId, slug, qty });
            const r = await fetch('/api/pi/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                slug,
                ticketQty: qty,
                memo: memoJson,       // optional: helps server persist
                metadata,             // optional: helps server persist
              }),
            });
            if (!r.ok) {
              const msg = await r.text();
              console.error('[Pi] approve failed', msg);
              throw new Error(msg || 'Server approval failed');
            }
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            console.log('[Pi] onReadyForServerCompletion', { paymentId, txid, slug, qty });
            const r = await fetch('/api/pi/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid, slug, ticketQty: qty }),
            });
            if (!r.ok) {
              const msg = await r.text();
              console.error('[Pi] complete failed', msg);
              throw new Error(msg || 'Server completion failed');
            }

            // Tell UI to refresh any tickets counters
            window.dispatchEvent(new CustomEvent('omc:tickets:updated', { detail: { slug, qty } }));
            onSuccess?.({ paymentId, txid, slug, ticketQty: qty });

            alert('🎉 Payment complete! Tickets added.');
            setBusy(false);
          },

          onCancel: () => {
            console.log('[Pi] onCancel');
            setBusy(false);
          },

          onError: (err) => {
            console.error('[Pi] onError', err);
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

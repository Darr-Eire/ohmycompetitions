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
    const say = (msg, obj) => {
      try {
        const extra = obj ? `\n${JSON.stringify(obj, null, 2)}` : '';
        alert(`${msg}${extra}`);
      } catch {
        alert(msg);
      }
    };

    if (!window?.Pi) {
      say('Pi SDK not loaded. Open in Pi Browser.');
      return;
    }

    if (!user) {
      say('Logging in via Pi…');
      const r = await (login?.().catch(() => null));
      if (!r || r.ok === false) {
        say('Login cancelled or failed.');
        return;
      }
      say('Logged in ✅');
    }

    if (!amount || Number.isNaN(+amount)) { say('Invalid amount'); return; }
    if (!slug) { say('Missing competition slug'); return; }

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

      say('Starting Pi payment…', { amount, memo: memoObj, metadata });

      await window.Pi.createPayment(
        { amount, memo: memoJson, metadata },
        {
          onReadyForServerApproval: async (paymentId) => {
            say('onReadyForServerApproval → calling /api/pi/payments/approve', { paymentId, slug, qty });
            const r = await fetch('/api/pi/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, slug, ticketQty: qty }),
            });
            const text = await r.text();
            let json; try { json = JSON.parse(text); } catch {}
            if (!r.ok) {
              say('❌ Approve failed', { status: r.status, body: text });
              throw new Error(text || 'Server approval failed');
            }
            say('✅ Approve ok', json || text);
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            say('onReadyForServerCompletion → calling /api/pi/payments/complete', { paymentId, txid, slug, qty });
            const r = await fetch('/api/pi/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid, slug, ticketQty: qty }),
            });
            const text = await r.text();
            let json; try { json = JSON.parse(text); } catch {}
            if (!r.ok) {
              say('❌ Complete failed', { status: r.status, body: text });
              throw new Error(text || 'Server completion failed');
            }
            say('🎉 Complete ok', json || text);

            // notify UI
            window.dispatchEvent(new CustomEvent('omc:tickets:updated', { detail: { slug, qty } }));
            onSuccess?.({ paymentId, txid, slug, ticketQty: qty });
            say('🎟 Tickets updated locally. If the card doesn’t refresh, try pulling to refresh.');
            setBusy(false);
          },

          onCancel: () => {
            say('Payment cancelled by user.');
            setBusy(false);
          },

          onError: (err) => {
            say('❌ Pi payment error', { message: err?.message || String(err) });
            setBusy(false);
          },
        }
      );
    } catch (err) {
      alert(`❌ Payment flow error: ${err?.message || err}`);
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

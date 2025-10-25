// src/components/PiPaymentButton.jsx
'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

  /* ------------------ lightweight on-screen debug overlay ------------------ */
  const ensureDebugBox = () => {
    if (typeof document === 'undefined') return null;
    let box = document.getElementById('omc-debug-box');
    if (box) return box;

    box = document.createElement('div');
    box.id = 'omc-debug-box';
    Object.assign(box.style, {
      position: 'fixed',
      left: '8px',
      right: '8px',
      bottom: '8px',
      maxHeight: '45vh',
      overflowY: 'auto',
      padding: '8px 10px',
      background: 'rgba(10,16,32,0.85)',
      color: '#aef',
      border: '1px solid rgba(0,255,255,0.35)',
      borderRadius: '10px',
      zIndex: 2147483647,
      font: '12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      backdropFilter: 'blur(8px)',
    });

    const head = document.createElement('div');
    head.textContent = 'OMC Debug (tap to hide/show)';
    head.style.fontWeight = '700';
    head.style.marginBottom = '6px';
    head.style.color = '#7ff';
    head.style.cursor = 'pointer';

    const body = document.createElement('div');
    body.id = 'omc-debug-body';

    head.onclick = () => {
      body.style.display = body.style.display === 'none' ? '' : 'none';
    };

    box.appendChild(head);
    box.appendChild(body);
    document.body.appendChild(box);
    return box;
  };

  const say = (msg, obj) => {
    try {
      const box = ensureDebugBox();
      const body = document.getElementById('omc-debug-body') || box;
      const line = document.createElement('div');
      const ts = new Date().toLocaleTimeString();
      line.textContent = `[${ts}] ${msg}`;
      if (obj !== undefined) {
        const pre = document.createElement('pre');
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.margin = '2px 0 0 0';
        pre.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
        line.appendChild(pre);
      }
      body.appendChild(line);
      body.scrollTop = body.scrollHeight;
    } catch {
      // swallow overlay errors
    }
  };

  useEffect(() => {
    say('PiPaymentButton mounted', { slug, amount });
  }, [slug, amount]);

  /* --------------------------------- start -------------------------------- */
  const start = useCallback(async () => {
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

    if (!amount || Number.isNaN(+amount)) {
      say('Invalid amount');
      return;
    }
    if (!slug) {
      say('Missing competition slug');
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
        memoTitle, // human readable label
        username: user?.username || null,
        userId: user?.uid || user?._id || user?.id || null,
      };

      say('Starting Pi payment…', { amount, memo: memoObj, metadata });

      await window.Pi.createPayment(
        { amount, memo: memoJson, metadata },
        {
          onReadyForServerApproval: async (paymentId) => {
            say('onReadyForServerApproval → POST /api/pi/payments/approve', { paymentId, slug, qty });
            const r = await fetch('/api/pi/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, slug, ticketQty: qty }),
            });
            const txt = await r.text();
            let json; try { json = JSON.parse(txt); } catch {}
            if (!r.ok) {
              say('❌ Approve failed', { status: r.status, body: txt });
              throw new Error(txt || 'Server approval failed');
            }
            say('✅ Approve ok', json || txt);
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            say('onReadyForServerCompletion → POST /api/pi/payments/complete', { paymentId, txid, slug, qty });
            const r = await fetch('/api/pi/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid, slug, ticketQty: qty }),
            });
            const txt = await r.text();
            let json; try { json = JSON.parse(txt); } catch {}
            if (!r.ok) {
              say('❌ Complete failed', { status: r.status, body: txt });
              throw new Error(txt || 'Server completion failed');
            }
            say('🎉 Complete ok', json || txt);

            // notify UI listeners immediately
            window.dispatchEvent(new CustomEvent('omc:tickets:updated', { detail: { slug, qty } }));
            onSuccess?.({ paymentId, txid, slug, ticketQty: qty });
            say('🎟 Tickets updated locally. If the card doesn’t refresh, pull to refresh.');
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
      say('❌ Payment flow error', { message: err?.message || String(err) });
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

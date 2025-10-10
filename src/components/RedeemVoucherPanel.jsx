// src/components/RedeemVoucherPanel.jsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePiAuth } from 'context/PiAuthContext';
import { useTranslation } from 'react-i18next';

function normalizeCode(input) {
  const raw = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const hasPrefix = raw.startsWith('OMC');
  const body = hasPrefix ? raw.slice(3) : raw;
  const groups = [];
  for (let i = 0; i < body.length && groups.length < 3; i += 4) groups.push(body.slice(i, i + 4));
  return ['OMC', ...groups.filter(Boolean)].join('-').replace(/-+/g, '-');
}
const CODE_OK = /^OMC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export default function RedeemVoucherPanel({ onRedeemed }) {
  const { t } = useTranslation();
  const { user, loginWithPi } = usePiAuth?.() || {};
  const [code, setCode] = useState('');
  const [reserve, setReserve] = useState(true);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const inputRef = useRef(null);
  const liveRef = useRef(null);
  const submittingRef = useRef(false); // NEW: guards against double-submit

  const username = user?.username ?? null;
  const userId   = user?.uid ?? user?.piUserId ?? user?.id ?? null;

  const trimmed = code.trim();
  const valid = useMemo(() => CODE_OK.test(trimmed), [trimmed]);
  const charsLeft = Math.max(0, 18 - (trimmed.replace(/-/g, '').length));

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!busy && !submittingRef.current && autoSubmit && valid && (trimmed.match(/[A-Z0-9]/g)?.length === 15)) {
      const id = setTimeout(() => submit(), 50);
      return () => clearTimeout(id);
    }
  }, [valid, trimmed, autoSubmit, busy]);

  async function submit(e) {
    e?.preventDefault?.();
    setErr(null); setMsg(null);

    if (busy || submittingRef.current) return; // NEW: bail if already submitting
    if (!username && !userId) {
      setErr(t('please_log_in_first', 'Please log in first.'));
      inputRef.current?.focus();
      return;
    }
    if (!valid) {
      setErr(t('enter_full_code', 'Enter a full code like OMC-ABCD-1234-EFGH'));
      inputRef.current?.focus();
      return;
    }

    const ctrl = new AbortController();               // NEW: timeout/abort
    const timeout = setTimeout(() => ctrl.abort(), 15000);

    try {
      setBusy(true);
      submittingRef.current = true;

      const res = await fetch('/api/vouchers/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ code: trimmed, username, userId, reserve }),
      });

      // If the server threw and rendered an HTML error page, this prevents the "Unexpected token '<'" crash.
      let json = {};
      try { json = await res.json(); } catch { /* keeps json as {} */ }

      if (!res.ok) {
        const text = (json && json.error) ? json.error : `Redeem failed (${res.status})`;
        throw new Error(text);
      }

      setMsg(
        t('redeemed_tickets', `Redeemed ${json.qty} ticket${json.qty > 1 ? 's' : ''} for "${json.competitionSlug}"${
          Array.isArray(json.reservedTicketNumbers) && json.reservedTicketNumbers.length
            ? ` — reserved: ${json.reservedTicketNumbers.join(', ')}`
            : ''
        }`)
      );
      setCode('');
      onRedeemed?.(json);
      if (liveRef.current) liveRef.current.textContent = t('voucher_redeemed_successfully', 'Voucher redeemed successfully');
    } catch (e) {
      const message =
        e.name === 'AbortError' ? t('network_timeout', 'Network timeout. Please try again.') :
        /expired/i.test(e.message) ? t('code_expired', 'This code has expired.') :
        /not found|invalid/i.test(e.message) ? t('code_invalid', 'That code is invalid.') :
        /limit|already/i.test(e.message) ? t('redemption_limit_reached', 'Redemption limit reached for this code.') :
        e.message || t('could_not_redeem', 'Could not redeem code');
      setErr(message);
      if (liveRef.current) liveRef.current.textContent = message;
    } finally {
      clearTimeout(timeout);
      setBusy(false);
      submittingRef.current = false;
      inputRef.current?.focus();
    }
  }

  async function pasteFromClipboard() {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip) return;
      setCode(normalizeCode(clip));
      setErr(null);
    } catch {
      setErr(t('clipboard_blocked', 'Clipboard read blocked by browser. Paste manually (Ctrl/Cmd+V).'));
    }
  }

  function resetForm() {
    setCode('');
    setErr(null);
    setMsg(null);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      resetForm();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
      setTimeout(() => setCode((v) => normalizeCode(v)), 0);
    }
  }

  return (
    <section className="rounded-2xl border border-cyan-400/40 bg-[#0b1220]/95 backdrop-blur-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(34,211,238,0.08)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎟️</span>
          <h3 className="text-white font-bold text-lg">{t('redeem_voucher', 'Redeem Voucher')}</h3>
        </div>
        {!user && (
          <button
            onClick={loginWithPi}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-bold"
          >
            {t('login_with_pi', 'Login with Pi')}
          </button>
        )}
      </div>

      <form onSubmit={submit} className="space-y-3" aria-describedby="redeem-help">
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2">
          <div className="relative">
            <input
              ref={inputRef}
              className={`w-full text-black rounded-lg px-3 py-2 outline-none border pr-14
                ${valid ? 'border-emerald-400' : 'border-white/20'}
                focus:ring-2 focus:ring-cyan-400`}
              placeholder={t('voucher_code_placeholder', 'OMC-XXXX-XXXX-XXXX')}
              value={code}
              onChange={(e) => { setCode(normalizeCode(e.target.value)); setErr(null); setMsg(null); }}
              onKeyDown={handleKeyDown}
              disabled={busy}
              inputMode="latin"
              autoCapitalize="characters"
              aria-invalid={!valid && code.length > 0}
              aria-describedby="redeem-help"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <span className={`text-[10px] px-2 py-1 rounded-md ${
                valid ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/40'
                      : 'bg-white/5 text-white/60 border border-white/10'
              }`}>
                {valid ? (busy ? t('sending', 'Sending…') : t('ready', 'Ready')) : `${charsLeft} ${t('left', 'left')}`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={pasteFromClipboard}
            disabled={busy}
            className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:bg-white/5"
            title={t('paste_from_clipboard', 'Paste from clipboard')}
          >
            {t('paste', 'Paste')}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={busy || (!code && !msg && !err)}
            className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:bg-white/5"
            title={t('clear', 'Clear')}
          >
            {t('clear', 'Clear')}
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${reserve ? 'bg-cyan-400' : 'bg-white/20'}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white transform transition ${reserve ? 'translate-x-4' : 'translate-x-1'}`} />
              </span>
              <input type="checkbox" checked={reserve} onChange={(e) => setReserve(e.target.checked)} className="sr-only" disabled={busy} />
              <span className="text-white/90 text-sm">{t('reserve_now', 'Reserve now')}</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${autoSubmit ? 'bg-cyan-400' : 'bg-white/20'}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white transform transition ${autoSubmit ? 'translate-x-4' : 'translate-x-1'}`} />
              </span>
              <input type="checkbox" checked={autoSubmit} onChange={(e) => setAutoSubmit(e.target.checked)} className="sr-only" disabled={busy} />
              <span className="text-white/90 text-sm">{t('auto_submit', 'Auto submit')}</span>
            </label>
          </div>

          <p className="text-[11px] text-white/60">
            {t('reserving_note', 'Reserving deducts inventory immediately and may assign ticket numbers on success.')}
          </p>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={busy || !valid || (!username && !userId)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold disabled:opacity-60"
          >
            {busy ? t('redeeming', 'Redeeming…') : t('redeem', 'Redeem')}
          </button>
        </div>

        <p id="redeem-help" className="text-[11px] text-white/50">
          {t('format_help', 'Format')}: <code className="px-1 py-0.5 bg-white/10 rounded">OMC-ABCD-1234-EFGH</code>. {t('press_enter_esc', 'Press Enter to submit, Esc to clear.')}
        </p>
      </form>

      <div ref={liveRef} className="sr-only" aria-live="polite" />

      {msg && (
        <div className="mt-3 rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm text-emerald-300" role="status">
          ✅ {msg}
        </div>
      )}
      {err && (
        <div className="mt-3 rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300" role="alert">
          ❌ {err}
        </div>
      )}
    </section>
  );
}

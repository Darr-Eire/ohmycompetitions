'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import LiveActivityFeed from '../components/LiveActivityFeed';
import CodeHistory from '../components/CodeHistory';

/* ----------------------------- UI helpers ----------------------------- */
const Card = ({ children, className = '' }) => (
  <div className={`bg-black/30 border border-cyan-500 rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.08)] ${className}`}>
    {children}
  </div>
);

const Stat = ({ label, value, sub }) => (
  <div className="flex flex-col items-center text-center px-4 py-3">
    <div className="text-cyan-300 text-xs uppercase tracking-widest">{label}</div>
    <div className="text-white text-xl font-bold mt-1">{value}</div>
    {sub ? <div className="text-white/70 text-xs mt-0.5">{sub}</div> : null}
  </div>
);

const PrimaryButton = ({ children, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const OutlineButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-lg border border-cyan-500 text-cyan-200 hover:bg-cyan-500/10"
  >
    {children}
  </button>
);

const Masked = ({ visible, value }) => (
  <div className="inline-block font-mono text-3xl sm:text-4xl tracking-[0.35em] text-cyan-300">
    {visible ? (value || '0000-0000') : 'XXXX-XXXX'}
  </div>
);

const Progress = ({ percent }) => (
  <div className="w-full h-2 bg-cyan-900/40 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-cyan-400 to-cyan-200 transition-all duration-700"
      style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
    />
  </div>
);

const QtyButton = ({ onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="text-black font-bold bg-cyan-300 hover:bg-cyan-400 rounded-full px-4 py-1 disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

/* ----------------------------- Main page ------------------------------ */
export default function PiCashCodePage() {
  const { user, login } = usePiAuth();

  const [codeData, setCodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [liveTickets, setLiveTickets] = useState(0);

  // Skill modal
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

  // Pi SDK
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  // ───────────────────────── Fetch current week data ─────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/pi-cash-code', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch Pi Cash Code');
        const data = await res.json();
        if (!mounted) return;

        setCodeData(data);
        setLiveTickets(data.ticketsSold || 0);

        // Set a sensible default quantity cap if backend provides it
        const maxPerUser = Number(data?.maxPerUser || 10);
        setQuantity((q) => Math.min(Math.max(1, q), maxPerUser));
      } catch (e) {
        if (mounted) setErr(e.message || 'Could not load Pi Cash Code');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ───────────────────────── Pi SDK loader ─────────────────────────
  useEffect(() => {
    // avoid double injection
    if (typeof window === 'undefined') return;
    if (window.Pi?.createPayment) {
      setSdkReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.onload = () => {
      try {
        window.Pi.init({
          version: '2.0',
          sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === 'true',
        });
        setSdkReady(true);
      } catch (e) {
        console.warn('Pi SDK init failed:', e);
      }
    };
    document.head.appendChild(script);
  }, []);

  // ───────────────────────── Derived values ─────────────────────────
  const ticketPrice = useMemo(() => {
    // Allow backend to set price; fallback to 1.25
    return Number(codeData?.ticketPrice || 1.25);
  }, [codeData]);

  const totalPrice = useMemo(
    () => (ticketPrice * quantity).toFixed(2),
    [ticketPrice, quantity]
  );

  const dropAt = codeData?.dropAt ? new Date(codeData.dropAt) : null;
  const expiresAt = codeData?.expiresAt ? new Date(codeData.expiresAt) : null;
  const now = new Date();
  const codeVisible = dropAt ? now >= dropAt : false;

  // countdown
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = +expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [codeData?.expiresAt]);

  // unlock progress
  const progressPercent = useMemo(() => {
    if (!dropAt || !expiresAt) return 0;
    const total = +expiresAt - +dropAt;
    const elapsed = Date.now() - +dropAt;
    return Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)));
  }, [codeData?.dropAt, codeData?.expiresAt]);

  // server caps if present
  const maxPerUser = Number(codeData?.maxPerUser || 10);
  const maxQuantity = Math.max(1, maxPerUser);

  // skill test (allow server-provided question/answer, fallback)
  const skillQuestion = codeData?.skillQuestion || 'What is 7 + 5?';
  const skillAnswer = String(codeData?.skillAnswer || '12');

  const validateAnswer = () => {
    const ok = userAnswer.trim() === skillAnswer;
    setIsAnswerCorrect(ok);
    return ok;
  };

  // ───────────────────────── Actions ─────────────────────────
  const openSkillModal = () => {
    if (!user) {
      alert('Please login with Pi to purchase tickets');
      return;
    }
    setUserAnswer('');
    setIsAnswerCorrect(null);
    setShowSkillModal(true);
  };

  const refreshAfterPayment = async () => {
    try {
      const refreshRes = await fetch('/api/pi-cash-code', { cache: 'no-store' });
      const refreshData = await refreshRes.json();
      setCodeData(refreshData);
      setLiveTickets(refreshData.ticketsSold || 0);
    } catch (e) {
      console.warn('Refresh failed:', e);
    }
  };

  const handlePiPayment = async () => {
    if (!validateAnswer()) return;

    if (!window?.Pi?.createPayment || !sdkReady) {
      alert('⚠️ Pi SDK not ready. Please open in Pi Browser.');
      return;
    }

    try {
      setProcessing(true);

      // Construct a clear memo for a weekly code
      const memo = `Pi Cash Code – Week ${codeData?.weekStart || ''} – ${quantity} ticket(s)`;

      await window.Pi.createPayment(
        {
          amount: parseFloat(totalPrice),
          memo,
          metadata: {
            type: 'pi-cash-ticket',
            quantity,
            weekStart: codeData?.weekStart,
            userId: user?.uid,
            username: user?.username,
          },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            await fetch('/api/pi-cash-code/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            await fetch('/api/pi-cash-code/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                txid,
                weekStart: codeData?.weekStart,
                quantity,
                userId: user?.uid,
                username: user?.username,
              }),
            });

            // activity log (non-blocking)
            fetch('/api/pi-cash-code/log-activity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: user?.username, quantity }),
            }).catch(() => {});

            await refreshAfterPayment();
            setShowSkillModal(false);
          },
          onCancel: () => {
            console.warn('Payment cancelled');
          },
          onError: (err) => {
            console.error('Payment error:', err);
            alert('Payment failed');
          },
        }
      );
    } catch (err) {
      console.error('Payment failed', err);
      alert('Payment error');
    } finally {
      setProcessing(false);
    }
  };

  /* -------------------------------- Render -------------------------------- */
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-white/10 rounded animate-pulse" />
          <div className="h-28 w-full bg-white/10 rounded-xl animate-pulse" />
          <div className="h-64 w-full bg-white/10 rounded-xl animate-pulse" />
        </div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="min-h-screen bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <Card className="p-6">
            <div className="text-red-300 font-semibold">Error</div>
            <div className="text-white/80 mt-2">{err}</div>
            <div className="mt-4">
              <OutlineButton onClick={() => location.reload()}>Try Again</OutlineButton>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const ticketsSold = Number(liveTickets || 0);
  const totalTickets = Number(codeData?.totalTickets || 0);
  const soldPct =
    totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300 drop-shadow-md tracking-tight">
            Pi Cash Code
          </h1>
          <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto">
            Keep the code safe, time your move, and <span className="text-cyan-300 font-semibold">claim the prize</span>.
          </p>
        </div>

        {/* Code & Timer */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl px-6 py-4 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-cyan-500">
              <Masked visible={codeVisible} value={codeData?.code} />
            </div>

            {/* Countdown */}
            {timeLeft && (
              <div className="grid grid-cols-4 gap-2 w-full max-w-md">
                {['days', 'hours', 'minutes', 'seconds'].map((k) => (
                  <div key={k} className="text-center">
                    <div className="bg-[#0f172a] border border-cyan-500 text-white text-xl font-bold py-2 rounded-lg">
                      {String(timeLeft[k]).padStart(2, '0')}
                    </div>
                    <p className="text-cyan-300 text-xs mt-1">{k.toUpperCase()}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Unlock progress */}
            <div className="w-full max-w-2xl">
              <Progress percent={progressPercent} />
              <div className="flex justify-between text-xs text-white/70 mt-1">
                <span>Drop: {codeData?.dropAt ? new Date(codeData.dropAt).toLocaleString() : 'TBA'}</span>
                <span>Expires: {codeData?.expiresAt ? new Date(codeData.expiresAt).toLocaleString() : 'TBA'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><Stat label="Entry Fee" value={`${ticketPrice.toFixed(2)} π`} /></Card>
          <Card><Stat label="Prize Pool" value={`${(codeData?.prizePool ?? 0).toLocaleString()} π`} /></Card>
          <Card>
            <div className="px-2 py-2">
              <Stat
                label="Tickets Sold"
                value={`${ticketsSold} / ${totalTickets || '—'}`}
                sub={`${soldPct}% sold`}
              />
              <div className="px-4 pb-3">
                <Progress percent={soldPct} />
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="p-4">
          <div className="flex justify-center">
            <LiveActivityFeed />
          </div>
        </Card>

        {/* Purchase */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-center gap-6">
            <QtyButton
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || processing}
            >
              −
            </QtyButton>

            <span className="text-2xl font-bold">{quantity}</span>

            <QtyButton
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={quantity >= maxQuantity || processing}
            >
              +
            </QtyButton>
          </div>
          <p className="text-center text-cyan-300 text-sm font-semibold">
            Total: {totalPrice} π {maxPerUser ? <span className="text-white/60">• max {maxPerUser} per user</span> : null}
          </p>

          {!user ? (
            <PrimaryButton onClick={login}>Login with Pi to Purchase</PrimaryButton>
          ) : (
            <PrimaryButton onClick={openSkillModal} disabled={processing || !sdkReady}>
              {processing ? 'Processing…' : `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
            </PrimaryButton>
          )}

          {!sdkReady && (
            <p className="text-center text-yellow-300 text-xs">
              Tip: Open this page in <b>Pi Browser</b> to enable payments.
            </p>
          )}
        </Card>

        {/* How it works */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-cyan-300 text-center mb-4">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Secure your ticket(s) now',
              'Stand by for the Pi Cash Code drop',
              'Lock down the code and stay poised',
              'If selected, submit instantly to seize your prize',
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-cyan-500 rounded-lg"
              >
                <div className="flex-none w-8 h-8 flex items-center justify-center bg-[#00ffd5] rounded-full text-black font-bold">
                  {i + 1}
                </div>
                <p className="text-white font-medium">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Prize breakdown (example; swap to dynamic if your API returns it) */}
        <Card className="p-6 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-cyan-300 text-center mb-4">Prize Pool Breakdown</h3>
          <div className="flex justify-center">
            {[{ label: 'Pi Cash Code Prize', prize: `${(codeData?.prizePool ?? 11000).toLocaleString()} π` }].map(
              ({ label, prize }, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center p-4 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-cyan-500 rounded-lg"
                >
                  <span className="text-cyan-300 font-mono text-sm uppercase tracking-widest">
                    {label}
                  </span>
                  <span className="text-white font-bold text-lg mt-2">{prize}</span>
                </div>
              )
            )}
          </div>
        </Card>

        {/* Accessibility / feature badges */}
        <Card className="p-6">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: '🎟️', label: `${ticketPrice.toFixed(2)} π To Enter` },
              { icon: '🌐', label: 'Global Draw' },
              { icon: '🗝️', label: 'Code Needed To Win' },
            ].map(({ icon, label }, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-cyan-500 rounded-full"
              >
                <span className="text-lg">{icon}</span>
                <span className="text-white font-medium">{label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* History */}
        <Card className="p-4">
          <div className="flex justify-center">
            <CodeHistory />
          </div>
        </Card>

        {/* Terms */}
        <div className="text-center">
          <a
            href="/terms-conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 underline hover:text-cyan-300"
          >
            View full Terms &amp; Conditions
          </a>
        </div>
      </div>

      {/* Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] text-white border border-cyan-600 rounded-2xl p-6 w-[92%] max-w-sm space-y-4 shadow-[0_0_30px_rgba(0,255,255,0.15)]">
            <h2 className="text-lg font-semibold text-cyan-300">Skill Test</h2>
            <p className="text-white/90">{skillQuestion}</p>
            <input
              type="text"
              className="w-full bg-black/40 border border-cyan-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={processing}
            />
            {isAnswerCorrect === false && (
              <p className="text-red-400 text-sm">Incorrect — try again!</p>
            )}

            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{sdkReady ? 'Pi SDK ready' : 'Open in Pi Browser'}</span>
              <span>Max {maxPerUser} per user</span>
            </div>

            <div className="flex justify-end gap-3">
              <OutlineButton onClick={() => setShowSkillModal(false)} disabled={processing}>
                Cancel
              </OutlineButton>
              <button
                onClick={handlePiPayment}
                disabled={processing}
                className="px-4 py-2 bg-cyan-300 rounded-lg text-black font-bold disabled:opacity-60"
              >
                {processing ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


'use client';

import { useState, useEffect, useMemo } from 'react';
import '@fontsource/orbitron';
import BuyTicketButton from 'components/BuyTicketButton';
import { usePiAuth } from 'context/PiAuthContext';
import { getRandomQuestion, isCorrectAnswer as checkAnswer } from 'data/skill-questions';
import { CreatePayment } from '@lib/pi/PiIntegration';
import UiModal from 'components/UiModal';
import { COMPETITION_TERMS, DEFAULT_TERMS } from 'data/competition-terms';

/* ----------------------------- helpers ----------------------------- */
function normalizePrizeBreakdown(raw) {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const out = {};
    const map = {
      '1st': '1st', 'first': '1st', 'first prize': '1st', 'grand': '1st', 'grand prize': '1st',
      '2nd': '2nd', 'second': '2nd', 'second prize': '2nd',
      '3rd': '3rd', 'third': '3rd', 'third prize': '3rd',
    };
    for (const [k, v] of Object.entries(raw)) {
      const m = map[String(k).toLowerCase()];
      if (m && out[m] == null) out[m] = v;
    }
    if (out['1st'] || out['2nd'] || out['3rd']) return out;

    const sorted = Object.values(raw)
      .map(v => ({ v, n: Number(String(v).replace(/[^\d.-]/g, '')) }))
      .sort((a, b) => (b.n || -Infinity) - (a.n || -Infinity))
      .slice(0, 3);
    const ord = ['1st', '2nd', '3rd'];
    sorted.forEach((e, i) => { if (e?.v != null) out[ord[i]] = e.v; });
    return out;
  }
  if (Array.isArray(raw)) {
    const ord = ['1st', '2nd', '3rd'];
    const out = {};
    raw.slice(0, 3).forEach((v, i) => { out[ord[i]] = v; });
    return out;
  }
  return {};
}

function buildPrizeBreakdownFromComp(input, prizeFallback) {
  const c = input?.comp ?? input ?? {};
  const explicit = {
    '1st': c.firstPrize ?? c.prize1,
    '2nd': c.secondPrize ?? c.prize2,
    '3rd': c.thirdPrize ?? c.prize3,
  };
  if (explicit['1st'] || explicit['2nd'] || explicit['3rd']) return explicit;

  const tiers = {
    ...normalizePrizeBreakdown(c.prizeBreakdown),
    ...normalizePrizeBreakdown(c.prizes),
  };

  if (!tiers['1st'] && (prizeFallback ?? c.prize ?? c.prizeLabel)) {
    tiers['1st'] = prizeFallback ?? c.prize ?? c.prizeLabel;
  }
  return tiers;
}

function getWinnersCount(comp, tiers) {
  const c = comp?.comp ?? comp ?? {};
  const direct = c.winners ?? c.totalWinners ?? c.numberOfWinners ?? c.numWinners;

  const n = Number(direct);
  if (Number.isFinite(n) && n > 0) return Math.min(3, Math.max(1, Math.floor(n)));

  if (typeof direct === 'string') {
    if (/single|one/i.test(direct)) return 1;
    if (/two|2/i.test(direct)) return 2;
    if (/three|3/i.test(direct)) return 3;
    if (/multiple|multi/i.test(direct)) {
      const count = Object.values(tiers || {}).filter(Boolean).length;
      return Math.min(3, count || 3);
    }
  }

  const count = Object.values(tiers || {}).filter(Boolean).length;
  return Math.min(3, count || 1);
}

function formatPrize(v, theme) {
  if (v === null || v === undefined) return null;

  const isTechOrGadgets = ['tech', 'gadgets', 'premium'].includes(String(theme || '').toLowerCase());

  if (typeof v === 'string') {
    let s = v.trim();
    if (!s) return null;
    if (isTechOrGadgets) {
      s = s.replace(/\s*π\s*/gi, '').replace(/\s*pi\s*$/i, '');
      return s;
    }
    return /\bπ\b|[$€£]/.test(s) ? s : `${s} π`;
  }

  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const formatted = n >= 1000 ? Math.round(n).toLocaleString('en-US') : n.toFixed(2);
  return isTechOrGadgets ? `${formatted}` : `${formatted} π`;
}

function primaryPrizeFrom({ comp, prize, tiers, theme }) {
  const p = tiers?.['1st'] ?? prize ?? comp?.prize ?? comp?.prizeLabel ?? comp?.firstPrize;
  return formatPrize(p ?? 'TBA', theme);
}

/* --- local flexible answer checker (digits/words, minor punctuation) --- */
function normalizeText(x) {
  if (x == null) return '';
  return String(x)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}.\- ]+/gu, '')
    .replace(/\s+/g, ' ');
}
function asAnswerList(q) {
  const raw = q?.acceptableAnswers ?? q?.answers ?? q?.answer ?? q?.correct ?? null;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (raw == null) return [];
  return [raw];
}
function isProbablyNumber(str) {
  const s = String(str).replace(/,/g, '').trim();
  const n = Number(s);
  return Number.isFinite(n);
}
function numbersEqualLoose(a, b, eps = 1e-6) {
  const na = Number(String(a).replace(/,/g, '').trim());
  const nb = Number(String(b).replace(/,/g, '').trim());
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return false;
  return Math.abs(na - nb) <= eps;
}
function isAnswerCorrectFlexible(q, userInput) {
  const answers = asAnswerList(q);
  if (!answers.length) return false;

  const userLooksNumeric = isProbablyNumber(userInput);
  const anyExpectedNumeric = answers.some(isProbablyNumber);
  if (userLooksNumeric || anyExpectedNumeric) {
    if (answers.some(ans => numbersEqualLoose(ans, userInput))) return true;
  }

  const u = normalizeText(userInput);
  return answers.some(ans => normalizeText(ans) === u);
}

/* ----------------------------- UI atoms ----------------------------- */
function PrizeBanner({ value, theme, className = '' }) {
  const isTech = ['tech', 'gadgets', 'premium'].includes(String(theme || '').toLowerCase());
  return (
    <div
      className={`h-48 w-full grid place-items-center text-center
        rounded-xl border border-cyan-300/40 overflow-hidden
        bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,.18),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,.18),transparent_45%)]
        ${className}`}
      aria-label="Top prize"
      role="img"
    >
      <div className="px-4">
        <div className="text-[11px] uppercase tracking-[0.15em] text-cyan-200/90">Top Prize</div>
        <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-cyan-300 drop-shadow">
          {value}
          {!isTech && !/π/.test(String(value)) ? ' π' : ''}
        </div>
        <div className="mt-1 text-xs text-white/70">Win big — limited tickets available</div>
      </div>
    </div>
  );
}

function Pill({ children, tone = 'cyan' }) {
  const tones = {
    cyan: 'from-cyan-400 to-blue-500',
    green: 'from-green-400 to-emerald-500',
    amber: 'from-amber-400 to-orange-500',
    red: 'from-rose-500 to-red-600',
  };
  const t = tones[tone] || tones.cyan;
  return (
    <span className={`inline-block rounded-full bg-gradient-to-r ${t} text-black font-bold px-3 py-1 text-xs`}>
      {children}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] uppercase tracking-wider text-cyan-300">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

/* ===================== COMPONENT ===================== */
export default function LaunchCompetitionDetailCard({
  comp,
  title,
  prize,
  fee,
  imageUrl,
  endsAt,
  startsAt,
  ticketsSold,
  totalTickets,
  status, // cosmetic only now

  // PURCHASE-FLOW props (optional; context will be used if present)
  user:  userProp,
  login: loginProp,
  claimFreeTicket,
  handleShare,
  sharedBonus = false,
  GiftTicketModal,
  handlePaymentSuccess,
  description,

  initialQuestion,
  disableStickyPurchaseBar = false, // ADDED PROP
}) {
  /* ---------- Auth ---------- */
  const ctx = (typeof usePiAuth === 'function' ? usePiAuth() : {}) || {};
  const effectiveUser = userProp ?? ctx.user ?? null;
  const loginFn       = loginProp ?? ctx.login ?? (() => {});
  const userId =
    effectiveUser?.id ?? effectiveUser?.uid ?? effectiveUser?.userId ?? effectiveUser?.pi_user_id ?? effectiveUser?.username ?? null;

  /* ---------- Derived ---------- */
  const theme = comp?.theme || comp?.comp?.theme;
  const displayTitle = title ?? comp?.title ?? comp?.comp?.title ?? 'Competition';

  const effectiveDescription = useMemo(() => {
    if (description) return description;
    if (comp?.description) return comp.description;
    const name = comp?.comp?.title || comp?.title || displayTitle;
    return `${name} — Enter for a chance to win!`;
  }, [description, comp, displayTitle]);

  const formattedStart = startsAt
    ? new Date(startsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'TBA';
  const formattedEnd = endsAt
    ? new Date(endsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'TBA';

  const available = Math.max(0, (totalTickets ?? 0) - (ticketsSold ?? 0));
  const soldPct = totalTickets > 0 ? Math.min(100, Math.floor(((ticketsSold ?? 0) / totalTickets) * 100)) : 0;

  // Countdown (cosmetic)
  const [now, setNow] = useState(Date.now());
  const msLeft = useMemo(() => (endsAt ? Math.max(0, new Date(endsAt).getTime() - now) : null), [endsAt, now]);
  const isLast24h = msLeft !== null && msLeft <= 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (!endsAt) return;
    const tick = isLast24h ? 1000 : 60000;
    const id = setInterval(() => setNow(Date.now()), tick);
    return () => clearInterval(id);
  }, [endsAt, isLast24h]);

  const rawEntry = typeof fee !== 'undefined' ? fee : comp?.entryFee ?? 0;
  const entryNum = typeof rawEntry === 'string' ? parseFloat(rawEntry) : Number(rawEntry) || 0;
  const isFree = entryNum <= 0;

  /* ---------- Prize tiers ---------- */
  const tiers = useMemo(() => buildPrizeBreakdownFromComp(comp, prize), [comp, prize]);
  const winnersCount = useMemo(() => getWinnersCount(comp, tiers), [comp, tiers]);
  const ordinals = useMemo(() => ['1st', '2nd', '3rd'].slice(0, winnersCount), [winnersCount]);

  /* ---------- Terms content (modal) ---------- */
  const slug = comp?.slug || comp?.comp?.slug;
  const termsContent = (slug && COMPETITION_TERMS[slug]) || DEFAULT_TERMS;
  const [showTerms, setShowTerms] = useState(false);

  /* ---------- Skill gate & payment ---------- */
  const [qty, setQty] = useState(1);
  const [showSkill, setShowSkill] = useState(false);
  const [skillAnswer, setSkillAnswer] = useState('');
  const [answerOK, setAnswerOK] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const [showPayButton, setShowPayButton] = useState(false);

  const [question, setQuestion] = useState(() => initialQuestion || getRandomQuestion({ difficulty: 'easy' }));
  useEffect(() => { if (initialQuestion) setQuestion(initialQuestion); }, [initialQuestion]);

  const totalPrice = Math.max(0, entryNum * qty);

  const onCheckAnswer = (e) => {
    e?.preventDefault?.();

    let ok = isAnswerCorrectFlexible(question, skillAnswer);
    if (!ok && typeof checkAnswer === 'function') {
      try { ok = checkAnswer(question, skillAnswer); } catch {}
    }

    setAnswerOK(ok);

    if (ok) {
      setAnswerError('');
      setShowSkill(false);
      setShowPayButton(true);
      const el = document.getElementById('purchase-panel');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setShowPayButton(false);
      setAnswerError('Incorrect answer. Try again.');
    }
  };

  const onProceed = async () => {
    if (!isFree && !answerOK) {
      setShowSkill(true);
      setShowPayButton(false);
      return;
    }
    try {
      if (isFree) {
        await claimFreeTicket?.(qty);
        handlePaymentSuccess?.();
      } else {
        await CreatePayment('', totalPrice, 'competition', () => {
          try { handlePaymentSuccess?.(); } catch {}
        });
      }
    } catch (err) {
      console.error('Payment/claim failed:', err);
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="relative">
      {/* subtle glow */}
      <div className="pointer-events-none absolute -inset-2 rounded-3xl blur-2xl opacity-40
                      bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.25),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(59,130,246,0.25),transparent_35%)]" />

      <div className="relative grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* ============ LEFT: HERO & DETAILS ============ */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 sm:p-6">
          {/* title + status (cosmetic) */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-orbitron text-2xl sm:text-3xl font-extrabold tracking-wide
                           bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
              {displayTitle}
            </h1>
            {status === 'active' && <Pill tone="green">Live</Pill>}
            {status === 'upcoming' && <Pill tone="amber">Coming Soon</Pill>}
            {status === 'ended' && <Pill tone="red">Closed</Pill>}
          </div>

          {/* image OR prize banner */}
          <div className="mt-4 relative rounded-xl overflow-hidden border border-white/10">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayTitle}
                className="h-48 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <PrizeBanner
                value={primaryPrizeFrom({ comp, prize, tiers, theme })}
                theme={theme}
              />
            )}
          </div>

          {/* description */}
          <p className="mt-4 text-sm text-white/80 leading-relaxed">{effectiveDescription}</p>

          {/* small stats row */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Starts" value={formattedStart} />
            <Stat label="Ends" value={formattedEnd} />
            <Stat label="Entry" value={isFree ? 'Free' : `${entryNum.toFixed(2)} π`} />
            <Stat label="Tickets" value={`${ticketsSold ?? 0} / ${totalTickets ?? 0}`} />
          </div>

          {/* progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-cyan-300 mb-1">
              <span>Progress</span>
              <span>{soldPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 transition-[width] duration-700"
                style={{ width: `${soldPct}%` }}
              />
            </div>
          </div>

          {/* prizes */}
          <div className="mt-6">
            <div className={`grid gap-3 ${winnersCount === 1 ? 'sm:grid-cols-1' : winnersCount === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
              {ordinals.map((k) => (
                <div key={k} className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 p-3 text-center">
                  <div className="text-[11px] uppercase tracking-wide text-cyan-200">{k} Prize</div>
                  <div className="mt-1 text-lg font-extrabold text-cyan-300">
                    {formatPrize(tiers[k] ?? 'TBA', theme)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* terms modal trigger */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-sm text-cyan-300 underline hover:text-cyan-200"
              aria-haspopup="dialog"
            >
              More Details & Competition T&Cs
            </button>
          </div>
        </section>

        {/* ============ RIGHT: PURCHASE PANEL ============ */}
        <aside
          id="purchase-panel"
          className="rounded-2xl border border-cyan-400/40 bg-[#0b1220]/90 p-5 sm:p-6 shadow-[0_0_24px_rgba(34,211,238,0.16)]"
        >
          {/* countdown (cosmetic) */}
          {endsAt && (
            <div className={`mb-3 text-center text-sm ${isLast24h ? 'text-amber-300' : 'text-cyan-300'}`} aria-live="polite">
              {(() => {
                const d = msLeft ?? 0;
                if (isLast24h) {
                  const h = Math.floor(d / 3600000);
                  const m = Math.floor((d % 3600000) / 60000);
                  const s = Math.floor((d % 60000) / 1000);
                  const pad = (n) => String(n).padStart(2, '0');
                  return `Ends in ${pad(h)}:${pad(m)}:${pad(s)}`;
                }
                const days  = Math.floor(d / 86400000);
                const hours = Math.floor((d % 86400000) / 3600000);
                const mins  = Math.floor((d % 3600000) / 60000);
                return `Ends in ${days}d ${hours}h ${mins}m`;
              })()}
            </div>
          )}

          {/* totals */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Entry Fee</span>
              <span className="font-semibold text-white">{isFree ? 'Free' : `${entryNum.toFixed(2)} π`}</span>
            </div>
            {!isFree && (
              <>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-white/80">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="rounded-lg bg-white/10 px-2 py-1 text-white/90 disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(available || Infinity, q + 1))}
                      disabled={available > 0 ? qty >= available : false}
                      className="rounded-lg bg-white/10 px-2 py-1 text-white/90 disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-white/80">Total</span>
                  <span className="font-bold text-cyan-300">{totalPrice.toFixed(2)} π</span>
                </div>
              </>
            )}
          </div>

          {/* stock note */}
          {!isFree && available > 0 && available <= Math.ceil((totalTickets ?? 0) * 0.25) && (
            <div className="mt-2 text-center text-xs text-amber-300">Hurry — only {available} tickets left</div>
          )}
          {!isFree && available === 0 && (
            <div className="mt-2 text-center text-xs text-red-300">Sold out</div>
          )}

          {/* login (no longer gated by status) */}
          {!effectiveUser && (
            <button
              onClick={loginFn}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-black"
            >
              Login with Pi Network
            </button>
          )}

          {/* free flow (no longer gated by status) */}
          {isFree && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() => claimFreeTicket?.(1)}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-black"
              >
                Claim Free Ticket
              </button>
              {!sharedBonus && (
                <button
                  onClick={handleShare}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 font-semibold text-black"
                >
                  Share for Bonus Ticket
                </button>
              )}
            </div>
          )}

          {/* paid flow (no longer gated by status) */}
          {!isFree && effectiveUser && (
            <>
              {!showSkill && !showPayButton && (
                <button
                  onClick={() => setShowSkill(true)}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-black"
                >
                  Pay with π
                </button>
              )}

              {showSkill && (
                <form onSubmit={onCheckAnswer} className="mt-4 space-y-2">
                  <div className="text-sm text-white/90">{question?.question ?? 'Answer to continue'}</div>
                  <input
                    value={skillAnswer}
                    onChange={(e) => { setSkillAnswer(e.target.value); setAnswerError(''); }}
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Your answer"
                    aria-invalid={!!answerError}
                  />
                  {answerError && <div className="text-xs text-red-400">{answerError}</div>}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-cyan-400 py-2 text-sm font-semibold text-black"
                    >
                      Check Answer
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowSkill(false); setShowPayButton(false); }}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 text-xs text-white/80"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {!showSkill && showPayButton && (
                <div className="mt-4 space-y-2">
                  {/* Primary action after passing the skill check */}
                  <button
                    type="button"
                    onClick={onProceed}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-black"
                  >
                    Pay with π
                  </button>

                  {/* Optional existing integration button */}
                  <BuyTicketButton
                    competitionSlug={comp?.slug}
                    entryFee={entryNum}
                    quantity={qty}
                    piUser={effectiveUser}
                    userId={userId}
                    onPaymentSuccess={handlePaymentSuccess}
                    endsAt={comp?.endsAt ?? endsAt}
                  />
                </div>
              )}
            </>
          )}

          {/* gift (optional) */}
          {GiftTicketModal && effectiveUser?.username && (
            <GiftTicketModalTrigger comp={comp} GiftTicketModal={GiftTicketModal} />
          )}

          {/* footer note */}
          <p className="mt-6 text-center text-xs text-cyan-300/90">
            Good luck, Pioneer! Make your move.
          </p>
        </aside>
      </div>

      {/* Sticky purchase bar (mobile) — always functional, ignores status */}
      {!disableStickyPurchaseBar && ( // CONDITIONALLY RENDERED
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40">
          <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-[#0b1220]/95 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <div className="text-xs text-white/70">Entry</div>
                <div className="text-base font-semibold text-white truncate">
                  {isFree ? 'Free' : `${entryNum.toFixed(2)} π`}
                </div>
              </div>

              {!isFree && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="h-10 w-10 grid place-items-center rounded-lg bg-white/10 text-white/90 disabled:opacity-50"
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className="w-6 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="h-10 w-10 grid place-items-center rounded-lg bg-white/10 text-white/90"
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              )}

              <button
                onClick={() => {
                  const el = document.getElementById('purchase-panel');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });

                  // If the user isn't logged in and it's a paid comp, ask them to log in first
                  if (!isFree && !effectiveUser) {
                    loginFn?.();
                    return;
                  }

                  if (isFree) {
                    claimFreeTicket?.(1);
                    return;
                  }

                  // If the user already passed the skill check, proceed to payment
                  if (answerOK) {
                    onProceed();
                    return;
                  }

                  // Otherwise open the skill gate
                  setShowSkill(true);
                  setShowPayButton(false);
                }}
                className="ml-3 shrink-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-black"
              >
                {isFree ? 'Claim Free' : `Pay ${Math.max(0, entryNum * qty).toFixed(2)} π`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      <UiModal open={showTerms} onClose={() => setShowTerms(false)} title={termsContent.title}>
        <div id="terms-modal">
          {Array.isArray(termsContent.sections) ? (
            termsContent.sections.map((s, i) => (
              <section key={i} className="space-y-1">
                {s.h && <h4 className="text-white font-semibold">{s.h}</h4>}
                {s.p && <p className="text-white/80">{s.p}</p>}
              </section>
            ))
          ) : (
            <p className="text-white/80">No terms found for this competition.</p>
          )}
          {termsContent.lastUpdated && (
            <p className="mt-3 text-xs text-white/60">Last updated: {termsContent.lastUpdated}</p>
          )}
        </div>
      </UiModal>

      {/* motion preferences */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-spin,
          .motion-safe\\:animate-pulse {
            animation: none !important;
          }
          * { scroll-behavior: auto !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------- small helper for optional gift modal ---------- */
function GiftTicketModalTrigger({ comp, GiftTicketModal }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-black"
      >
        🎁 Gift a Ticket
      </button>
      <GiftTicketModal isOpen={open} onClose={() => setOpen(false)} preselectedCompetition={comp} />
    </>
  );
}
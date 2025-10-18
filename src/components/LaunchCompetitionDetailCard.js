// src/components/LaunchCompetitionDetailCard.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import '@fontsource/orbitron';
import BuyTicketButton from 'components/BuyTicketButton'; // adjust to your alias if needed
import { usePiAuth } from 'context/PiAuthContext';        // keep this path consistent

// Skill question helpers
import { getRandomQuestion, isCorrectAnswer as checkAnswer } from 'data/skill-questions';
import { CreatePayment } from '@lib/pi/PiIntegration';

/* ───────────────────────── prize helpers ───────────────────────── */
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

/** Format prize text.
 * - For tech/gadgets themes, NEVER append the π symbol (and strip it if present).
 * - For other themes, append π to plain numerics/strings that lack a currency.
 */
function formatPrize(v, theme) {
  if (v === null || v === undefined) return null;

  const isTechOrGadgets = ['tech', 'gadgets'].includes(String(theme || '').toLowerCase());

  if (typeof v === 'string') {
    let s = v.trim();
    if (!s) return null;
    if (isTechOrGadgets) {
      // strip trailing/embedded π (or " pi") defensively
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

/* ───────────────────────── component ───────────────────────── */
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
  status, // 'active' | 'upcoming' | 'ended'

  // PURCHASE-FLOW props (optional; context will be used if present)
  user:  userProp,
  login: loginProp,
  claimFreeTicket,
  handleShare,
  sharedBonus = false,
  GiftTicketModal,
  handlePaymentSuccess,
  description, // 👈 optional prop

  // OPTIONAL: allow parent to seed a question
  initialQuestion,
}) {
  /* -------------------- Auth (context with prop fallback) -------------------- */
  const ctx = usePiAuth?.() || {};
  const ctxUser  = ctx.user  ?? null;
  const ctxLogin = ctx.login ?? (() => {});
  const effectiveUser = userProp ?? ctxUser;
  const loginFn       = loginProp ?? ctxLogin;

  const getUserId = (u) =>
    u?.id ?? u?.uid ?? u?.userId ?? u?.pi_user_id ?? u?.username ?? null;

  const effectiveUserId = getUserId(effectiveUser);

  /* -------------------- Description (centralized) -------------------- */
  const effectiveDescription = useMemo(() => {
    // Priority: explicit prop -> comp.description -> centralized describeCompetition
    return description ?? comp?.description ?? describeCompetition(comp);
  }, [description, comp]);

  /* -------------------- Formatting / derived values -------------------- */
  const formattedStart = startsAt
    ? new Date(startsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'TBA';

  const formattedEnd = endsAt
    ? new Date(endsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'TBA';

  const availableTickets = Math.max(0, (totalTickets ?? 0) - (ticketsSold ?? 0));
  const percent = totalTickets > 0 ? Math.min(100, Math.floor(((ticketsSold ?? 0) / totalTickets) * 100)) : 0;
  const isNearlyFull = availableTickets > 0 && availableTickets <= Math.ceil((totalTickets ?? 0) * 0.25);

  /* -------------------- Countdown (24h mode) -------------------- */
  const [nowTs, setNowTs] = useState(Date.now());
  const msLeft = useMemo(() => {
    if (!endsAt) return null;
    return Math.max(0, new Date(endsAt).getTime() - nowTs);
  }, [endsAt, nowTs]);
  const isLast24h = msLeft !== null && msLeft <= 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (!endsAt) return;
    const tickMs = isLast24h ? 1000 : 60000; // seconds in last 24h, minutes otherwise
    const id = setInterval(() => setNowTs(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [endsAt, isLast24h]);

  /* -------------------- Purchase flow state -------------------- */
  const [quantity, setQuantity] = useState(1);
  const [showSkillQuestion, setShowSkillQuestion] = useState(false);
  const [skillAnswer, setSkillAnswer] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Skill flow gating
  const [hasValidAnswer, setHasValidAnswer] = useState(false);
  const [recordedAnswer, setRecordedAnswer] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [answerError, setAnswerError] = useState('');

  const rawEntry = typeof fee !== 'undefined' ? fee : comp?.entryFee ?? 0;
  const numericEntry = typeof rawEntry === 'string' ? parseFloat(rawEntry) : Number(rawEntry) || 0;
  const isFree = numericEntry <= 0;
  const totalPrice = Math.max(0, numericEntry * quantity);

  /* -------------------- Skill question (single source of truth) -------------------- */
  const [selectedQuestion, setSelectedQuestion] = useState(
    () => initialQuestion || getRandomQuestion({ difficulty: 'easy' })
  );
  useEffect(() => {
    if (initialQuestion) setSelectedQuestion(initialQuestion);
  }, [initialQuestion]);

  const isAnswerCorrect = () => checkAnswer(selectedQuestion, skillAnswer);

  const handleProceedClick = async() => {
    if (hasValidAnswer) {
     await CreatePayment("",totalPrice,"competition",()=>{
      alert("bow to my greatness you mortal")
     })
      setShowSkillQuestion(false);
    } else {
      setShowSkillQuestion(true);
      setShowPayment(false);
    }
  };

  const handleSubmitSkill = (e) => {
    e?.preventDefault?.();
    const ok = isAnswerCorrect();
    if (ok) {
      setRecordedAnswer(String(skillAnswer).trim());
      setHasValidAnswer(true);
      setAnswerError('');
      setShowSkillQuestion(false);
      setShowPayment(false);
    } else {
      setHasValidAnswer(false);
      setAnswerError('You must answer correctly to proceed.');
    }
  };

  /* -------------------- PRIZE TIERS (dynamic 1/2/3) -------------------- */
  const tiers = useMemo(
    () => buildPrizeBreakdownFromComp(comp, prize),
    [comp, prize]
  );
  const winnersCount = useMemo(
    () => getWinnersCount(comp, tiers),
    [comp, tiers]
  );
  const ordinals = useMemo(
    () => ['1st', '2nd', '3rd'].slice(0, winnersCount),
    [winnersCount]
  );

  const banner =
    winnersCount === 3 ? '1st • 2nd • 3rd Prizes'
  : winnersCount === 2 ? '1st • 2nd Prizes'
  : 'Single Winner';

  // Dynamic layout: center 1 prize, 2-column for 2 prizes, 3-column for 3 prizes
  const prizesLayoutClass = useMemo(() => {
    if (winnersCount === 1) return 'flex justify-center';
    if (winnersCount === 2) return 'grid grid-cols-1 sm:grid-cols-2 gap-3';
    return 'grid grid-cols-1 sm:grid-cols-3 gap-3';
  }, [winnersCount]);

  /* --------------------------------- UI --------------------------------- */
  return (
    <div className="flex justify-center p-0 my-0 -mt-4 -mb-3">
      <div className="relative w-full max-w-xl">
        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/15 via-cyan-500/10 to-blue-500/15 blur-xl" />
        <div className="relative rounded-3xl p-[1.5px] bg-[linear-gradient(135deg,rgba(0,255,213,0.6),rgba(0,119,255,0.5))]">
          {/* Card body */}
          <section className="rounded-3xl bg-[#0b1220]/95 backdrop-blur-xl border border-cyan-300 text-white font-orbitron p-5 sm:p-6">
            {/* Title */}
            <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-wide text-center bg-gradient-to-r from-green-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow">
              {title}
            </h2>

            {/* Theme-specific image */}
            {(comp?.theme === 'tech' || comp?.theme === 'premium') && (
              <div className="mt-4 flex justify-center">
                <img
                  src={
                    imageUrl ||
                    (comp?.theme === 'tech'
                      ? '/images/tech-default.jpg'
                      : comp?.theme === 'premium'
                      ? '/images/premium-default.jpg'
                      : '/images/placeholder.jpg')
                  }
                  alt={title || 'Competition image'}
                  className="w-48 h-32 rounded-lg border border-cyan-300/30 shadow-[0_0_12px_rgba(34,211,238,0.25)] object-cover"
                />
              </div>
            )}

            {/* Status */}
            {status === 'active' && (
              <div className="mt-2 text-center">
                <span className="inline-block rounded-full bg-gradient-to-r from-green-400 to-green-600 text-black font-bold px-4 py-1 animate-pulse">
                  Live Now
                </span>

                <div className={`text-lg font-bold ${isLast24h ? 'text-amber-300' : 'text-cyan-300'} mt-1`}>
                  {(() => {
                    const diff = msLeft ?? 0;
                    if (isLast24h) {
                      const hours = Math.floor(diff / 3600000);
                      const mins  = Math.floor((diff % 3600000) / 60000);
                      const secs  = Math.floor((diff % 60000) / 1000);
                      const pad = (n) => String(n).padStart(2, '0');
                      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
                    }
                    const days  = Math.floor(diff / 86400000);
                    const hours = Math.floor((diff % 86400000) / 3600000);
                    const mins  = Math.floor((diff % 3600000) / 60000);
                    return `${days} ${days === 1 ? 'Day' : 'Days'} ${hours} ${hours === 1 ? 'Hour' : 'Hours'} ${mins} ${mins === 1 ? 'Min' : 'Mins'}`;
                  })()}
                </div>

                <div className="mt-2 text-cyan-300 text-sm">
                  Draw Date <span className="text-white">{formattedEnd}</span>
                </div>
              </div>
            )}

            {status === 'upcoming' && (
              <div className="mt-4 text-center">
                <span className="inline-block rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-black font-bold px-4 py-1 shadow-[0_0_8px_rgba(251,146,60,0.6)]">
                  Coming Soon
                </span>
              </div>
            )}

            {status === 'ended' && (
              <div className="mt-4 text-center">
                <span className="inline-block rounded-full bg-red-500 text-white font-bold px-4 py-1">
                  ❌ Closed
                </span>
              </div>
            )}

            {/* Winners banner */}
            <div className="mt-5 text-center text-xs bg-cyan-500 text-black font-semibold py-1 mx-auto rounded-md max-w-xs">
              {banner}
            </div>

            {/* PRIZES (dynamic 1/2/3) */}
            <div className={`mt-4 ${prizesLayoutClass}`}>
              {ordinals.map((label) => (
                <div
                  key={label}
                  className="rounded-xl border border-cyan-300/50 bg-white/5 px-4 py-3 text-center shadow-[0_0_8px_rgba(34,211,238,0.25)]"
                >
                  <div className="text-[11px] uppercase tracking-wide text-cyan-300 font-semibold">
                    {label} Prize
                  </div>
                  <div
                    className="mt-1 text-lg font-extrabold text-cyan-300 motion-safe:animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                    style={{ animationDuration: '1.1s' }}
                  >
                    {formatPrize(tiers[label], comp?.theme) ?? 'TBA'}
                  </div>
                </div>
              ))}
            </div>

            {/* Key Details */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Stat
                size="sm"
                label="Entry Fee"
                value={(() => {
                  const v = typeof fee !== 'undefined' ? fee : comp?.entryFee;
                  if (v == null) return '0.00 π';
                  if (typeof v === 'string') return /\bπ\b/.test(v) ? v : `${v} π`;
                  const n = Number(v);
                  return `${Number.isFinite(n) ? n.toFixed(2) : '0.00'} π`;
                })()}
                customClass="border-cyan-300/50 text-cyan-300"
              />
              <Stat
                size="sm"
                label="Tickets Sold"
                value={`${ticketsSold ?? 0} / ${totalTickets ?? 0}`}
                customClass="border-cyan-300/50 text-cyan-300"
              />
              <Stat
                size="xs"
                label="Available"
                value={`${availableTickets} left (max ${comp?.maxTicketsPerUser ?? 'N/A'}/user)`}
                customClass="border-cyan-300/50 text-cyan-300"
              />
              <Stat
                size="sm"
                label="Winners"
                value={String(winnersCount)}
                customClass="border-cyan-300/50 text-cyan-300"
              />
            </div>

            {/* Progress Bar — cyan theme */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] text-cyan-300 mb-1">
                <span>Progress</span>
                <span>{percent}%</span>
              </div>
              <div
                className="h-2 w-full rounded-full bg-cyan-300/15 border border-cyan-300/30 overflow-hidden"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-cyan-400 shadow-[0_0_10px_rgba(103,232,249,0.55)] transition-[width] duration-700 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* ------------------------- PURCHASE PANEL ------------------------- */}
            <div className="mt-6">
              {isFree ? (
                <>
                  <button
                    onClick={claimFreeTicket}
                    disabled={quantity >= (sharedBonus ? 2 : 1)}
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl mb-3 disabled:opacity-60"
                  >
                    Claim Free Ticket
                  </button>

                  {!sharedBonus && (
                    <button
                      onClick={handleShare}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-4 rounded-xl"
                    >
                      Share for Bonus Ticket
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-lg font-bold mt-1 text-center">
                    Total {Number(totalPrice).toFixed(2)} π
                  </p>

                  {/* Quantity picker */}
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="bg-blue-500 px-4 py-1 rounded-full disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(availableTickets, q + 1))}
                      disabled={quantity >= availableTickets}
                      className="bg-blue-500 px-4 py-1 rounded-full disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  {/* Stock notes */}
                  {isNearlyFull && availableTickets > 0 && (
                    <div className="text-cyan-300 text-sm font-bold mt-2 text-center">
                      ⚠️ Only {availableTickets} tickets remaining!
                    </div>
                  )}
                  {quantity > availableTickets && (
                    <div className="text-cyan-300 text-sm font-bold mt-2 text-center">
                      ❌ Cannot buy {quantity} tickets — only {availableTickets} available
                    </div>
                  )}

                  {/* Proceed / Continue button (gated by skill) */}
                  {!showSkillQuestion && !showPayment && (
                    <>
                      <button
                        onClick={handleProceedClick}
                        className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl mt-6"
                      >
                        {hasValidAnswer ? 'Continue to Payment' : 'Proceed to Payment'}
                      </button>
                      {hasValidAnswer && (
                        <p className="mt-2 text-center text-emerald-300 text-xs">
                          ✓ Answer verified{recordedAnswer ? `: “${recordedAnswer}”` : ''}
                        </p>
                      )}
                    </>
                  )}

                  {/* Payment button appears once proceed is clicked after a correct answer */}
                  {!showSkillQuestion && showPayment && (
                    <div className="mt-4">
                      <BuyTicketButton
                        competitionSlug={comp?.slug}
                        entryFee={numericEntry}
                        quantity={quantity}
                        piUser={effectiveUser}
                        userId={effectiveUserId}
                        onPaymentSuccess={handlePaymentSuccess}
                        endsAt={comp?.endsAt ?? endsAt}
                      />
                    </div>
                  )}

                  {/* Login prompt if needed */}
                  {!effectiveUser && !showSkillQuestion && !showPayment && (
                    <button
                      onClick={loginFn}
                      className="w-full mt-3 py-2 px-4 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition"
                    >
                      Log in with Pi
                    </button>
                  )}

                  {/* Gift button */}
                  {!showSkillQuestion && effectiveUser?.username && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowGiftModal(true);
                      }}
                      className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition"
                    >
                      🎁 Gift a Ticket
                    </button>
                  )}

                  {/* Inspiration + thanks */}
                  <p className="mt-2 text-center text-cyan-300 text-sm italic">
                    Your journey to victory starts here play smart, dream big and claim the Pi prize
                  </p>
                  <p className="text-cyan-300 text-xs sm:text-sm mt-3 text-center">
                    Thank you for participating and good luck!
                  </p>

                  {/* Details */}
                  {showDetails && (
                    <div className="mt-3 bg-white/10 p-4 rounded-lg border border-cyan-400 text-sm whitespace-pre-wrap leading-relaxed">
                      <h2 className="text-center text-lg font-bold mb-2 text-cyan-300">Competition Details</h2>
                      <p>{effectiveDescription || '—'}</p>
                    </div>
                  )}
                </>
              )}

              {/* Skill question step */}
              {showSkillQuestion && (
                <div className="mt-6 max-w-md mx-auto text-center">
                  <label htmlFor="skill-question" className="block font-semibold mb-1 text-white">
                    Skill Question (Required to Enter):
                  </label>
                  <p className="mb-2">{selectedQuestion?.question ?? 'Answer the question to proceed.'}</p>

                  <input
                    id="skill-question"
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-[#0f172a]/60 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    value={skillAnswer}
                    onChange={(e) => {
                      setSkillAnswer(e.target.value);
                      setAnswerError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitSkill(e);
                    }}
                    placeholder="Enter your answer"
                    style={{ maxWidth: '300px' }}
                    aria-invalid={Boolean(answerError)}
                    aria-describedby="skill-error"
                  />

                  <button
                    type="button"
                    onClick={handleSubmitSkill}
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl mt-3 hover:from-cyan-300 hover:to-blue-400 transition"
                  >
                    Enter Answer
                  </button>

                  {answerError && (
                    <p id="skill-error" className="text-sm text-red-400 mt-2">{answerError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowSkillQuestion(false)}
                    className="mt-3 text-xs text-cyan-300 hover:text-cyan-200 underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Gift modal (optional) */}
            {GiftTicketModal && (
              <GiftTicketModal
                isOpen={showGiftModal}
                onClose={() => setShowGiftModal(false)}
                preselectedCompetition={comp}
              />
            )}

            {/* Links */}
            <div className="mt-8 text-center flex flex-col gap-5">
              <button
                onClick={() => setShowDetails((prev) => !prev)}
                className="text-sm text-cyan-300 underline hover:text-cyan-200"
              >
                {showDetails ? 'Hide Competition Details' : 'View Competition Details'}
              </button>

              <Link href="/terms-conditions" className="text-sm text-cyan-300 underline hover:text-cyan-200">
                View Full Terms & Conditions
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- UI Helpers ----------------------------- */
function Stat({ label, value, highlight = false, strong = false, customClass = '', size = 'md' }) {
  const sizes = {
    xs: { pad: 'px-2 py-1',   label: 'text-[9px]',  value: 'text-[10px]' },
    sm: { pad: 'px-2.5 py-1.5', label: 'text-[10px]', value: 'text-[11px]' },
    md: { pad: 'px-3 py-2',     label: 'text-[11px]', value: 'text-[12px]' },
    lg: { pad: 'px-3.5 py-2.5', label: 'text-[12px]', value: 'text-[13px]' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={`rounded-xl border ${s.pad} ${customClass} ${
        highlight ? 'border-amber-300/30 bg-amber-300/10'
                  : !customClass ? 'border-white/10 bg-white/5' : ''
      }`}
    >
      <div className={`uppercase tracking-wide ${highlight ? 'text-amber-200' : 'text-cyan-300'} ${s.label}`}>
        {label}
      </div>
      <div className={`mt-0.5 ${strong ? 'text-white font-bold' : 'text-white/90'} ${s.value}`}>
        {value}
      </div>
    </div>
  );
}

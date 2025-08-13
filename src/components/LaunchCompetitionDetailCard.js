// src/components/LaunchCompetitionDetailCard.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@fontsource/orbitron';
import BuyTicketButton from 'components/BuyTicketButton'; // adjust to your alias if needed
import { usePiAuth } from 'context/PiAuthContext';        // keep this path consistent
import { getDescriptionForComp } from 'data/descriptions';

// Skill question helpers
import {
  getRandomQuestion,
  isCorrectAnswer as checkAnswer,
} from 'data/skill-questions';

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
  description,

  // OPTIONAL: allow parent to seed a question
  initialQuestion,
}) {
  /* -------------------- Auth (context with prop fallback) -------------------- */
  const ctx = usePiAuth?.() || {};
  const ctxUser  = ctx.user  ?? null;
  const ctxLogin = ctx.login ?? (() => {});
  const effectiveUser = userProp ?? ctxUser;
  const loginFn       = loginProp ?? ctxLogin;

  // normalize a userId for the payment flow
  const getUserId = (u) =>
    u?.id ??
    u?.uid ??
    u?.userId ??
    u?.pi_user_id ??
    u?.username ?? null;

  const effectiveUserId = getUserId(effectiveUser);

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

  // Normalize prize values
  const firstPrizeVal  = comp?.prizeBreakdown?.first ?? comp?.firstPrize ?? prize ?? comp?.prize;
  const secondPrizeVal = comp?.prizeBreakdown?.second ?? comp?.secondPrize ?? comp?.prize2;
  const thirdPrizeVal  = comp?.prizeBreakdown?.third ?? comp?.thirdPrize  ?? comp?.prize3;

  const formatPrize = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (!trimmed) return null;
      return /\bπ\b|[$€£]/.test(trimmed) ? trimmed : `${trimmed} π`;
    }
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    const formatted = n >= 1000 ? Math.round(n).toLocaleString('en-US') : n.toFixed(2);
    return `${formatted} π`;
  };

  /* -------------------- Countdown (Days Hours Mins) -------------------- */
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setNowTs(Date.now()), 60000);
    return () => clearInterval(id);
  }, [endsAt]);

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

  // Proceed button behavior
  const handleProceedClick = () => {
    if (hasValidAnswer) {
      setShowPayment(true);
      setShowSkillQuestion(false);
    } else {
      setShowSkillQuestion(true);
      setShowPayment(false);
    }
  };

  // Record + verify answer
  const handleSubmitSkill = (e) => {
    e?.preventDefault?.();
    const ok = isAnswerCorrect();
    if (ok) {
      setRecordedAnswer(String(skillAnswer).trim());
      setHasValidAnswer(true);
      setAnswerError('');
      setShowSkillQuestion(false);
      setShowPayment(false); // user presses Proceed again to reveal payment
    } else {
      setHasValidAnswer(false);
      setAnswerError('You must answer correctly to proceed.');
    }
  };

  /* --------------------------------- UI --------------------------------- */
  return (
    <div className="flex justify-center p-0 my-0 -mt-4 -mb-3">
      <div className="relative w-full max-w-xl">{/* <-- fixed w/full -> w-full */}
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

                <div className="text-lg font-bold text-cyan-300 mt-1">
                  {(() => {
                    const end = new Date(endsAt).getTime();
                    const diff = Math.max(0, end - nowTs);
                    const days = Math.floor(diff / 86400000);
                    const hours = Math.floor((diff % 86400000) / 3600000);
                    const mins = Math.floor((diff % 3600000) / 60000);
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

{/* Prizes */}
{comp?.prizeBreakdown && Object.keys(comp.prizeBreakdown).length > 0 && (
  <div className="mt-5 flex flex-col items-center gap-3">
    {Object.entries(comp.prizeBreakdown).map(([label, amount]) => (
      <div
        key={label}
        className="w-full max-w-xs flex justify-between items-center rounded-lg border border-cyan-300/50 bg-white/5 px-4 py-2 shadow-[0_0_8px_rgba(34,211,238,0.25)]"
      >
        <span className="text-[14px] uppercase tracking-wide text-cyan-300">{label}</span>
        <span
          className="text-base font-extrabold text-cyan-300 motion-safe:animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
          style={{ animationDuration: '1.1s' }}
        >
          {formatPrize(amount) ?? '—'}
        </span>
      </div>
    ))}
  </div>
)}



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
                value={comp?.winners ?? 'Multiple'}
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
                  <p className="text-cyan-300 font-semibold text-sm sm:text-base text-center mb-2">
                    Free Ticket Claimed: {quantity}/2
                  </p>

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
                  {/* Details (optional toggle area if you add a button elsewhere) */}
                  {showDetails && (
                    <div className="mt-3 bg-white/10 p-4 rounded-lg border border-cyan-400 text-sm whitespace-pre-wrap leading-relaxed">
                      <h2 className="text-center text-lg font-bold mb-2 text-cyan-300">Competition Details</h2>
                      <p>{description ?? comp?.description ?? '—'}</p>
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

  <Link
    href="/terms-conditions"
    className="text-sm text-cyan-300 underline hover:text-cyan-200"
  >
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

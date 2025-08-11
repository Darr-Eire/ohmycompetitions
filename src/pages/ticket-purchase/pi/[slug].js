// /ticket-purchase/pi/[slug].js
'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePiAuth } from 'context/PiAuthContext';
import GiftTicketModal from '@components/GiftTicketModal';
import BuyTicketButton from '@components/BuyTicketButton';
import { piItems } from '../../../data/competitions';
import descriptions from '../../../data/descriptions';

const skillQuestions = [
  { question: 'What is 2 + 2?', answer: '4' },
  { question: 'What is 3 x 3?', answer: '9' },
  { question: 'What is 10 - 5?', answer: '5' },
  { question: "Type the word 'Pi'", answer: 'pi' },
  { question: 'What is 12 ÷ 4?', answer: '3' },
];

export default function PiTicketPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = usePiAuth();

  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showSkillQuestion, setShowSkillQuestion] = useState(false);
  const [skillAnswer, setSkillAnswer] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [liveTicketsSold, setLiveTicketsSold] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchCompetition() {
      // Local data check
      const found = piItems.find((c) => c.comp.slug === slug);
      if (found) {
        setCompetition({
          ...found.comp,
          title: found.title,
          prize: found.prize,
          description: found.comp.description || found.description || '',
          imageUrl: found.imageUrl,
          thumbnail: found.thumbnail,
          totalTickets: found.comp.totalTickets,
          ticketsSold: found.comp.ticketsSold || 0,
          piAmount: found.comp.entryFee || found.piAmount || 1.0,
          startsAt: found.comp.startsAt || null,
          endsAt: found.comp.endsAt || null,
          prizeBreakdown: found.comp.prizeBreakdown || null,
          winners: found.comp.winners || 'Multiple',
          maxPerUser: found.comp.maxPerUser || null,
        });
        setLiveTicketsSold(found.comp.ticketsSold || 0);
        setDescription(descriptions[slug] || '');
        setLoading(false);
        return;
      }

      // API fetch fallback
      try {
        const res = await fetch(`/api/competitions/${slug}`);
        if (!res.ok) throw new Error('Competition not found');
        const data = await res.json();
        setCompetition({
          ...data,
          piAmount: data.entryFee || 1.0,
          prizeBreakdown: data.prizeBreakdown || null,
          winners: data.winners || 'Multiple',
          maxPerUser: data.maxTicketsPerUser || null,
        });
        setLiveTicketsSold(data.ticketsSold || 0);
        setDescription(data.description || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompetition();
  }, [slug]);

  useEffect(() => {
    if (!competition?.endsAt) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(competition.endsAt).getTime();
      setStatus(now > end ? 'ended' : 'active');
    }, 1000);
    return () => clearInterval(interval);
  }, [competition]);

  const isAnswerCorrect = () =>
    skillAnswer.trim().toLowerCase() === selectedQuestion?.answer.toLowerCase();

  const handleShowSkillQuestion = () => {
    const random = skillQuestions[Math.floor(Math.random() * skillQuestions.length)];
    setSelectedQuestion(random);
    setSkillAnswer('');
    setShowSkillQuestion(true);
  };

  if (loading || !competition) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const available = Math.max(0, competition.totalTickets - liveTicketsSold);
  const percent = competition.totalTickets
    ? Math.min(100, Math.floor((liveTicketsSold / competition.totalTickets) * 100))
    : 0;
  const totalPrice = (competition.piAmount * quantity).toFixed(2);
  const isSoldOut = available <= 0;

  return (
    <main className="min-h-screen px-4 py-10 bg-[#070d19] text-white font-orbitron flex justify-center">
      <div className="relative w-full max-w-2xl">
        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/15 via-cyan-500/10 to-blue-500/15 blur-xl" />
        <div className="relative rounded-3xl p-[1.5px] bg-[linear-gradient(135deg,rgba(0,255,213,0.6),rgba(0,119,255,0.5))]">
          <section className="rounded-3xl bg-[#0b1220]/95 backdrop-blur-xl border border-white/10 p-6 sm:p-8">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-center bg-gradient-to-r from-green-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
              {competition.title}
            </h1>
            <p className="mt-2 text-center text-cyan-300 text-sm italic">
              Your journey to victory starts here — play smart, dream big, and claim the Pi prize!
            </p>

            {/* Status */}
            {status === 'active' && (
              <div className="mt-4 text-center">
                <span className="inline-block rounded-full bg-gradient-to-r from-green-400 to-green-600 text-black font-bold px-4 py-1 animate-pulse">
                  Live Now
                </span>
              </div>
            )}
            {status === 'ended' && (
              <div className="mt-4 text-center">
                <span className="inline-block rounded-full bg-red-500 text-white font-bold px-4 py-1">
                  Closed
                </span>
              </div>
            )}

     {/* Prize Breakdown */}
{/* Prize Breakdown */}
{competition.prizeBreakdown && (
  <div className="mt-5 flex flex-col items-center gap-3">
    <div className="flex flex-wrap justify-center gap-3">
      <Stat
        label="1st Prize"
        value={`${competition.prizeBreakdown.first || '—'} π`}
        customClass="border-yellow-300/50 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-300 shadow-[0_0_15px_rgba(255,215,0,0.5)]"
      />
      <Stat
        label="2nd Prize"
        value={`${competition.prizeBreakdown.second || '—'} π`}
        customClass="border-gray-300/50 bg-gradient-to-r from-gray-300/20 to-gray-500/20 text-gray-300 shadow-[0_0_15px_rgba(192,192,192,0.5)]"
      />
      <Stat
        label="3rd Prize"
        value={`${competition.prizeBreakdown.third || '—'} π`}
        customClass="border-orange-300/50 bg-gradient-to-r from-orange-400/20 to-orange-600/20 text-orange-300 shadow-[0_0_15px_rgba(205,127,50,0.5)]"
      />
    </div>
  </div>
)}



            {/* Info */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Entry Fee" value={`${competition.piAmount} π`} />
              <Stat label="Draw Date" value={new Date(competition.endsAt).toLocaleDateString()} />
              <Stat label="Tickets Sold" value={`${liveTicketsSold} / ${competition.totalTickets}`} />
              <Stat label="Available" value={`${available} left`} />
              <Stat label="Winners" value={competition.winners} />
              {competition.maxPerUser && (
                <Stat label="Max/User" value={competition.maxPerUser} />
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-5">
              <div className="flex justify-between text-[11px] text-white/70 mb-1">
                <span>Progress</span>
                <span>{percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="bg-cyan-600 hover:bg-cyan-500 px-4 py-1 rounded-full font-bold disabled:opacity-50"
              >
                −
              </button>
              <span className="text-xl font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(available, q + 1))}
                disabled={quantity >= available}
                className="bg-cyan-600 hover:bg-cyan-500 px-4 py-1 rounded-full font-bold"
              >
                +
              </button>
            </div>
            <p className="text-center text-lg font-bold mt-2">Total: {totalPrice} π</p>

            {/* Payment Flow */}
            {!showSkillQuestion ? (
              <div className="flex flex-col gap-4 mt-4">
                <button
                  onClick={handleShowSkillQuestion}
                  className="w-full bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold py-3 rounded-xl"
                >
                  Proceed to Payment
                </button>
                {user?.username && (
                  <button
                    onClick={() => setShowGiftModal(true)}
                    className="w-full border border-cyan-400 text-cyan-300 py-3 rounded-xl font-bold hover:bg-cyan-400 hover:text-black"
                  >
                    🎁 Gift a Ticket
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-3 mt-4">
                <p className="font-semibold">{selectedQuestion?.question}</p>
                <input
                  type="text"
                  value={skillAnswer}
                  onChange={(e) => setSkillAnswer(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f172a] border border-cyan-500 text-white rounded-lg text-center"
                  placeholder="Enter your answer"
                />
                {!isAnswerCorrect() && skillAnswer && (
                  <p className="text-sm text-red-400">❌ Incorrect answer.</p>
                )}
                {isAnswerCorrect() && (
                  <BuyTicketButton
                    competitionSlug={slug}
                    entryFee={competition.piAmount}
                    quantity={quantity}
                    piUser={user}
                    endsAt={competition.endsAt}
                  />
                )}
              </div>
            )}

            <GiftTicketModal
              isOpen={showGiftModal}
              onClose={() => setShowGiftModal(false)}
              preselectedCompetition={competition}
            />

            {/* Details Toggle */}
            <div className="text-center mt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-cyan-300 hover:underline"
              >
                {showDetails ? 'Hide' : 'View'} Competition Details
              </button>
            </div>
            {showDetails && (
              <div className="mt-2 bg-white/10 p-4 rounded-lg border border-cyan-400 text-sm whitespace-pre-wrap leading-relaxed">
                <h2 className="text-center text-lg font-bold mb-2 text-cyan-300">Competition Details</h2>
                <p>{description}</p>
              </div>
            )}

            {/* Terms */}
            <div className="text-center text-sm mt-6">
              <p>
                By entering, you agree to our{' '}
                <Link href="/terms-conditions" className="underline text-cyan-400 hover:text-cyan-300">
                  Terms & Conditions
                </Link>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, customClass = '' }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-[12px] text-center ${customClass}`}
    >
      <div className="uppercase tracking-wide text-[11px] font-bold">{label}</div>
      <div className="mt-0.5 text-white font-extrabold">{value}</div>
    </div>
  );
}


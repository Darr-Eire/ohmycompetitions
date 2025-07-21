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
  { question: "What is 2 + 2?", answer: "4" },
  { question: "What is 3 x 3?", answer: "9" },
  { question: "What is 10 - 5?", answer: "5" },
  { question: "Type the word 'Pi'", answer: "pi" },
  { question: "What is 12 ÷ 4?", answer: "3" },
];

const DetailRow = ({ label, value, highlight }) => (
  <div className="flex justify-between text-sm">
    <span className="text-white">{label}</span>
    <span className={highlight ? 'text-red-400 font-bold' : ''}>{value}</span>
  </div>
);

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
  const [showDetails, setShowDetails] = useState(false);
  const [status, setStatus] = useState('active');
  const [liveTicketsSold, setLiveTicketsSold] = useState(0);

  useEffect(() => {
    if (!slug) return;
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
  location: found.location || 'Online',
  date: found.date || 'TBA',
  time: found.time || 'TBA',
  endsAt: found.comp.endsAt,
  prizeBreakdown: found.comp.prizeBreakdown || null,
  maxPerUser: found.comp.maxPerUser || null, // ✅ Add this line
});

      setLiveTicketsSold(found.comp.ticketsSold || 0);
      const desc = descriptions[slug];
      setDescription(typeof desc === 'string' ? desc : desc?.description || '');
    }
    setLoading(false);
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
      <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
    );
  }

  const available = Math.max(0, competition.totalTickets - liveTicketsSold);
  const totalPrice = (competition.piAmount * quantity).toFixed(2);
  const isSoldOut = available <= 0;

  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
      <div className="max-w-xl mx-auto bg-[#0f172a]/80 border-2 border-cyan-400 rounded-2xl shadow-[0_0_30px_#00ffd5cc] p-6 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-cyan-300 uppercase tracking-wider">
          {competition.title}
        </h1>

     

{competition?.prizeBreakdown && (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div className="bg-white/5 p-4 rounded-lg text-center border border-cyan-400">
      <p className="text-cyan-300 font-bold">
         1<span className="text-xs align-super">st</span>
      </p>
      <p className="text-cyan-300">{competition.prizeBreakdown.first}</p>
    </div>
       <div className="bg-white/5 p-4 rounded-lg text-center border border-cyan-400">
      <p className="text-cyan-300 font-bold">
         2<span className="text-xs align-super">nd</span>
      </p>
      <p className="text-cyan-300">{competition.prizeBreakdown.second}</p>
    </div>
    <div className="bg-white/5 p-4 rounded-lg text-center border border-cyan-400">
      <p className="text-cyan-300 font-bold">
         3<span className="text-xs align-super">rd</span>
      </p>
      <p className="text-cyan-300">{competition.prizeBreakdown.third}</p>
    </div>
  </div>
)}
  {status === 'active' && (
          <div className="text-lg font-bold text-black bg-gradient-to-r from-green-500 to-green-700 px-6 py-2 rounded-full shadow-lg animate-pulse text-center">
            Live Now
          </div>
        )}
<div className="space-y-2">
  <DetailRow label="Entry Fee" value={`${competition.piAmount} π`} />
  <DetailRow label="Prize" value={competition.prize} />
  <DetailRow label="Start Date" value={new Date(competition.startsAt).toLocaleDateString()} />
  <DetailRow label="Draw Date" value={new Date(competition.endsAt).toLocaleDateString()} />

  
 

  <DetailRow
    label="Tickets Sold"
    value={`${liveTicketsSold} / ${competition.totalTickets}`}
    highlight={isSoldOut}
  />
  <DetailRow
    label="Available"
    value={`${available} tickets remaining`}
    highlight={available <= 10}
  />
  {competition.maxPerUser && (
    <DetailRow label="Max Per User" value={competition.maxPerUser} />
  )}
</div>



        <div className="flex items-center justify-center gap-4 mt-4">
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

        <p className="text-center text-lg font-bold">Total: {totalPrice} π</p>

        {!showSkillQuestion ? (
          <div className="flex flex-col gap-4 mt-4">
            <button
              onClick={handleShowSkillQuestion}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 rounded-xl"
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
          <div className="text-center space-y-3">
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

        <div className="text-center mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-white hover:underline"
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

        <div className="text-center text-sm mt-6">
          <p>
            By entering, you agree to our{' '}
            <Link href="/terms-conditions" className="underline text-cyan-400 hover:text-cyan-300">
              Terms & Conditions
            </Link>.
          </p>
        </div>
      </div>
    </main>
  );
}

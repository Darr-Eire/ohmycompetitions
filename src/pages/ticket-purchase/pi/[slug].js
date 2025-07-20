'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePiAuth } from 'context/PiAuthContext';
import { piItems } from '../../../data/competitions';
import GiftTicketModal from '@components/GiftTicketModal';

const piCompetitions = {};
piItems.forEach((item) => {
  piCompetitions[item.comp.slug] = {
    ...item.comp,
    title: item.title,
    prize: item.prize,
    description: item.comp.description || item.description || '',
    imageUrl: item.imageUrl,
    thumbnail: item.thumbnail || null,
    location: item.location || 'Online',
    date: item.date || 'N/A',
    time: item.time || 'N/A',
    totalTickets: item.comp.totalTickets,
    ticketsSold: item.comp.ticketsSold || 0,
    piAmount: item.comp.entryFee || item.piAmount || 1.0,
    endsAt: item.comp.endsAt,
  };
});

export default function PiTicketPage() {
  const router = useRouter();
  const { slug } = router.query;
  const competition = piCompetitions[slug];
  const { user, loginWithPi } = usePiAuth();

  const [quantity, setQuantity] = useState(1);
  const [showTimer, setShowTimer] = useState(false);
  const [timerText, setTimerText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [skillAnswer, setSkillAnswer] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showSkillQuestion, setShowSkillQuestion] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const correctAnswer = '9';

  useEffect(() => {
    if (!competition) return;

    const updateTimer = () => {
      const diffMs = new Date(competition.endsAt).getTime() - Date.now();
      if (diffMs <= 0) {
        setShowTimer(false);
        setTimerText('Ended');
        return;
      }
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours <= 24) {
        setShowTimer(true);
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs / (1000 * 60)) % 60);
        setTimerText(`${hrs}h ${mins}m left`);
      } else {
        setShowTimer(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [competition]);

  const handlePayment = async () => {
    if (!competition) return;

    if (!user) {
      alert('Please login with Pi to enter.');
      loginWithPi();
      return;
    }

    const total = competition.piAmount * quantity;
    if (total <= 0) return alert('Invalid ticket quantity or price.');
    if (skillAnswer.trim() !== correctAnswer) return alert('Incorrect answer to the skill question.');

    setProcessing(true);

    try {
      if (!window?.Pi?.createPayment) {
        alert('⚠️ Pi SDK not ready');
        setProcessing(false);
        return;
      }

      if (!window.Pi.currentUser?.accessToken) {
        console.log('🔄 Re-authenticating...');
        await loginWithPi();
      }

      window.Pi.createPayment({
        amount: total.toFixed(8),
        memo: `Entry to ${competition.title}`,
        metadata: {
          type: 'pi-competition-entry',
          competitionSlug: slug,
          quantity,
        },
        onReadyForServerApproval: async (paymentId) => {
          const res = await fetch('/api/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, slug, amount: total }),
          });
          if (!res.ok) throw new Error(await res.text());
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            const res = await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid, slug }),
            });
            if (!res.ok) throw new Error(await res.text());
            alert('✅ Entry confirmed! Good luck!');
          } catch (err) {
            console.error('Error completing payment:', err);
            alert('❌ Server completion failed.');
          } finally {
            setProcessing(false);
          }
        },
        onCancel: () => {
          setProcessing(false);
        },
        onError: (err) => {
          console.error('❌ Payment error:', err);
          alert('❌ Payment failed.');
          setProcessing(false);
        },
      });
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Something went wrong.');
      setProcessing(false);
    }
  };

  if (!slug) return null;
  if (!competition) {
    return <p className="text-white text-center mt-12 font-orbitron">Competition not found.</p>;
  }

  const isAnswerCorrect = () => skillAnswer.trim() === correctAnswer;

  return (
    <div className="bg-[#0b1120] min-h-screen flex flex-col justify-center items-center px-6 py-10 font-orbitron text-white">
      <div className="max-w-md w-full bg-[#0d1424] border border-blue-500 rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-6">{competition.title}</h1>

        <section className="text-white text-base space-y-3">
          {[
            ['Prize', competition.prize],
            ['Entry Fee', `${competition.piAmount} π`],
            ['Total Tickets', competition.totalTickets.toLocaleString()],
            ['Tickets Sold', competition.ticketsSold.toLocaleString()],
            ['Location', competition.location],
            ['Date', competition.date],
            ['Time', competition.time],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="font-semibold">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </section>

        {showTimer && (
          <p className="text-center text-yellow-400 font-bold text-lg mt-4">⏰ {timerText}</p>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-2 text-sm text-cyan-300 hover:text-white underline block mx-auto"
        >
          {showDetails ? 'Hide' : 'View'} Competition Details
        </button>

        {showDetails && (
          <div className="mt-4 bg-white/10 p-4 rounded-lg border border-cyan-400 text-sm whitespace-pre-wrap leading-relaxed">
            <h2 className="text-center text-lg font-bold mb-2 text-cyan-300">Competition Details</h2>
            <p>{competition.description || 'No additional details available.'}</p>
          </div>
        )}

        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold disabled:opacity-50"
          >−</button>
          <span className="text-xl font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold"
          >+</button>
        </div>

        <p className="text-center text-lg font-bold mt-6">
          Total: {(competition.piAmount * quantity).toFixed(2)} π
        </p>

        {!showSkillQuestion ? (
          <div className="flex flex-col space-y-4 mt-6">
            <button
              onClick={() => setShowSkillQuestion(true)}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 rounded-xl"
            >
              Proceed to Payment
            </button>

            {user?.username && (
              <button
                onClick={() => setShowGiftModal(true)}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 rounded-xl"
              >
                🎁 Gift a Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 max-w-md mx-auto text-center">
            <label htmlFor="skill-question" className="block font-semibold mb-1">
              Skill Question (Required to Enter):
            </label>
            <p className="mb-2">What is 4 + 5?</p>
            <input
              id="skill-question"
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-[#0f172a]/60 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 mx-auto"
              value={skillAnswer}
              onChange={(e) => setSkillAnswer(e.target.value)}
              placeholder="Enter your answer"
              style={{ maxWidth: '300px' }}
            />
            {!isAnswerCorrect() && skillAnswer !== '' && (
              <p className="text-sm text-red-400 mt-1">
                You must answer correctly to proceed.
              </p>
            )}
            {isAnswerCorrect() && (
              <button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full mt-4 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transition-transform ${
                  processing ? 'cursor-not-allowed opacity-70' : 'hover:scale-105'
                }`}
              >
                {processing ? 'Processing...' : 'Pay with Pi'}
              </button>
            )}
          </div>
        )}

        <GiftTicketModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          preselectedCompetition={competition}
        />

        <p className="mt-4 text-center font-semibold">
          Pioneers, this is your chance to win big and help grow the Pi ecosystem!
        </p>

        <div className="text-center mt-4">
          <p className="text-sm">
            By entering, you agree to our{' '}
            <Link href="/terms-conditions" className="text-cyan-400 underline hover:text-cyan-300 transition-colors">
              Terms &amp; Conditions
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

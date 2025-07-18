'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePiAuth } from 'context/PiAuthContext'; // Adjust path if needed

const piCompetitions = {
  'pi-giveaway-10k': {
    title: '10,000 Pi Giveaway',
    prize: '10,000 π',
    piAmount: 2.2,
    date: 'July 31, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-08-21T00:00:00Z',
    location: 'Online',
    totalTickets: 5200,
    ticketsSold: 0,
    description: `🎉 Win 10,000 Pi Coins! Limited to 5,200 entries.\n\n🏆 Prize: 10,000 π\n📅 Ends: August 21\n💸 Entry fee: 2.2 π\n📍 Online\n\nInvite friends to boost your luck!`,
  },
  'pi-giveaway-5k': {
    title: '5,000 Pi Giveaway',
    prize: '5,000 π',
    piAmount: 1.8,
    date: 'July 31, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-08-21T00:00:00Z',
    location: 'Online',
    totalTickets: 2900,
    ticketsSold: 0,
    description: `🎁 Big drop: 5,000 π!\n\nOnly 2,900 entries available.\n\n📆 Ends August 21\n💰 Entry Fee: 1.8 π\n📍 Join from anywhere.\n\nDon’t miss it!`,
  },
  'pi-giveaway-2.5k': {
    title: '2,500 Pi Giveaway',
    prize: '2,500 π',
    piAmount: 1.6,
    date: 'July 31, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-08-21T00:00:00Z',
    location: 'Online',
    totalTickets: 1600,
    ticketsSold: 0,
    description: `🚀 Win 2,500 π!\n\n🎟️ Only 1,600 tickets.\n📅 Ends August 21.\n💸 Entry: 1.6 π.\n\nAct fast and good luck Pioneer!`,
  },
};

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
    return (
      <p className="text-white text-center mt-12 font-orbitron">
        Competition not found.
      </p>
    );
  }

  const isAnswerCorrect = () => skillAnswer.trim() === correctAnswer;

  return (
    <div className="bg-[#0b1120] min-h-screen flex flex-col justify-center items-center px-6 py-10 font-orbitron text-white">
      <div className="max-w-md w-full bg-[#0d1424] border border-blue-500 rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-6">
          {competition.title}
        </h1>

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
          <p className="text-center text-yellow-400 font-bold text-lg mt-4">
            ⏰ {timerText}
          </p>
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
            <p>{description || 'No additional details available.'}</p>

          </div>
        )}

        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold disabled:opacity-50"
          >
            −
          </button>
          <span className="text-xl font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold"
          >
            +
          </button>
        </div>

        <p className="text-center text-lg font-bold mt-6">
          Total: {(competition.piAmount * quantity).toFixed(2)} π
        </p>

        {!showSkillQuestion ? (
          <button
            onClick={() => setShowSkillQuestion(true)}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 rounded-xl mt-6"
          >
            Proceed to Payment
          </button>
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

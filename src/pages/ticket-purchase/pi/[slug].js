'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePiAuth } from 'context/PiAuthContext'; // Adjust this relative path as needed

const piCompetitions = {
  'pi-giveaway-10k': {
    title: '10,000 Pi Giveaway',
    prize: '10,000 π',
    piAmount: 2.2,
    date: 'June 28, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-06-30T00:00:00Z',
    location: 'Online',
    totalTickets: 5200,
    ticketsSold: 0,
    description: `🎉 Win 10,000 Pi Coins! This exclusive giveaway is limited to just 5,200 entries.\n\n🏆 Grand prize: 10,000 π\n📅 Entry closes: June 30th\n💸 Entry fee: 2.2 π\n📍 Location: Online\n\nInvite friends to increase your odds of winning!`
  },
  'pi-giveaway-5k': {
    title: '5,000 Pi Giveaway',
    prize: '5,000 π',
    piAmount: 1.8,
    date: 'June 29, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-06-30T00:00:00Z',
    location: 'Online',
    totalTickets: 2900,
    ticketsSold: 0,
    description: `🎁 A big Pi drop of 5,000 π is here!\n\nOnly 2,900 entries available.\n\n📆 Ending June 30th.\n💰 Entry Fee: 1.8 π\n📍 Participate from anywhere.\n\nDon't miss out on the Pi fun!`
  },
  'pi-giveaway-2.5k': {
    title: '2,500 Pi Giveaway',
    prize: '2,500 π',
    piAmount: 1.6,
    date: 'June 28, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-06-29T00:00:00Z',
    location: 'Online',
    totalTickets: 1600,
    ticketsSold: 0,
    description: `🚀 Small pool, big opportunity!\n\n🎯 Win 2,500 π for just 1.6 π per entry.\n🎟️ Only 1,600 tickets available.\n📅 Ends June 29.\n\nAct fast and good luck Pioneer!`
  },
};

export default function PiTicketPage() {
  const router = useRouter();
  const { slug } = router.query;
  const competition = piCompetitions[slug];
  const { user, loginWithPi } = usePiAuth();

  const [quantity, setQuantity] = useState(1);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [processing, setProcessing] = useState(false);
  const [skillAnswer, setSkillAnswer] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const correctAnswer = '9';

  useEffect(() => {
    if (!competition) return;

    const updateTimer = () => {
      const diff = new Date(competition.endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [competition]);

  const handlePayment = async () => {
    if (!competition) return;

    if (!user) {
      alert('Please login with Pi to enter the competition');
      loginWithPi();
      return;
    }

    const total = competition.piAmount * quantity;

    if (total <= 0) return alert('Invalid ticket quantity or price.');
    if (Object.values(timeLeft).every(v => v === 0)) return alert('This competition has ended.');
    if (skillAnswer.trim() !== correctAnswer) return alert('Incorrect answer to the skill question.');

    setProcessing(true);

    try {
      if (!window?.Pi?.createPayment) {
        alert('⚠️ Pi SDK not ready');
        setProcessing(false);
        return;
      }

      if (!window.Pi.currentUser?.accessToken) {
        console.log('🔄 Re-authenticating to ensure payment scope...');
        await loginWithPi();
      }

      // Check for incomplete payments first
      try {
        const incompletePayment = await window.Pi.getIncompletePayment();
        if (incompletePayment) {
          console.log('🔄 Found incomplete payment, handling first:', incompletePayment);
          await fetch('/api/pi/incomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              payment: incompletePayment,
              slug: incompletePayment.metadata?.competitionSlug || slug 
            })
          });
        }
      } catch (err) {
        console.warn('⚠️ Error checking incomplete payments:', err);
      }

      window.Pi.createPayment(
        {
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
            console.log('✅ Payment approved');
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              const res = await fetch('/api/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid, slug }),
              });
              if (!res.ok) throw new Error(await res.text());
              console.log('✅ Payment completed');
              alert('✅ Entry confirmed! Good luck!');
            } catch (err) {
              console.error('Error completing payment:', err);
              alert('❌ Server completion failed.');
            } finally {
              setProcessing(false);
            }
          },
          onCancel: () => {
            console.warn('❌ Payment cancelled');
            setProcessing(false);
          },
          onError: (err) => {
            console.error('❌ Payment error:', err);
            alert('❌ Payment failed. See console for details.');
            setProcessing(false);
          },
        }
      );
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

  return (
    <div className="bg-[#0b1120] min-h-screen flex flex-col justify-center items-center px-6 py-10 font-orbitron text-white">
      <div className="max-w-md w-full bg-[#0d1424] border border-blue-500 rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-6">
          {competition.title}
        </h1>

        <section className="text-white text-base max-w-md mx-auto text-left space-y-3">
          {[
            ['Prize', competition.prize],
            ['Entry Fee', `${competition.piAmount} π`],
            ['Total Tickets', competition.totalTickets.toLocaleString()],
            ['Tickets Sold', competition.ticketsSold.toLocaleString()],
            ['Location', competition.location],
            ['Date', competition.date],
            ['Time', competition.time],
            ['Time Left', `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="font-semibold">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </section>

        {/* Competition Details Toggle */}
        <button
          onClick={() => setShowDetails(prev => !prev)}
          className="w-full mt-6 text-center bg-cyan-700 hover:bg-cyan-600 transition px-4 py-2 rounded-md font-semibold"
        >
          {showDetails ? 'Hide Competition Details ▲' : 'Show Competition Details ▼'}
        </button>

        {showDetails && (
          <div className="mt-4 bg-white/10 p-4 rounded-lg border border-cyan-400 text-sm whitespace-pre-wrap leading-relaxed text-white">
            <h2 className="text-center text-lg font-bold mb-2 text-cyan-300">Competition Details</h2>
            <p>{competition.description || 'No additional details available.'}</p>
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
          <span className="text-xl font-bold min-w-[3rem] text-center">{quantity}</span>
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

        <div className="mt-4">
          <label htmlFor="skill-question" className="block font-semibold mb-2">
            Skill Question (required):
          </label>
          <p className="text-sm mb-1">What is 4 + 5?</p>
          <input
            id="skill-question"
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={skillAnswer}
            onChange={(e) => setSkillAnswer(e.target.value)}
            placeholder="Enter your answer"
          />
          {skillAnswer.trim() !== '' && skillAnswer.trim() !== correctAnswer && (
            <p className="text-sm text-red-400 mt-1">You must answer correctly to proceed.</p>
          )}
        </div>

        <button
          onClick={handlePayment}
          disabled={processing || skillAnswer.trim() !== correctAnswer || Object.values(timeLeft).every(v => v === 0)}
          className={`w-full mt-6 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transition-transform ${
            processing || skillAnswer.trim() !== correctAnswer || Object.values(timeLeft).every(v => v === 0) ? 'cursor-not-allowed opacity-70' : 'hover:scale-105'
          }`}
        >
          {Object.values(timeLeft).every(v => v === 0) ? 'Competition Ended' : processing ? 'Processing...' : 'Pay with Pi'}
        </button>

        <p className="mt-4 text-center text-white font-semibold">
          Pioneers, this is your chance to win big and help grow the Pi ecosystem!
        </p>

        <div className="text-center mt-4">
          <p className="text-sm text-white">
            By entering, you agree to our{' '}
            <Link href="/terms-conditions" className="text-cyan-400 underline hover:text-cyan-300 transition-colors">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

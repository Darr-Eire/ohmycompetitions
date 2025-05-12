'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import GhostWinnerLog from '@/components/GhostWinnerLog';
import ClaimedWinnersLog from '@/components/ClaimedWinnersLog';

export default function PiCashCodePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [codeData, setCodeData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const ticketPrice = 1.25;
  const totalPrice = (ticketPrice * quantity).toFixed(2);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchCode = async () => {
      const res = await fetch('/api/pi-cash-code');
      const data = await res.json();
      setCodeData(data);
      setLoading(false);
    };
    fetchCode();
  }, []);

  useEffect(() => {
    if (!codeData?.expiresAt) return;

    const getRemainingTime = (end) => {
      const total = Date.parse(end) - Date.now();
      const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      return { total, days, hours, minutes, seconds };
    };

    const timer = setInterval(() => {
      const updated = getRemainingTime(codeData.expiresAt);
      setTimeLeft(updated);
      if (updated.total <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [codeData?.expiresAt]);

  const handleConfirmTicket = async () => {
    if (!session?.user) {
      alert('⚠️ Please log in with Pi Network first.');
      return;
    }

    try {
      const payment = await window.Pi.createPayment({
        amount: totalPrice,
        memo: `Pi Cash Code Ticket x${quantity}`,
        metadata: {
          type: 'pi-cash-ticket',
          week: codeData?.weekStart?.split('T')[0],
          quantity,
        },
      });

      if (payment?.transaction?.txid) {
        await fetch('/api/pi-cash-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txid: payment.transaction.txid,
            userId: session.user.id,
            week: codeData?.weekStart?.split('T')[0],
            quantity,
          }),
        });

        alert('✅ Ticket confirmed! Good luck 🍀');
      } else {
        alert('❌ Payment not approved.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Payment failed or was cancelled.');
    }
  };

  if (loading) {
    return <div className="text-center text-white py-20">Loading Pi Cash Code...</div>;
  }

  return (
    <main className="flex justify-center items-start min-h-screen bg-transparent font-orbitron pt-6">
      <div className="backdrop-blur-lg border border-cyan-400 neon-outline text-white p-6 sm:p-8 rounded-2xl text-center space-y-6 shadow-[0_0_40px_#00ffd5aa] max-w-3xl w-full mx-auto mt-6 relative overflow-hidden">

        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300 animate-glow-float">Pi Cash Code</h1>

        {/* Code Display */}
        <div className="flex flex-col items-center space-y-3">
          <div className="bg-[#101426] border-2 border-cyan-400 rounded-xl px-6 py-3 text-2xl font-mono text-cyan-300 tracking-widest shadow-[0_0_20px_#00ffd5aa]">
            {codeData?.code}
          </div>
          <div className="bg-black border border-cyan-400 text-cyan-300 text-lg font-bold px-4 py-2 rounded-lg shadow-[0_0_15px_#00f0ff88]">
            Current Prize Pool: {codeData?.prizePool.toLocaleString()} π
          </div>
        </div>

        {/* Timer Display */}
        <div className="mt-6 flex flex-col items-center">
          <div className="flex gap-2 sm:gap-4">
            {[
              { label: 'DAYS', value: timeLeft.days },
              { label: 'HRS', value: timeLeft.hours },
              { label: 'MIN', value: timeLeft.minutes },
              { label: 'SEC', value: timeLeft.seconds },
            ].map(({ label, value }, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-black text-white text-xl sm:text-2xl font-bold px-4 py-2 rounded-md shadow-[0_0_10px_#00f0ff99] w-16 text-center">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="mt-1 text-xs text-cyan-400 font-semibold tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Quantity Selector */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
            className="bg-cyan-500 text-black font-bold px-4 py-1 rounded-full hover:brightness-110"
          >
            −
          </button>
          <span className="text-2xl font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity(prev => prev + 1)}
            className="bg-cyan-500 text-black font-bold px-4 py-1 rounded-full hover:brightness-110"
          >
            +
          </button>
        </div>
        <p className="text-cyan-300 mt-2 font-semibold text-sm">Total: {totalPrice} π</p>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmTicket}
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-lg px-6 py-3 rounded-lg shadow-[0_0_20px_#00ffd5aa] hover:brightness-110 transition"
        >
          Enter Now
        </button>

        {/* How It Works */}
        <section className="mt-8">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-cyan-300 mb-2">How It Works</h2>
            <ul className="list-disc list-inside text-white/90 space-y-2 text-left inline-block text-sm sm:text-base">
              <li>The code drops every Monday at <strong>3:14 PM UTC</strong>.</li>
              <li>It remains active for <strong>31 hours and 4 minutes</strong>.</li>
              <li>Friday draw at <strong>3:14 PM UTC</strong>.</li>
              <li>The winner must return the code within <strong>31 minutes and 4 seconds</strong>.</li>
            </ul>
          </div>
        </section>

        {/* Logs */}
        <section className="mt-10 space-y-6">
          <div className="bg-[#0b1120] bg-opacity-50 backdrop-blur-md border border-cyan-400 rounded-xl p-4 shadow-[0_0_20px_#00ffd5aa]">
            <h2 className="text-xl font-bold text-cyan-300 mb-2">👻 Ghost Winner Log</h2>
            <GhostWinnerLog />
          </div>

          <div className="bg-[#0b1120] bg-opacity-50 backdrop-blur-md border border-green-400 rounded-xl p-4 shadow-[0_0_20px_#00ffbf88]">
            <h2 className="text-xl font-bold text-green-300 mb-2">🏅 Claimed Winners</h2>
            <ClaimedWinnersLog />
          </div>
        </section>
      </div>
    </main>
  );
}

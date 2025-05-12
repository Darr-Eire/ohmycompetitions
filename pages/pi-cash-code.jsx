'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import GhostWinnerLog from '@/components/GhostWinnerLog';
import ClaimedWinnersLog from '@/components/ClaimedWinnersLog';
import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';

export default function PiCashCodePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [codeData, setCodeData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const ticketPrice = 1.25;
  const totalPrice = (ticketPrice * quantity).toFixed(2);

  useEffect(() => {
    const fetchCode = async () => {
      const res = await fetch('/api/pi-cash-code');
      const data = await res.json();
      setCodeData(data);
      setLoading(false);
    };
    fetchCode();
  }, []);

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
          quantity
        }
      });

      if (payment?.transaction?.txid) {
        await fetch('/api/pi-cash-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txid: payment.transaction.txid,
            userId: session.user.id,
            week: codeData?.weekStart?.split('T')[0],
            quantity
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

        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300 animate-glow-float"> Pi Cash Code</h1>

        <div className="flex flex-col items-center space-y-3">
          <div className="bg-[#101426] border-2 border-cyan-400 rounded-xl px-6 py-3 text-2xl font-mono text-cyan-300 tracking-widest shadow-[0_0_20px_#00ffd5aa]">
            {codeData?.code}
          </div>
          <div className="bg-[#0f0c29] text-white text-lg font-semibold px-4 py-2 border border-cyan-400 rounded-lg shadow-[0_0_10px_#00ffd5aa]">
             Prize Pool: <span className="text-cyan-300">{codeData?.prizePool} Pi</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <FlipClockCountdown
            to={new Date(codeData.expiresAt)}
            labels={['DAYS', 'HOURS', 'MINUTES', 'SECONDS']}
            labelStyle={{
              fontSize: 14,
              fontWeight: 500,
              textTransform: 'uppercase',
              color: '#00ffd5',
            }}
            digitBlockStyle={{
              width: 50,
              height: 60,
              fontSize: 40,
              backgroundColor: '#0f0c29',
              color: '#fff',
            }}
            dividerStyle={{ color: '#00ffd5' }}
            separatorStyle={{ color: '#00ffd5' }}
          />
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

        <button
          onClick={handleConfirmTicket}
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-lg px-6 py-3 rounded-lg shadow-[0_0_20px_#00ffd5aa] hover:brightness-110 transition"
        >
           Confirm Ticket Purchase
        </button>

      <section className="mt-8">
  <div className="max-w-xl mx-auto text-center">
    <h2 className="text-2xl font-bold text-cyan-300 mb-2"> How It Works</h2>
    <ul className="list-disc list-inside text-white/90 space-y-2 text-left inline-block text-sm sm:text-base">
      <li>The code drops every Monday at <strong>3:14 PM UTC</strong>.</li>
      <li>It remains active for <strong>31 hours and 4 minutes</strong>.</li>
      <li>Friday draw at <strong>3:14 PM UTC</strong>.</li>
      <li>Winner has <strong>31 minutes and 4 seconds</strong> to submit the code.</li>
      <li>If missed, prize <strong>rolls over +25%</strong>.</li>
      <li><strong>20%</strong> of tickets roll into next week.</li>
    </ul>
  </div>
</section>


        <section className="mt-8">
          <h2 className="text-2xl font-bold text-yellow-300">📅 Upcoming Draw</h2>
          <p className="mt-2">
            ⏱️ Friday @ 3:14 PM UTC →{' '}
            <span className="font-bold">{new Date(codeData?.drawAt).toUTCString()}</span>
          </p>
          <p>
            💰 Prize: <span className="text-yellow-300 font-bold">{codeData?.prizePool} π</span>
          </p>
        </section>

        <section className="mt-8 text-left">
          <h2 className="text-xl font-bold text-gray-200 mb-2">👻 Ghost Winner Log</h2>
          <GhostWinnerLog />
        </section>

        <section className="mt-8 text-left">
          <h2 className="text-xl font-bold text-green-400 mb-2">🏅 Claimed Winners</h2>
          <ClaimedWinnersLog />
        </section>
      </div>
    </main>
  );
}

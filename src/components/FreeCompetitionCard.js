'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import '@fontsource/orbitron';

export default function FreeCompetitionCard({ comp, title, prize, userHandle }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [hasClaimed, setHasClaimed] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  const endsAt = comp?.endsAt || new Date().toISOString();

  const formattedDate = new Date(endsAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const status = 'LIVE';
  const sold = comp.ticketsSold ?? 0;
  const total = comp.totalTickets ?? 100;
  const percent = Math.min(100, Math.floor((sold / total) * 100));

  useEffect(() => {
    if (!endsAt) return;
    const end = new Date(endsAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  useEffect(() => {
    const claimed = localStorage.getItem(`free_claim_${comp.slug}`);
    if (claimed) {
      setHasClaimed(true);
    }
  }, [comp.slug]);

 const handleClaimFreeTicket = () => {
  localStorage.setItem(`free_claim_${comp.slug}`, true);
  setHasClaimed(true);
  alert('✅ You successfully claimed your free ticket!');

  // ✅ STEP 3 — Referral Logic
  const referrer = localStorage.getItem('referral_user');
  if (referrer) {
    const prev = parseInt(localStorage.getItem(`referrals_${referrer}`) || '0', 10);
    localStorage.setItem(`referrals_${referrer}`, prev + 1);
  }
};

  useEffect(() => {
    const referrals = parseInt(localStorage.getItem(`referrals_${comp.slug}`) || '0', 10);
    setReferralCount(referrals);
  }, [comp.slug]);

  const referralUrl = `https://yourapp.com/ticket-purchase/${comp.slug}?ref=${userHandle}`;
  const shareText = encodeURIComponent(`Join me on this Pi Competition and claim your free entry! 🎟 ${referralUrl}`);

  return (
    <section className="w-full py-10 px-4 bg-gradient-to-r from-[#111827] to-[#0f172a] rounded-2xl border border-cyan-400 shadow-[0_0_40px_#00f2ff44] text-white font-orbitron max-w-2xl mx-auto text-center space-y-6">

       {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
        ✦ {title} ✦
      </h2>
     
      {/* Header */}
      <div className="flex justify-center items-center gap-4 text-sm">
        <span className="bg-white/10 px-3 py-1 rounded-full text-cyan-200 font-medium">
          📅 {formattedDate}
        </span>
        <span className="bg-green-300 text-black font-bold px-3 py-1 rounded-full animate-pulse">
          {status}
        </span>
      </div>

    

      {/* Full Details Section */}
      <div className="bg-white/5 rounded-lg p-4 text-sm space-y-2">
        <p><span className="font-semibold text-cyan-300">Prize:</span> {prize}</p>
                <p><span className="font-semibold text-cyan-300">Entry Fee:</span> <span className="font-bold">FREE</span></p>

        <p><span className="font-semibold text-cyan-300">Date:</span> {formattedDate}</p>
       
        <p><span className="font-semibold text-cyan-300">Total Tickets:</span> {total.toLocaleString()}</p>
    <p><span className="font-semibold text-cyan-300">Location:</span> {comp.location || 'Online Global Draw'}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00ffd5] via-blue-400 to-[#0077ff]" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Sold: <span className="text-white">{sold.toLocaleString()}</span> / {total.toLocaleString()} ({percent}%)
        </p>
      </div>

      {!hasClaimed ? (
        <button onClick={handleClaimFreeTicket} className="mt-6 w-full max-w-xs mx-auto py-3 px-6 rounded-lg font-bold text-sm bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black hover:scale-105 transition-transform duration-200 shadow-lg">
          🎟 Claim My Free Entry
        </button>
      ) : (
        <div className="space-y-4">
          <p className="font-semibold text-green-300">✅ You've claimed your free ticket!</p>

          <div className="bg-white/10 p-3 rounded-lg text-sm">
            <p className="mb-2 text-cyan-300 font-semibold">Refer friends & earn extra entries:</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-3">
    <a 
      href={`https://twitter.com/intent/tweet?text=${shareText}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-black hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg shadow"
    >
      Share on X
    </a>

    <a 
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent('Join me on this Pi Competition and claim your free entry! 🎟')}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
    >
      Share on Facebook
    </a>
  </div>


            <p className="mt-4 text-green-400 font-semibold">
              Bonus tickets earned: {referralCount}
            </p>
          </div>
        </div>
      )}

      {/* T&Cs link */}
      <div className="text-center pt-4">
        <Link href="/terms-conditions" className="text-sm text-cyan-300 underline hover:text-cyan-400">
          View Full Terms & Conditions
        </Link>
      </div>
    </section>
  );
}

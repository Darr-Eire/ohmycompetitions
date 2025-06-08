'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import '@fontsource/orbitron';

export default function CompetitionCard({
  comp,
  title,
  prize,
  fee,
  imageUrl,
  endsAt = comp?.endsAt || new Date().toISOString(),
  hideButton = false,
  children
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('UPCOMING');

  useEffect(() => {
    if (!endsAt || comp?.comingSoon) {
      setTimeLeft('');
      setStatus('COMING SOON');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(endsAt).getTime();
      let diff = end - now;

      if (diff <= 0) {
        setTimeLeft('');
        setStatus('ENDED');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      diff -= hrs * (1000 * 60 * 60);
      const mins = Math.floor(diff / (1000 * 60));
      diff -= mins * (1000 * 60);
      const secs = Math.floor(diff / 1000);

      let timeStr = '';
      if (days > 0) timeStr += `${days}D `;
      if (hrs > 0 || days > 0) timeStr += `${hrs}H `;
      if (mins > 0 || hrs > 0 || days > 0) timeStr += `${mins}M `;
      if (days === 0 && hrs === 0) timeStr += `${secs}S`;

      setTimeLeft(timeStr.trim());
      setStatus('LIVE NOW');
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt, comp?.comingSoon]);

  const sold = comp?.ticketsSold ?? 0;
  const total = comp?.totalTickets ?? 100;
  const percent = Math.min(100, Math.floor((sold / total) * 100));

  return (
    <div className="flex flex-col w-full max-w-xs mx-auto h-full bg-[#0f172a] border border-cyan-600 rounded-xl shadow-lg text-white font-orbitron overflow-hidden transition-all duration-300 hover:scale-[1.03]">

      {/* Title */}
      <div className="card-header-gradient px-4 py-2 flex justify-center items-center">
        <span className="text-sm sm:text-base font-semibold text-black">
          {title}
        </span>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-black overflow-hidden">
        <Image src={imageUrl || '/pi.jpeg'} alt={title} fill className="object-cover" priority />
      </div>

      {/* Status Banner */}
      <div className="px-4 pt-2">
        <div className={`w-full text-center px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow 
          ${status === 'LIVE'
            ? 'bg-gradient-to-r from-[#00ff99] to-[#00cc66] text-black animate-pulse'
            : status === 'COMING SOON'
              ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'
              : 'bg-red-500 text-white'}`}>
          {status === 'COMING SOON' ? 'Coming Soon' : status}
        </div>
      </div>

      {/* LIVE timer */}
      {status === 'LIVE' && (
        <div className="flex justify-center items-center gap-3 px-4 pt-3">
          <div className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-3 py-1 rounded-lg">
            <p className="text-sm text-black font-mono font-bold">{timeLeft}</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4 text-xs sm:text-sm text-center space-y-3">

        <div className="flex justify-between">
          <span className="text-cyan-300 font-semibold">Prize:</span>
          <span>{prize}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-300 font-semibold">Starts:</span>
          <span>
            {comp?.startsAt
              ? new Date(comp.startsAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'TBA'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-300 font-semibold">Entry Fee:</span>
          <span>{fee}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-cyan-300 font-semibold">Total Tickets:</span>
          <span>{total.toLocaleString()}</span>
        </div>

        <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${percent}%` }} />
        </div>

        <p className="text-gray-300 text-xs">Sold: {sold.toLocaleString()} ({percent}%)</p>
      </div>

      {/* Button */}
      {children ? children : !hideButton && (
        <div className="p-4 pt-0 mt-auto">
          <Link href={`/ticket-purchase/${comp?.slug}`}>
            <button
              className={`w-full py-2 rounded-md font-bold text-black shadow 
                ${comp?.comingSoon 
                  ? 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff] opacity-60 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff]'}
              `}
              disabled={comp?.comingSoon}
            >
              Enter Now
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

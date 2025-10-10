'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SlugCard({ comp }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [showCountdown, setShowCountdown] = useState(false);
  const now = new Date();
  const endsAt = new Date(comp.endsAt);
  const startsAt = new Date(comp.startsAt);
  const ticketsSold = comp.ticketsSold || 0;
  const totalTickets = comp.totalTickets || 100;
  const percent = Math.min(100, Math.floor((ticketsSold / totalTickets) * 100));
  const timeDiff = endsAt.getTime() - now.getTime();

  useEffect(() => {
    if (timeDiff <= 24 * 60 * 60 * 1000) {
      setShowCountdown(true);
      const interval = setInterval(() => {
        const diff = endsAt.getTime() - Date.now();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [comp.endsAt]);

  const isLive = now >= startsAt && now < endsAt;
  const isUpcoming = now < startsAt;
  const isEnded = now >= endsAt;

  const status = isEnded ? 'ENDED' : isUpcoming ? 'COMING SOON' : 'LIVE NOW';
  const statusColor = isEnded ? 'bg-red-600' : isUpcoming ? 'bg-yellow-500' : 'bg-green-600';

  return (
    <div className="bg-[#0f172a] border border-cyan-500 rounded-xl overflow-hidden shadow-lg w-full max-w-sm">
      <div className="relative w-full h-52">
        <Image
          src={comp.thumbnail || comp.imageUrl}
          alt={comp.title}
          layout="fill"
          objectFit="cover"
        />
      </div>

      <div className="p-4 text-white space-y-1">
        <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold ${statusColor}`}>
          {status}
        </span>

        {showCountdown && (
          <div className="text-cyan-300 font-semibold text-sm">⏳ {timeLeft}</div>
        )}

        <h2 className="text-xl font-bold">{comp.title}</h2>

        <p><span className="font-semibold">Prize:</span> {comp.prize}</p>
        <p><span className="font-semibold">Starts:</span> {startsAt.toLocaleString('en-GB')}</p>
        <p><span className="font-semibold">Entry Fee:</span> {comp.entryFee} π</p>
        <p><span className="font-semibold">Total Tickets:</span> {totalTickets.toLocaleString()}</p>
        <p><span className="font-semibold">Tickets:</span> {ticketsSold} / {totalTickets}</p>

        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
          <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${percent}%` }} />
        </div>

        <Link
          href={`/ticket-purchase/${comp.slug}`}
          className="block text-center mt-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 rounded-lg hover:opacity-90"
        >
          Enter Now
        </Link>
      </div>
    </div>
  );
}

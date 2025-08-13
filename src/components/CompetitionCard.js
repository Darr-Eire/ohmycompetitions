'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePiAuth } from 'context/PiAuthContext';
import GiftTicketModal from './GiftTicketModal';
import '@fontsource/orbitron';

export default function CompetitionCard({
  comp,
  title,
  prize,
  fee,
  imageUrl,
  endsAt = comp?.comp?.endsAt || comp?.endsAt || new Date().toISOString(),
  hideButton = false,
  disableGift = false,
  children
}) {
  const { user } = usePiAuth();

  // ─── Normalize any Windows-style paths into valid Next.js src ─────────
  const normalizedImageUrl = (imageUrl || '/pi.jpeg')
    .replace(/\\/g, '/')                    // backslashes → forward slashes
    .replace(/^(?!\/|https?:\/\/)/, '/');   // ensure leading slash if not already

  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('UPCOMING');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    if (!endsAt || comp?.comingSoon) {
      setTimeLeft('');
      setStatus('COMING SOON');
      setShowCountdown(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(comp?.comp?.startsAt || comp?.startsAt).getTime();
      const end = new Date(endsAt).getTime();

      if (now < start) {
        setTimeLeft('');
        setStatus('UPCOMING');
        setShowCountdown(false);
        return;
      }

      let diff = end - now;
      if (diff <= 0) {
        setTimeLeft('');
        setStatus('ENDED');
        setShowCountdown(false);
        clearInterval(interval);
        return;
      }

      const oneDay = 24 * 60 * 60 * 1000;
      setShowCountdown(diff <= oneDay);

      const days = Math.floor(diff / oneDay);
      diff -= days * oneDay;
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
  }, [endsAt, comp?.comingSoon, comp?.comp?.startsAt, comp?.startsAt]);

  const sold = comp?.comp?.ticketsSold || comp?.ticketsSold || 0;
  const total = comp?.comp?.totalTickets || comp?.totalTickets || 100;
  const remaining = Math.max(0, total - sold);
  const soldOutPercentage = (sold / total) * 100;

  const isExternalUrl = (url) =>
    url.startsWith('http://') || url.startsWith('https://');

  const isSoldOut = sold >= total;
  const isLowStock = remaining <= total * 0.1 && remaining > 0;
  const isNearlyFull = remaining <= total * 0.25 && remaining > 0;

  const isGiftable =
    status === 'LIVE NOW' && !isSoldOut && (comp?.comp?.slug || comp?.slug);

  const handleGiftClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowGiftModal(true);
  };

  return (
    <>
      <div className="flex flex-col w-full max-w-xs mx-auto h-full bg-[#0f172a] border border-cyan-600 rounded-xl shadow-lg text-white font-orbitron overflow-hidden transition-all duration-300 hover:scale-[1.03]">

        {/* Title */}
        <div className="card-header-gradient px-4 py-2 flex justify-center items-center">
          <span className="text-sm sm:text-base font-semibold text-black">
            {title}
          </span>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[16/9] bg-black overflow-hidden">
          {isExternalUrl(normalizedImageUrl) ? (
            <img
              src={normalizedImageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={normalizedImageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Status Banner + Sub-Banner */}
        <div className="px-4 pt-2">
          {/* Main Status Pill */}
          <div
            className={`w-full text-center px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow 
              ${
                status === 'LIVE NOW'
                  ? 'bg-gradient-to-r from-[#00ff99] to-[#00cc66] text-black animate-pulse'
                  : status === 'COMING SOON'
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'
                  : status === 'UPCOMING'
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'
                  : 'bg-red-500 text-white'
              }`}
          >
            {status === 'COMING SOON'
              ? 'Coming Soon'
              : status === 'UPCOMING'
              ? 'Upcoming'
              : status}
          </div>

          {/* Pre-Tickets Sub-Banner */}
          {status === 'UPCOMING' && (
            <div className="w-full text-center mt-1 px-2 py-1 rounded-full bg-blue-600 text-white text-[0.65rem] sm:text-xs font-medium">
              Pre Tickets Available
            </div>
          )}
        </div>

        {/* Live Timer */}
        {status === 'LIVE NOW' && (
          <div className="flex justify-center items-center gap-3 px-4 pt-3">
            <div className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-3 py-1 rounded-lg">
              <p className="text-sm text-black font-mono font-bold">
                {timeLeft}
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="p-4 text-xs sm:text-sm text-center space-y-3">
          <div className="flex justify-between">
            <span className="text-cyan-300 font-semibold">Prize:</span>
            <span>{prize}</span>
          </div>


<div className="flex justify-between">
  <span className="text-cyan-300 font-semibold">Winners:</span>
  <span>
    {comp?.winnersCount ??
     comp?.comp?.winnersCount ??
     'TBA'}
  </span>
</div>



          <div className="flex justify-between mt-1">
            <span className="text-cyan-300 font-semibold">Draw Date:</span>
            <span>
              {(comp?.comp?.endsAt || comp?.endsAt)
                ? new Date(comp.comp?.endsAt || comp.endsAt).toLocaleString(
                    undefined,
                    {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )
                : 'TBA'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyan-300 font-semibold">Entry Fee:</span>
            <span>{status === 'COMING SOON' ? 'TBA' : fee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyan-300 font-semibold">Total Tickets:</span>
            <span>
              {status === 'COMING SOON' ? 'TBA' : total.toLocaleString()}
            </span>
          </div>
<div className="flex justify-between">
  <span className="text-cyan-300 font-semibold">Max Per User:</span>
  <span>
    {comp?.maxPerUser ??
     comp?.comp?.maxPerUser ??
     'TBA'}
  </span>
</div>

          {/* Tickets Sold & Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-cyan-300">Tickets Sold</span>
              <div className="text-right">
                {status === 'COMING SOON' ? (
                  <span className="text-sm font-semibold text-gray-300">
                    TBA
                  </span>
                ) : (
                  <span
                    className={`text-sm font-semibold ${
                      isSoldOut
                        ? 'text-red-400'
                        : isLowStock
                        ? 'text-orange-400'
                        : isNearlyFull
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {sold.toLocaleString()} / {total.toLocaleString()}
                  </span>
                )}
                {isSoldOut && (
                  <div className="text-xs text-red-400 font-bold">SOLD OUT</div>
                )}
                {isLowStock && !isSoldOut && (
                  <div className="text-xs text-orange-400 font-bold">
                    Only {remaining} left!
                  </div>
                )}
                {isNearlyFull && !isLowStock && !isSoldOut && (
                  <div className="text-xs text-yellow-400">
                    {remaining} remaining
                  </div>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              {status === 'COMING SOON' ? (
                <div className="h-2 w-[20%] bg-gray-400 rounded-full animate-pulse" />
              ) : (
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isSoldOut
                      ? 'bg-red-500'
                      : isLowStock
                      ? 'bg-orange-500'
                      : isNearlyFull
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(soldOutPercentage, 100)}%` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {children ? (
          children
        ) : (
          !hideButton && (
            <div className="p-4 pt-0 mt-auto space-y-2">
              {comp?.comp?.slug || comp?.slug ? (
                <Link href={`/ticket-purchase/${comp.comp?.slug || comp.slug}`}>
                  <button className="w-full py-2 rounded-md font-bold text-black shadow bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:from-[#00e6c7] hover:to-[#0066e6]">
                    Enter Now
                  </button>
                </Link>
              ) : (
                <button className="w-full py-2 rounded-md font-bold text-white bg-gray-500">
                  Not Available
                </button>
              )}
              {isGiftable && !disableGift && user?.username && (
                <button
                  onClick={handleGiftClick}
                  className="w-full py-2 rounded-md font-bold text-cyan-400 border border-cyan-400 hover:bg-cyan-400 hover:text-black transition-colors duration-200"
                >
                  Gift Ticket
                </button>
              )}
            </div>
          )
        )}
      </div>

      {/* Gift Modal */}
      <GiftTicketModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        preselectedCompetition={comp}
      />
    </>
  );
}

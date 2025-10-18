'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePiAuth } from 'context/PiAuthContext';
import { useSafeTranslation } from '../hooks/useSafeTranslation';
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
  const { t } = useSafeTranslation();
  const { user } = usePiAuth();

  const normalizedImageUrl = (imageUrl || '/pi.jpeg')
    .replace(/\\/g, '/')
    .replace(/^(?!\/|https?:\/\/)/, '/');

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

      // show countdown only within the last 48 hours before draw date
      const twoDays = 48 * 60 * 60 * 1000;
      setShowCountdown(now >= start && diff <= twoDays);

      const oneDay = 24 * 60 * 60 * 1000;
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

  // ---- winners: only show if there's a real number; hide TBA ----
  const rawWinners = comp?.winnersCount ?? comp?.comp?.winnersCount;
  const winnersNum = Number(rawWinners);
  const showWinners = Number.isFinite(winnersNum) && winnersNum > 0;

  return (
    <>
      <div className="flex flex-col w-full min-w-[280px] max-w-sm mx-auto h-full min-h-[500px] bg-[#0f172a] border border-cyan-600 rounded-xl shadow-lg text-white font-orbitron overflow-hidden transition-all duration-300 hover:scale-[1.03]">

      
     {/*Title*/}
     <div className="text-center mb-2">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-1">
            {t('exclusive_draw', 'Exclusive Draw')}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00ffd5] to-[#0077ff] drop-shadow-[0_0_6px_#00e5ff80]">
            {title || comp?.title}
          </h3>
        </div>
        {/* Image */}
        <div className="relative w-full aspect-[16/9] bg-black overflow-hidden flex-shrink-0">
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
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
        </div>

        {/* Status Banner + Sub-Banner */}
        <div className="px-3 pt-2 flex-shrink-0">
          {/* Main Status Pill */}
          <div
            className={`w-full text-center px-2 py-1 rounded-full text-xs font-bold shadow
              ${
                status === 'LIVE NOW'
                  ? 'bg-gradient-to-r from-[#00ff99] to-[#00cc66] text-black animate-pulse'
                  : status === 'COMING SOON' || status === 'UPCOMING'
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-black'
                  : 'bg-red-500 text-white'
              }`}
          >
            {status === 'COMING SOON'
              ? t('coming_soon', 'Coming Soon')
              : status === 'UPCOMING'
              ? t('upcoming', 'Upcoming')
              : status}
          </div>

          {/* Pre-Tickets Sub-Banner */}
          {status === 'UPCOMING' && (
            <div className="w-full text-center mt-1 px-1 py-0.5 rounded-full bg-blue-600 text-white text-[0.6rem] font-medium">
              {t('pre_tickets_available', 'Pre Tickets Available')}
            </div>
          )}
        </div>

        {/* Live Timer (only visible inside last 48h before draw) */}
        {status === 'LIVE NOW' && showCountdown && (
          <div className="flex justify-center items-center gap-2 px-3 pt-2 flex-shrink-0">
            <div className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-2 py-0.5 rounded-lg">
              <p className="text-sm text-black font-mono font-bold">
                {timeLeft}
              </p>
            </div>
          </div>
        )}

        {/* Info Section (match PiCompetitionCard sizing) */}
        <div className="p-3 text-sm text-center space-y-2 flex-grow overflow-hidden">
          <div className="flex justify-between">
            <span className="text-cyan-300 font-semibold">{t('prize', 'Prize')}:</span>
            <span className="font-medium">{prize}</span>
          </div>

          <div className="flex justify-between mt-1">
            <span className="text-cyan-300 font-semibold">{t('draw_date', 'Draw Date')}:</span>
            <span className="font-medium">
              {(comp?.comp?.endsAt || comp?.endsAt)
                ? new Date(comp.comp?.endsAt || comp.endsAt).toLocaleString(
                    undefined,
                    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                  )
                : t('tba', 'TBA')}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-cyan-300 font-semibold">{t('entry_fee', 'Entry Fee')}:</span>
            <span className="font-medium">{status === 'COMING SOON' ? t('tba', 'TBA') : fee}</span>
          </div>

          {/* Winners: only render when we have a real number */}
          {showWinners && (
            <div className="flex justify-between">
              <span className="text-cyan-300 font-semibold">{t('winners', 'Winners')}:</span>
              <span className="font-medium">{winnersNum.toLocaleString()}</span>
            </div>
          )}

          {/* Tickets Sold & Progress */}
          <div className="space-y-1 mt-2 flex-shrink-0">
            <div className="flex justify-between items-center text-sm">
              <span className="text-cyan-300">{t('tickets_sold', 'Tickets Sold')}</span>
              <div className="text-right">
                {status === 'COMING SOON' ? (
                  <span className="font-semibold text-gray-300">
                    {t('tba', 'TBA')}
                  </span>
                ) : (
                  <span
                    className={`font-semibold ${
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
                  <div className="text-red-400 font-bold">{t('sold_out', 'SOLD OUT')}</div>
                )}
                {isLowStock && !isSoldOut && (
                  <div className="text-orange-400 font-bold">
                    {t('only_left', 'Only {remaining} left!', { remaining })}
                  </div>
                )}
                {isNearlyFull && !isLowStock && !isSoldOut && (
                  <div className="text-yellow-400">
                    {t('remaining', '{remaining} remaining', { remaining })}
                  </div>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              {status === 'COMING SOON' ? (
                <div className="h-1.5 w-[20%] bg-gray-400 rounded-full animate-pulse" />
              ) : (
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
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
            <div className="p-3 pt-0 mt-auto space-y-2 flex-shrink-0">
              {comp?.comp?.slug || comp?.slug ? (
                <Link href={`/ticket-purchase/${comp.comp?.slug || comp.slug}`}>
                  <button className="w-full py-2 rounded-md font-bold text-black shadow bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:from-[#00e6c7] hover:to-[#0066e6] text-sm">
                    {t('enter_now', 'Enter Now')}
                  </button>
                </Link>
              ) : (
                <button className="w-full py-2 rounded-md font-bold text-white bg-gray-500 text-sm">
                  {t('not_available', 'Not Available')}
                </button>
              )}
              {isGiftable && !disableGift && user?.username && (
                <button
                  onClick={handleGiftClick}
                  className="w-full py-2 rounded-md font-bold text-cyan-400 border border-cyan-400 hover:bg-cyan-400 hover:text-black transition-colors duration-200 text-sm"
                >
                  {t('gift_ticket', 'Gift Ticket')}
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

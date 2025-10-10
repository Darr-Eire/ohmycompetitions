'use client';

import { useState } from 'react';
import Image from 'next/image';

// Enhanced Ticket Card Component with proper theming
function EnhancedTicketCard({ ticket, theme = 'tech', compressed = false }) {
  if (!ticket) return null;

  const drawDate = new Date(ticket.drawDate || ticket.endsAt);
  const isActive = new Date() < drawDate;

  let statusLabel = '✅ Purchased';
  let statusColor = 'text-cyan-400';
  if (ticket.gifted) {
    statusLabel = '🎁 Gifted';
    statusColor = 'text-yellow-400';
  }
  if (ticket.earned) {
    statusLabel = '💸 Earned';
    statusColor = 'text-green-400';
  }

  const themeStyles = {
    tech: 'border-blue-500 bg-gradient-to-br from-blue-900/20 to-blue-800/20 shadow-blue-500/20',
    premium: 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-purple-800/20 shadow-purple-500/20',
    pi: 'border-yellow-500 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 shadow-yellow-500/20',
    daily: 'border-green-500 bg-gradient-to-br from-green-900/20 to-green-800/20 shadow-green-500/20',
    crypto: 'border-orange-500 bg-gradient-to-br from-orange-900/20 to-orange-800/20 shadow-orange-500/20',
    free: 'border-cyan-500 bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 shadow-cyan-500/20',
    cashcode: 'border-pink-500 bg-gradient-to-br from-pink-900/20 to-pink-800/20 shadow-pink-500/20'
  };

  const cardWidth = compressed ? 'w-48' : 'w-64';
  const imageHeight = compressed ? 'h-24' : 'h-32';

  const getThemeLabel = (theme) => {
    const labels = {
      tech: 'Featured',
      premium: 'Travel',
      pi: 'Pi Competition',
      daily: 'Daily',
      crypto: 'Crypto',
      free: 'Free Entry',
      cashcode: 'Pi Cash Code'
    };
    return labels[theme] || 'Competition';
  };

  return (
    <div className={`${cardWidth} bg-[#1e293b] text-white border-2 rounded-xl shadow-xl p-3 space-y-2 shrink-0 transition-all duration-300 hover:scale-105 ${themeStyles[theme] || themeStyles.tech}`}>
      <div className="text-center space-y-1">
        <div className="flex justify-center">
          <span className="text-[10px] px-2 py-1 rounded-full bg-black/30 text-white font-medium">
            {getThemeLabel(theme)}
          </span>
        </div>
        <h3 className="text-sm font-bold truncate">{ticket.competitionTitle}</h3>
        <span className={`text-xs font-medium ${statusColor} block`}>{statusLabel}</span>
      </div>

      <div className="relative">
        <Image
          src={ticket.imageUrl || '/images/default-prize.png'}
          alt="Prize"
          width={300}
          height={compressed ? 96 : 128}
          className={`w-full object-cover rounded-md ${imageHeight}`}
        />
        <div className={`absolute top-1 right-1 px-1 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
          {isActive ? 'LIVE' : 'ENDED'}
        </div>
      </div>

      <div className="grid grid-cols-2 text-xs gap-1">
        <p className="col-span-2 text-cyan-300 font-medium truncate">{ticket.prize}</p>
        <p><span className="text-gray-400">🎟</span> {ticket.quantity}</p>
        <p><span className="text-gray-400">💰</span> {(ticket.entryFee || 0).toFixed(2)} π</p>
        <p><span className="text-gray-400">🕒</span> {drawDate.toLocaleDateString()}</p>
        <p><span className="text-gray-400">🎯</span> {isActive ? 'Active' : 'Closed'}</p>
      </div>

      {!compressed && ticket.ticketNumbers && ticket.ticketNumbers.length > 0 && (
        <div className="border-t border-gray-600 pt-2">
          <div className="text-[10px] text-white max-h-24 overflow-y-auto">
            <strong className="text-cyan-400 block mb-1">🎫 Ticket IDs:</strong>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {ticket.ticketNumbers.map((id, i) => (
                <span
                  key={i}
                  className="bg-cyan-900/40 border border-cyan-400 text-cyan-300 px-2 py-[2px] rounded-full"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {ticket.gifted && ticket.giftedBy && (
        <div className="text-[10px] text-yellow-300 bg-yellow-900/20 p-1 rounded">
          🎁 From: {ticket.giftedBy}
        </div>
      )}
    </div>
  );
}

// Compressed Ticket View
function CompressedTicketView({ tickets, theme }) {
  const [expanded, setExpanded] = useState(false);
  const ticketCount = tickets.length;
  const totalQuantity = tickets.reduce((sum, t) => sum + (t.quantity || 0), 0);

  if (ticketCount === 0) return null;

  const representativeTicket = tickets[0];

  const themeStyles = {
    tech: 'border-blue-500',
    premium: 'border-purple-500',
    pi: 'border-yellow-500',
    daily: 'border-green-500',
    crypto: 'border-orange-500',
    free: 'border-cyan-500',
    cashcode: 'border-pink-500'
  };

  const getThemeDisplayName = (theme) => {
    const names = {
      tech: 'Featured',
      premium: 'Travel',
      pi: 'Pi Competitions',
      daily: 'Daily',
      crypto: 'Crypto',
      free: 'Free',
      cashcode: 'Pi Cash Code'
    };
    return names[theme] || theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  return (
    <div className={`bg-[#1e293b] border-2 ${themeStyles[theme] || themeStyles.tech} rounded-xl p-4 space-y-3 shadow-lg`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-white">
            {getThemeDisplayName(theme)} Tickets
          </h3>
          <p className="text-xs text-white">
            {ticketCount} competitions • {totalQuantity} total tickets
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors px-2 py-1 rounded bg-cyan-900/20"
        >
          {expanded ? '📄 Show Less' : '📋 Show All'}
        </button>
      </div>

      <div className="text-xs text-gray-300 bg-black/20 p-2 rounded">
        Latest: {representativeTicket.competitionTitle}
      </div>

      {expanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tickets.map((ticket, index) => (
            <EnhancedTicketCard
              key={index}
              ticket={ticket}
              theme={theme}
              compressed={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <EnhancedTicketCard
            ticket={representativeTicket}
            theme={theme}
            compressed={true}
          />
        </div>
      )}
    </div>
  );
}

export { EnhancedTicketCard, CompressedTicketView };
export default EnhancedTicketCard;

import { useState, useEffect } from 'react';

// Base ticket card component
function BaseTicketCard({ ticket, children, borderColor = 'border-cyan-300' }) {
  if (!ticket) return null;

  const drawDate = new Date(ticket.drawDate);
  const isActive = new Date() < drawDate;

  let statusLabel = '✅ Purchased';
  let statusColor = 'text-green-400';
  
  if (ticket.gifted) {
    statusLabel = '🎁 Gifted';
    statusColor = 'text-yellow-400';
  }
  if (ticket.earned) {
    statusLabel = '💎 Earned';
    statusColor = 'text-purple-400';
  }

  return (
    <div className={`bg-[#1e293b] text-white ${borderColor} rounded-xl shadow-lg p-3 space-y-2 font-mono text-center w-[70vw] max-w-sm mx-2 shrink-0 border`}>
      <h3 className="text-base font-bold flex flex-col items-center">
        {ticket.competitionTitle}
        <span className={`text-xs font-medium mt-1 ${statusColor}`}>{statusLabel}</span>
      </h3>
      
      <img
        src={ticket.imageUrl}
        alt="Prize"
        className="w-full object-cover rounded-md max-h-44"
        onError={(e) => {
          e.target.src = '/images/default.jpg';
        }}
      />
      
      <div className="grid grid-cols-2 text-xs gap-2 mt-2">
        <p className="col-span-2 text-cyan-300 font-medium">{ticket.prize}</p>
        <p>🎟 {ticket.quantity}</p>
        <p>💰 {ticket.entryFee.toFixed(2)} π</p>
        <p>🕒 {drawDate.toLocaleDateString()}</p>
        <p>{isActive ? '🟢 Active' : '🔴 Closed'}</p>
      </div>
      
      {children}
      
      <p className="text-[10px] text-gray-400">
        {ticket.ticketNumbers.length > 0 ? `IDs: ${ticket.ticketNumbers.join(', ')}` : 'No ticket numbers'}
      </p>
    </div>
  );
}

// Pi Competition Ticket Card
export function PiTicketCard({ ticket }) {
  return (
    <BaseTicketCard ticket={ticket} borderColor="border-orange-400">
      <div className="bg-orange-500/20 p-2 rounded text-xs">
        <p className="text-orange-300 font-semibold">🟡 Pi Competition</p>
        <p className="text-orange-200">Win Pi cryptocurrency!</p>
      </div>
    </BaseTicketCard>
  );
}

// Crypto Competition Ticket Card
export function CryptoTicketCard({ ticket }) {
  return (
    <BaseTicketCard ticket={ticket} borderColor="border-purple-400">
      <div className="bg-purple-500/20 p-2 rounded text-xs">
        <p className="text-purple-300 font-semibold">₿ Crypto Giveaway</p>
        <p className="text-purple-200">Win digital currencies!</p>
      </div>
    </BaseTicketCard>
  );
}

// Daily Competition Ticket Card
export function DailyTicketCard({ ticket }) {
  return (
    <BaseTicketCard ticket={ticket} borderColor="border-blue-400">
      <div className="bg-blue-500/20 p-2 rounded text-xs">
        <p className="text-blue-300 font-semibold">⚡ Daily Competition</p>
        <p className="text-blue-200">Fast & frequent draws!</p>
      </div>
    </BaseTicketCard>
  );
}

// Free Competition Ticket Card
export function FreeTicketCard({ ticket }) {
  return (
    <BaseTicketCard ticket={ticket} borderColor="border-green-400">
      <div className="bg-green-500/20 p-2 rounded text-xs">
        <p className="text-green-300 font-semibold">🆓 Free Competition</p>
        <p className="text-green-200">No entry fee required!</p>
      </div>
    </BaseTicketCard>
  );
}

// Featured/Travel Competition Ticket Card
export function FeaturedTicketCard({ ticket }) {
  const isTravel = ticket.theme === 'premium';
  
  return (
    <BaseTicketCard ticket={ticket} borderColor={isTravel ? "border-gold-400" : "border-cyan-400"}>
      <div className={`${isTravel ? 'bg-yellow-500/20' : 'bg-cyan-500/20'} p-2 rounded text-xs`}>
        <p className={`${isTravel ? 'text-yellow-300' : 'text-cyan-300'} font-semibold`}>
          {isTravel ? '✈️ Travel & Lifestyle' : '🏆 Featured Competition'}
        </p>
        <p className={isTravel ? 'text-yellow-200' : 'text-cyan-200'}>
          {isTravel ? 'Luxury experiences!' : 'Premium prizes!'}
        </p>
      </div>
    </BaseTicketCard>
  );
}

// Main ticket card selector component
export default function TicketCardSelector({ ticket }) {
  if (!ticket) return null;

  switch (ticket.theme) {
    case 'pi':
      return <PiTicketCard ticket={ticket} />;
    case 'crypto':
      return <CryptoTicketCard ticket={ticket} />;
    case 'daily':
      return <DailyTicketCard ticket={ticket} />;
    case 'free':
      return <FreeTicketCard ticket={ticket} />;
    case 'premium':
      return <FeaturedTicketCard ticket={ticket} />;
    case 'tech':
    default:
      return <FeaturedTicketCard ticket={ticket} />;
  }
} 
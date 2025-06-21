'use client';

import { useState, useEffect } from 'react';

// TicketCard with status and category support
function TicketCard({ ticket }) {
  if (!ticket) return null;

  const drawDate = new Date(ticket.drawDate);
  const isActive = new Date() < drawDate;

  let statusLabel = '✅ Purchased';
  if (ticket.gifted) statusLabel = '🎁 Gifted';
  if (ticket.earned) statusLabel = '💸 Earned';

  return (
    <div className="bg-[#1e293b] text-white border border-cyan-300 rounded-xl shadow-lg p-4 space-y-3 font-mono text-center w-[85vw] max-w-sm mx-2 shrink-0">
      <h3 className="text-lg font-bold flex flex-col items-center">
        {ticket.competitionTitle}
        <span className="text-xs font-medium text-cyan-400 mt-1">{statusLabel}</span>
      </h3>
      <img
        src={ticket.imageUrl}
        alt="Prize"
        className="w-full object-cover rounded-md max-h-48"
      />
      <div className="grid grid-cols-2 text-sm gap-2 mt-2">
        <p className="col-span-2 text-cyan-300 font-medium">{ticket.prize}</p>
        <p>🎟 Tickets: {ticket.quantity}</p>
        <p>💰 {ticket.entryFee.toFixed(2)} π</p>
        <p>🕒 {drawDate.toLocaleDateString()}</p>
        <p>{isActive ? '🟢 Active' : '🔴 Closed'}</p>
      </div>
      <p className="text-xs text-gray-400">Ticket IDs: {ticket.ticketNumbers.join(', ')}</p>
    </div>
  );
}

export default function MyTickets() {
  const [filter, setFilter] = useState('all');
  const [groupedTickets, setGroupedTickets] = useState([]);

  const tickets = [
    {
      competitionTitle: 'PS5 Mega Bundle',
      prize: 'PlayStation 5 + Extra Controller',
      entryFee: 0.4,
      quantity: 2,
      drawDate: '2025-07-01T18:00:00Z',
      ticketNumbers: ['A101', 'A102'],
      imageUrl: '/images/playstation.jpeg',
      theme: 'tech',
    },
    {
      competitionTitle: 'Dubai Luxury Holiday',
      prize: '7-Day Dubai Trip',
      entryFee: 2.5,
      quantity: 1,
      drawDate: '2025-06-30T22:00:00Z',
      ticketNumbers: ['D001'],
      imageUrl: '/images/dubai-luxury-holiday.jpg',
      theme: 'premium',
    },
    {
      competitionTitle: '10,000 Pi',
      prize: '10,000 π',
      entryFee: 2.2,
      quantity: 1,
      drawDate: '2025-06-30T00:00:00Z',
      ticketNumbers: ['P314'],
      imageUrl: '/images/100000.png',
      earned: true,
      theme: 'pi',
    },
    {
      competitionTitle: 'Daily Jackpot',
      prize: '750 π',
      entryFee: 0.45,
      quantity: 1,
      drawDate: '2025-06-30T23:59:59Z',
      ticketNumbers: ['DJ001'],
      imageUrl: '/images/daily-jackpot.jpg',
      theme: 'daily',
    },
    {
      competitionTitle: 'Win 1 BTC',
      prize: '1 BTC',
      entryFee: 0.5,
      quantity: 1,
      drawDate: '2025-06-02T00:59:00Z',
      ticketNumbers: ['BTC001'],
      imageUrl: '/images/crypto-btc.png',
      theme: 'crypto',
    },
    {
      competitionTitle: 'Pi To The Moon',
      prize: '10,000 π',
      entryFee: 0,
      quantity: 1,
      drawDate: '2025-08-31T18:00:00Z',
      ticketNumbers: ['FREE001'],
      imageUrl: '/images/100000.png',
      theme: 'free',
    },
    {
      competitionTitle: 'Pi Cash Code',
      prize: 'Secret Pi Reward',
      entryFee: 0,
      quantity: 1,
      drawDate: '2025-07-15T15:14:00Z',
      ticketNumbers: ['PCC001'],
      imageUrl: '/images/cashcode.png',
      theme: 'cashcode',
    },

  ];

  useEffect(() => {
    const seen = new Set();
    const grouped = [];
    for (const ticket of tickets) {
      if (!seen.has(ticket.competitionTitle)) {
        grouped.push(ticket);
        seen.add(ticket.competitionTitle);
      }
    }
    setGroupedTickets(grouped);
  }, []);

  const filtered = filter === 'all'
    ? groupedTickets
    : groupedTickets.filter((t) => t.theme === filter);

  return (
   <div className="bg-[#0f172a] border border-cyan-600 rounded-xl p-4 text-sm text-white w-full">
  <h2 className="text-center text-xl font-bold mb-4 text-white">My Tickets</h2>

  <div className="space-y-3">
    <select
      className="w-full p-2 rounded text-sm bg-[#1e293b] text-white border border-cyan-400"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <option value="all">All</option>
      <option value="tech">Featured</option>
      <option value="premium">Travel</option>
      <option value="pi">Pi Competitions</option>
      <option value="daily">Daily</option>
      <option value="crypto">Crypto</option>
      <option value="free">Free</option>
      <option value="cashcode">Pi Cash Code</option>
 
    </select>

    {filtered.length > 0 ? (
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory space-x-3">
        {filtered.map((ticket, index) => (
          <div key={index} className="snap-center shrink-0">
            <TicketCard ticket={ticket} />
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-400">No tickets found in this category.</p>
    )}
  </div>
</div>

  );
}

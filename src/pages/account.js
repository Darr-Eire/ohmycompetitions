'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { countries } from 'data/countries';
import TicketCard from 'components/TicketCard';
import ReferralStatsCard from 'components/ReferralStatsCard';

export default function Account() {
  const [tickets, setTickets] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('Ireland');
  const [giftUsername, setGiftUsername] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [message, setMessage] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [filter, setFilter] = useState('all');
  const [filteredTicket, setFilteredTicket] = useState(null);

  useEffect(() => {
    const mockTickets = [
      {
        competitionTitle: 'PS5 Bundle',
        prize: 'PlayStation 5',
        entryFee: 0.4,
        quantity: 2,
        drawDate: '2025-07-01T12:00:00Z',
        purchasedAt: new Date().toISOString(),
        ticketNumbers: ['A123', 'A124'],
        imageUrl: '/images/playstation.jpeg',
        gifted: false,
        claimed: false,
      },
      {
        competitionTitle: '55" Smart TV',
        prize: '55-inch 4K HDR TV',
        entryFee: 0.45,
        quantity: 1,
        drawDate: '2025-06-01T12:00:00Z',
        purchasedAt: new Date().toISOString(),
        ticketNumbers: ['B001'],
        imageUrl: '/images/tv.jpg',
        gifted: true,
        claimed: true,
      },
    ];

    setTickets(mockTickets);
  }, []);

  useEffect(() => {
    const now = new Date();
    let list = [];

    switch (filter) {
      case 'active':
        list = tickets.filter(t => new Date(t.drawDate) > now && !t.claimed);
        break;
      case 'inactive':
        list = tickets.filter(t => new Date(t.drawDate) <= now);
        break;
      case 'upcoming':
        list = tickets.filter(t => new Date(t.drawDate) > now);
        break;
      case 'gifted':
        list = tickets.filter(t => t.gifted);
        break;
      default:
        list = tickets;
    }

    setFilteredTicket(list.length > 0 ? list[0] : null);
  }, [filter, tickets]);

  const totalPurchased = tickets.reduce((sum, t) => sum + (t.quantity || 0), 0);
  const totalGifted = tickets.filter(t => t.gifted).reduce((sum, t) => sum + (t.quantity || 0), 0);
  const totalEarned = tickets.filter(t => !t.gifted).reduce((sum, t) => sum + (t.quantity || 0), 0);

  return (
    <div className="bg-[#1e293b] min-h-screen max-w-md mx-auto p-4 text-white space-y-8">

      {/* Profile Card */}
      <div className="border border-cyan-600 rounded-2xl p-6 text-center shadow-lg space-y-4">
        <h2 className="text-xl font-bold">darreire2020</h2>
        <p className="text-sm text-white">ID: v127473</p>


        <div className="grid grid-cols-2 gap-2 text-[10px] text-left mt-2">
          <div className="bg-[#0f172a] p-2 rounded-md border border-cyan-600">
            <p className="text-gray-400 mb-1">🔢 Tickets Bought</p>
            <p className="text-white font-semibold text-sm">{totalPurchased}</p>
          </div>
          <div className="bg-[#0f172a] p-2 rounded-md border border-cyan-600">
            <p className="text-gray-400 mb-1">📅Tickets Joined</p>
            <p className="text-white font-semibold text-sm">16/06/2025</p>
          </div>
          <div className="bg-[#0f172a] p-2 rounded-md border border-yellow-400">
            <p className="text-gray-400 mb-1">🎁Tickets Gifted</p>
            <p className="text-white font-semibold text-sm">{totalGifted}</p>
          </div>
          <div className="bg-[#0f172a] p-2 rounded-md border border-green-500">
            <p className="text-gray-400 mb-1">🏅Tickets Earned</p>
            <p className="text-white font-semibold text-sm">{totalEarned}</p>
          </div>
        </div>
      </div>
{/* Competition Category Filter + View */}
<div className="space-y-3">



  {filteredTicket ? (
    <TicketCard ticket={filteredTicket} />
  ) : (
    <p className="text-center text-white/70">No ticket found for this category.</p>
  )}
</div>



      {/* Referrals */}
      <ReferralStatsCard
        username="darreire2020-7c734d"
        signupCount={7}
        ticketsEarned={7}
        miniGamesBonus={3}
      />

      {/* Gift a Ticket */}
    <div className="bg-gradient-to-r from-[#0f172a]/80 via-[#1e293b]/90 to-[#0f172a]/80 border border-cyan-400 rounded-2xl shadow-[0_0_40px_#00ffd533] p-6 space-y-6">
  <div className="text-center space-y-1">
    <h2 className="text-xl font-bold text-white">Gift a Ticket</h2>
    <p className="text-sm text-gray-400">Give a fellow Pioneer who deserves it.</p>
  </div>

  <div className="space-y-4">
    <div>
      <label className="block mb-1 text-sm font-medium text-white">Recipient Username</label>
      <input
        type="text"
        placeholder="@exampleuser"
        className="w-full p-2 rounded bg-[#1e293b] text-white border border-cyan-600 placeholder-gray-400"
        value={giftUsername}
        onChange={(e) => setGiftUsername(e.target.value)}
      />
    </div>

    <div>
      <label className="block mb-1 text-sm font-medium text-white">Select Competition</label>
      <select
        className="w-full p-2 rounded bg-[#1e293b] text-white border border-cyan-600"
        value={selectedCompetition}
        onChange={(e) => {
          setSelectedCompetition(e.target.value);
          setTicketQuantity(1);
        }}
      >
        <option value="">-- Select --</option>
        <option value="ps5">PS5 Mega Bundle — 0.4 π</option>
        <option value="dubai">Dubai Luxury Holiday — 2.5 π</option>
        <option value="pi10k">10,000 Pi — 2.2 π</option>
        <option value="daily">Daily Jackpot — 0.45 π</option>
        <option value="btc">Win 1 BTC — 0.5 π</option>
        <option value="moon">Pi To The Moon — 0 π</option>
        <option value="cashcode">Pi Cash Code — 0 π</option>
     
      </select>
    </div>

    <div>
      <label className="block mb-1 text-sm font-medium text-white">Quantity to Purchase</label>
      <select
        className="w-full p-2 rounded bg-[#1e293b] text-white border border-cyan-600"
        value={ticketQuantity}
        onChange={(e) => setTicketQuantity(parseInt(e.target.value))}
        disabled={selectedCompetition === ''}
      >
        <option value="">-- Select Quantity --</option>
        {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
          <option key={num} value={num}>{num}</option>
        ))}
      </select>
    </div>

    <button
      className="bg-green-600 hover:bg-green-700 transition-colors w-full py-2 font-semibold rounded"
      onClick={async () => {
        const comps = {
          ps5: { title: 'PS5 Mega Bundle', entryFee: 0.4 },
          dubai: { title: 'Dubai Luxury Holiday', entryFee: 2.5 },
          pi10k: { title: '10,000 Pi', entryFee: 2.2 },
          daily: { title: 'Daily Jackpot', entryFee: 0.45 },
          btc: { title: 'Win 1 BTC', entryFee: 0.5 },
          moon: { title: 'Pi To The Moon', entryFee: 0 },
          cashcode: { title: 'Pi Cash Code', entryFee: 0 },
      
        };

        const selected = comps[selectedCompetition];

        if (!giftUsername || !selectedCompetition || ticketQuantity < 1) {
          return setMessage('⚠️ Please complete all fields.');
        }

        try {
          setMessage('⏳ Processing...');
          await axios.post('/api/tickets/purchase-and-gift', {
            competition: selected.title,
            recipient: giftUsername.replace('@', '').trim(),
            quantity: ticketQuantity,
            entryFee: selected.entryFee,
            purchaseNew: true,
          });

          setMessage(`✅ Sent ${ticketQuantity} ticket(s) to ${giftUsername}`);
          setGiftUsername('');
          setSelectedCompetition('');
          setTicketQuantity(1);
        } catch (err) {
          console.error(err);
          setMessage('❌ Failed to purchase and send tickets.');
        }
      }}
    >
      {(() => {
        const comps = {
          ps5: 0.4,
          dubai: 2.5,
          pi10k: 2.2,
          daily: 0.45,
          btc: 0.5,
          moon: 0,
          cashcode: 0,
      
        };
        const fee = comps[selectedCompetition] || 0;
        const total = (ticketQuantity * fee).toFixed(2);
        return `Purchase & Send (${ticketQuantity} = ${total} π)`;
      })()}
    </button>
  </div>

  {message && <p className="mt-4 text-center text-cyan-300">{message}</p>}
</div>

    </div>
  );
}

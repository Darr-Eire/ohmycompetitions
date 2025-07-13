'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Enhanced Ticket Card Component with proper theming for all ticket types
function TicketCard({ ticket, theme = 'tech', compressed = false }) {
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

  // Enhanced theme-based styling for different ticket types
  const themeStyles = {
    // Featured & Travel (same card style but different colors)
    tech: 'border-blue-500 bg-gradient-to-br from-blue-900/20 to-blue-800/20 shadow-blue-500/20',
    premium: 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-purple-800/20 shadow-purple-500/20',
    
    // Pi Tickets  
    pi: 'border-yellow-500 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 shadow-yellow-500/20',
    
    // Daily Tickets
    daily: 'border-green-500 bg-gradient-to-br from-green-900/20 to-green-800/20 shadow-green-500/20',
    
    // Crypto Tickets
    crypto: 'border-orange-500 bg-gradient-to-br from-orange-900/20 to-orange-800/20 shadow-orange-500/20',
    
    // Free Tickets
    free: 'border-cyan-500 bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 shadow-cyan-500/20',
    
    // Pi Cash Code
    cashcode: 'border-pink-500 bg-gradient-to-br from-pink-900/20 to-pink-800/20 shadow-pink-500/20'
  };

  const cardWidth = compressed ? 'w-48' : 'w-64';
  const imageHeight = compressed ? 'h-24' : 'h-32';

  // Get theme label for display
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
      {/* Header with competition type badge */}
      <div className="text-center space-y-1">
        <div className="flex justify-center">
          <span className="text-[10px] px-2 py-1 rounded-full bg-black/30 text-gray-300 font-medium">
            {getThemeLabel(theme)}
          </span>
        </div>
        <h3 className="text-sm font-bold truncate">{ticket.competitionTitle}</h3>
        <span className={`text-xs font-medium ${statusColor} block`}>{statusLabel}</span>
      </div>
      
      {/* Competition Image */}
      <div className="relative">
        <Image
          src={ticket.imageUrl || '/images/default-prize.png'}
          alt="Prize"
          width={300}
          height={compressed ? 96 : 128}
          className={`w-full object-cover rounded-md ${imageHeight}`}
        />
        {/* Status overlay */}
        <div className={`absolute top-1 right-1 px-1 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
          {isActive ? 'LIVE' : 'ENDED'}
        </div>
      </div>
      
      {/* Ticket Details Grid */}
      <div className="grid grid-cols-2 text-xs gap-1">
        <p className="col-span-2 text-cyan-300 font-medium truncate">{ticket.prize}</p>
        <p><span className="text-gray-400">🎟</span> {ticket.quantity}</p>
        <p><span className="text-gray-400">💰</span> {(ticket.entryFee || 0).toFixed(2)} π</p>
        <p><span className="text-gray-400">🕒</span> {drawDate.toLocaleDateString()}</p>
        <p><span className="text-gray-400">🎯</span> {isActive ? 'Active' : 'Closed'}</p>
      </div>
      
      {/* Ticket Numbers (only show in full view) */}
      {!compressed && ticket.ticketNumbers && ticket.ticketNumbers.length > 0 && (
        <div className="border-t border-gray-600 pt-2">
          <p className="text-[10px] text-gray-400 truncate">
            Ticket IDs: {ticket.ticketNumbers.join(', ')}
          </p>
        </div>
      )}

      {/* Special indicators for gifted tickets */}
      {ticket.gifted && ticket.giftedBy && (
        <div className="text-[10px] text-yellow-300 bg-yellow-900/20 p-1 rounded">
          🎁 From: {ticket.giftedBy}
        </div>
      )}
    </div>
  );
}

// Compressed ticket view for when user has many tickets of the same type
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
      pi: 'Pi Competition',
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
          <p className="text-xs text-gray-400">
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
        <div className="flex overflow-x-auto space-x-3 pb-2">
          {tickets.map((ticket, index) => (
            <TicketCard 
              key={index} 
              ticket={ticket} 
              theme={theme} 
              compressed={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <TicketCard 
            ticket={representativeTicket} 
            theme={theme} 
            compressed={true}
          />
        </div>
      )}
    </div>
  );
}

// Main component for displaying user's tickets with filtering and categorization
export default function MyTickets({ tickets = [], showFilter = true }) {
  const [filter, setFilter] = useState('all');
  const [groupedTickets, setGroupedTickets] = useState({});

  // Categorize tickets by competition type
  const categorizeTicket = (ticket) => {
    const slug = ticket.competitionSlug?.toLowerCase() || '';
    const title = ticket.competitionTitle?.toLowerCase() || '';
    
    // Premium & Travel (check first before tech)
    if (slug.includes('dubai') || slug.includes('holiday') || title.includes('travel') ||
        title.includes('luxury') || title.includes('spa') || title.includes('yacht') ||
        slug.includes('penthouse') || title.includes('penthouse') || 
        slug.includes('weekend') || title.includes('weekend') ||
        slug.includes('getaway') || title.includes('getaway') ||
        slug.includes('flight') || title.includes('flight') ||
        slug.includes('hotel') || title.includes('hotel')) {
      return 'premium';
    }
    
    // Tech competitions
    if (slug.includes('ps5') || slug.includes('xbox') || slug.includes('nintendo') || 
        slug.includes('tv') || slug.includes('macbook') || title.includes('gaming') ||
        title.includes('tech')) {
      return 'tech';
    }
    
    // Pi Competitions
    if (slug.includes('pi-') || title.includes('pi ') || slug.includes('pioneer')) return 'pi';
    
    // Daily competitions
    if (slug.includes('daily') || title.includes('daily')) return 'daily';
    
    // Crypto competitions
    if (slug.includes('btc') || slug.includes('crypto') || title.includes('btc') || title.includes('crypto')) return 'crypto';
    
    // Free competitions
    if (slug.includes('free') || slug.includes('moon') || ticket.entryFee === 0) return 'free';
    
    // Pi Cash Code
    if (slug.includes('cash-code') || title.includes('cash code')) return 'cashcode';
    
    return 'tech'; // default fallback
  };

  // Group tickets by category
  useEffect(() => {
    const grouped = tickets.reduce((acc, ticket) => {
      const category = categorizeTicket(ticket);
      if (!acc[category]) acc[category] = [];
      acc[category].push(ticket);
      return acc;
    }, {});
    setGroupedTickets(grouped);
  }, [tickets]);

  // Filter tickets
  const getFilteredTickets = () => {
    const now = new Date();
    let filtered = [...tickets];

    switch (filter) {
      case 'active':
        filtered = tickets.filter(t => new Date(t.drawDate || t.endsAt) > now);
        break;
      case 'completed':
        filtered = tickets.filter(t => new Date(t.drawDate || t.endsAt) <= now);
        break;
      case 'gifted':
        filtered = tickets.filter(t => t.gifted);
        break;
      case 'earned':
        filtered = tickets.filter(t => t.earned);
        break;
      case 'tech':
      case 'premium':
      case 'pi':
      case 'daily':
      case 'crypto':
      case 'free':
      case 'cashcode':
        filtered = tickets.filter(t => categorizeTicket(t) === filter);
        break;
      default:
        // 'all' - no filtering
        break;
    }

    return filtered;
  };

  const filteredTickets = getFilteredTickets();

  return (
    <div className="bg-[#0f172a] border border-cyan-600 rounded-xl p-4 text-white w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">My Tickets</h2>
        <span className="text-sm text-gray-400">({filteredTickets.length} total)</span>
      </div>

      {showFilter && (
        <select
          className="w-full p-3 rounded-lg bg-[#1e293b] text-white border border-cyan-400 focus:ring-2 focus:ring-cyan-400"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Tickets</option>
          <option value="active">Active Competitions</option>
          <option value="completed">Completed Competitions</option>
          <option value="gifted">Gifted to Me</option>
          <option value="earned">Earned/Free</option>
          <option value="tech">Featured Competitions</option>
          <option value="premium">Travel Competitions</option>
          <option value="pi">Pi Competitions</option>
          <option value="daily">Daily Competitions</option>
          <option value="crypto">Crypto Giveaways</option>
          <option value="free">Free Tickets</option>
          <option value="cashcode">Pi Cash Code</option>
        </select>
      )}

      {/* Tickets Display */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No tickets found for this category.</p>
          <p className="text-sm mt-2">Start entering competitions to see your tickets here!</p>
        </div>
      ) : filteredTickets.length > 10 ? (
        // Compressed view for many tickets
        <div className="space-y-3">
          {Object.entries(groupedTickets)
            .filter(([theme, themeTickets]) => 
              filter === 'all' || filter === theme || 
              (filter === 'active' && themeTickets.some(t => new Date(t.drawDate || t.endsAt) > new Date())) ||
              (filter === 'completed' && themeTickets.some(t => new Date(t.drawDate || t.endsAt) <= new Date())) ||
              (filter === 'gifted' && themeTickets.some(t => t.gifted)) ||
              (filter === 'earned' && themeTickets.some(t => t.earned))
            )
            .map(([theme, themeTickets]) => (
              <CompressedTicketView 
                key={theme} 
                tickets={themeTickets.filter(ticket => {
                  if (filter === 'all' || filter === theme) return true;
                  if (filter === 'active') return new Date(ticket.drawDate || ticket.endsAt) > new Date();
                  if (filter === 'completed') return new Date(ticket.drawDate || ticket.endsAt) <= new Date();
                  if (filter === 'gifted') return ticket.gifted;
                  if (filter === 'earned') return ticket.earned;
                  return false;
                })} 
                theme={theme}
              />
            ))}
        </div>
      ) : (
        // Normal view for fewer tickets
        <div className="flex overflow-x-auto space-x-3 pb-4">
          {filteredTickets.map((ticket, index) => (
            <TicketCard 
              key={index} 
              ticket={ticket} 
              theme={categorizeTicket(ticket)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Export both individual components and the main component
export { TicketCard, CompressedTicketView };

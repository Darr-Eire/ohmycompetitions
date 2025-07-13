'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { usePiAuth } from '../context/PiAuthContext';
import ReferralStatsCard from 'components/ReferralStatsCard';
import GiftTicketModal from 'components/GiftTicketModal';
import PiCashClaimBox from 'components/PiCashClaimBox';

// Enhanced Ticket Card Component with proper theming
function EnhancedTicketCard({ ticket, theme, compressed = false }) {
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

  // Theme-based styling
  const themeStyles = {
    tech: 'border-blue-500 bg-gradient-to-br from-blue-900/20 to-blue-800/20',
    premium: 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-purple-800/20',
    pi: 'border-yellow-500 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20',
    daily: 'border-green-500 bg-gradient-to-br from-green-900/20 to-green-800/20',
    crypto: 'border-orange-500 bg-gradient-to-br from-orange-900/20 to-orange-800/20',
    free: 'border-cyan-500 bg-gradient-to-br from-cyan-900/20 to-cyan-800/20',
    cashcode: 'border-pink-500 bg-gradient-to-br from-pink-900/20 to-pink-800/20'
  };

  const cardWidth = compressed ? 'w-48' : 'w-64';
  const imageHeight = compressed ? 'h-24' : 'h-32';

  return (
    <div className={`${cardWidth} bg-[#1e293b] text-white border-2 rounded-xl shadow-lg p-3 space-y-2 shrink-0 ${themeStyles[theme] || themeStyles.tech}`}>
      <div className="text-center">
        <h3 className="text-sm font-bold truncate">{ticket.competitionTitle}</h3>
        <span className={`text-xs font-medium ${statusColor} mt-1 block`}>{statusLabel}</span>
      </div>
      
      <Image
        src={ticket.imageUrl || '/images/default-prize.png'}
        alt="Prize"
        width={300}
        height={compressed ? 96 : 128}
        className={`w-full object-cover rounded-md ${imageHeight}`}
      />
      
      <div className="grid grid-cols-2 text-xs gap-1">
        <p className="col-span-2 text-cyan-300 font-medium truncate">{ticket.prize}</p>
        <p>🎟 {ticket.quantity}</p>
        <p>💰 {(ticket.entryFee || 0).toFixed(2)} π</p>
        <p>🕒 {drawDate.toLocaleDateString()}</p>
        <p>{isActive ? '🟢 Active' : '🔴 Closed'}</p>
      </div>
      
      {!compressed && ticket.ticketNumbers && (
        <p className="text-[10px] text-gray-400 truncate">
          Ticket IDs: {ticket.ticketNumbers.join(', ')}
        </p>
      )}
    </div>
  );
}

// Compressed ticket view for when user has many tickets
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

  return (
    <div className={`bg-[#1e293b] border-2 ${themeStyles[theme] || themeStyles.tech} rounded-xl p-4 space-y-3`}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-white">
          {theme.charAt(0).toUpperCase() + theme.slice(1)} Tickets ({ticketCount})
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-cyan-400 text-xs hover:text-cyan-300"
        >
          {expanded ? 'Show Less' : 'Show All'}
        </button>
      </div>
      
      <div className="text-xs text-gray-300">
        Total Tickets: {totalQuantity} | Latest: {representativeTicket.competitionTitle}
      </div>

      {expanded ? (
        <div className="flex overflow-x-auto space-x-3 pb-2">
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
        <EnhancedTicketCard 
          ticket={representativeTicket} 
          theme={theme} 
          compressed={true}
        />
      )}
    </div>
  );
}

export default function Account() {
  const { user, loginWithPi } = usePiAuth();
  const [tickets, setTickets] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [referralData, setReferralData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [message, setMessage] = useState('');
  const [piCashWinner, setPiCashWinner] = useState(null);
  const [checkingWinner, setCheckingWinner] = useState(false);

  // Check if user has won Pi Cash Code
  useEffect(() => {
    const checkPiCashWinner = async () => {
      if (!user?.uid) return;

      try {
        setCheckingWinner(true);
        const response = await axios.post('/api/pi-cash-code-winner-check', {
          uid: user.uid
        });

        if (response.data.success && response.data.isWinner) {
          setPiCashWinner(response.data.winner);
        }
      } catch (error) {
        console.error('Failed to check Pi Cash winner status:', error);
      } finally {
        setCheckingWinner(false);
      }
    };

    checkPiCashWinner();
  }, [user?.uid]);

  const handleClaimSuccess = (result) => {
    setPiCashWinner(null);
    setMessage(`🎉 Successfully claimed ${result.prizeAmount} π! Check your Pi wallet.`);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleClaimExpired = () => {
    setPiCashWinner(null);
    setMessage('⏰ Claim window expired. Prize rolled over to next week.');
    setTimeout(() => setMessage(''), 5000);
  };

  // Fetch real user data and tickets
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user tickets
        const ticketsRes = await axios.get(`/api/user/tickets?username=${user.username}`);
        const userTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
        
        // Enhance tickets with theme categorization
        const enhancedTickets = userTickets.map(ticket => ({
          ...ticket,
          theme: categorizeTicket(ticket.competitionSlug, ticket.competitionTitle),
          drawDate: ticket.drawDate || ticket.endsAt || new Date().toISOString()
        }));

        setTickets(enhancedTickets);

        // Fetch referral data
        const referralRes = await axios.get(`/api/referrals/stats?user=${user.username}`);
        setReferralData(referralRes.data || {});

        // Calculate user stats
        const stats = calculateUserStats(enhancedTickets);
        setUserStats(stats);

      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Set empty data instead of mock data
        setTickets([]);
        setUserStats({ totalPurchased: 0, totalGifted: 0, totalEarned: 0, joinDate: new Date().toLocaleDateString() });
        setReferralData({ signupCount: 0, ticketsEarned: 0, miniGamesBonus: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Categorize tickets by competition type
  const categorizeTicket = (slug, title) => {
    const lowerSlug = slug?.toLowerCase() || '';
    const lowerTitle = title?.toLowerCase() || '';
    
    // Premium & Travel (check first before tech)
    if (lowerSlug.includes('dubai') || lowerSlug.includes('holiday') || lowerTitle.includes('travel') ||
        lowerSlug.includes('penthouse') || lowerTitle.includes('penthouse') ||
        lowerSlug.includes('weekend') || lowerTitle.includes('weekend') ||
        lowerSlug.includes('getaway') || lowerTitle.includes('getaway') ||
        lowerSlug.includes('flight') || lowerTitle.includes('flight') ||
        lowerSlug.includes('hotel') || lowerTitle.includes('hotel') ||
        lowerSlug.includes('luxury') || lowerTitle.includes('luxury')) return 'premium';
    
    // Tech competitions
    if (lowerSlug.includes('ps5') || lowerSlug.includes('xbox') || lowerSlug.includes('nintendo') || 
        lowerTitle.includes('gaming') || lowerTitle.includes('tech')) return 'tech';
    
    // Pi competitions
    if (lowerSlug.includes('pi-') || lowerTitle.includes('pi ')) return 'pi';
    
    // Daily competitions
    if (lowerSlug.includes('daily') || lowerTitle.includes('daily')) return 'daily';
    
    // Crypto competitions
    if (lowerSlug.includes('btc') || lowerSlug.includes('crypto') || lowerTitle.includes('btc')) return 'crypto';
    
    // Free competitions
    if (lowerSlug.includes('free') || lowerSlug.includes('moon')) return 'free';
    
    // Pi Cash Code
    if (lowerSlug.includes('cash-code') || lowerTitle.includes('cash code')) return 'cashcode';
    
    return 'tech'; // default
  };

  // Calculate user statistics
  const calculateUserStats = (tickets) => {
    const totalPurchased = tickets.filter(t => !t.gifted && !t.earned).reduce((sum, t) => sum + (t.quantity || 0), 0);
    const totalGifted = tickets.filter(t => t.gifted).reduce((sum, t) => sum + (t.quantity || 0), 0);
    const totalEarned = tickets.filter(t => t.earned).reduce((sum, t) => sum + (t.quantity || 0), 0);
    const joinDate = user?.createdAt || user?.lastLogin || new Date().toISOString();

    return {
      totalPurchased,
      totalGifted, 
      totalEarned,
      joinDate: new Date(joinDate).toLocaleDateString()
    };
  };

  // Group tickets by theme
  const groupTicketsByTheme = (tickets) => {
    return tickets.reduce((groups, ticket) => {
      const theme = ticket.theme || 'tech';
      if (!groups[theme]) groups[theme] = [];
      groups[theme].push(ticket);
      return groups;
    }, {});
  };

  // Filter tickets based on selection
  const getFilteredTickets = () => {
    const now = new Date();
    let filtered = [...tickets];

    switch (filter) {
      case 'active':
        filtered = tickets.filter(t => new Date(t.drawDate) > now);
        break;
      case 'completed':
        filtered = tickets.filter(t => new Date(t.drawDate) <= now);
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
        filtered = tickets.filter(t => t.theme === filter);
        break;
      default:
        // 'all' - no filtering
        break;
    }

    return filtered;
  };



  const filteredTickets = getFilteredTickets();
  const groupedTickets = groupTicketsByTheme(filteredTickets);

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="bg-[#1e293b] min-h-screen max-w-md mx-auto p-4 text-white flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Account Dashboard</h1>
          <p className="text-gray-400">Please log in with Pi to view your account</p>
          <button
            onClick={loginWithPi}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-6 rounded-xl hover:brightness-110 transition-all"
          >
            Login with Pi Network
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] min-h-screen max-w-md mx-auto p-4 text-white space-y-6">

      {/* Enhanced Profile Card */}
      <div className="border border-cyan-600 rounded-2xl p-6 text-center shadow-lg space-y-4 bg-gradient-to-br from-blue-900/10 to-purple-900/10">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-black font-bold text-xl">
            {user.username?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <h2 className="text-xl font-bold">{user.username || 'Pioneer'}</h2>
          <p className="text-sm text-cyan-400">ID: {user.uid || 'Loading...'}</p>
          {user.country && (
            <p className="text-xs text-gray-400">📍 {user.country}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] text-left">
          <div className="bg-[#0f172a] p-2 rounded-md border border-cyan-600">
            <p className="text-gray-400 mb-1">🔢 Tickets Bought</p>
            <p className="text-white font-semibold text-sm">{userStats.totalPurchased || 0}</p>
          </div>
          <div className="bg-[#0f172a] p-2 rounded-md border border-cyan-600">
            <p className="text-gray-400 mb-1">📅 Member Since</p>
            <p className="text-white font-semibold text-sm">{userStats.joinDate || 'Today'}</p>
          </div>
          <div className="bg-[#0f172a] p-2 rounded-md border border-yellow-400">
            <p className="text-gray-400 mb-1">🎁 Tickets Gifted</p>
            <p className="text-white font-semibold text-sm">{userStats.totalGifted || 0}</p>
          </div>
          <div className="bg-[#0f172a] p-2 rounded-md border border-green-500">
            <p className="text-gray-400 mb-1">🏅 Tickets Earned</p>
            <p className="text-white font-semibold text-sm">{userStats.totalEarned || 0}</p>
          </div>
        </div>
      </div>

      {/* Pi Cash Code Claim Box - Priority Display When User Wins */}
      {piCashWinner && (
        <PiCashClaimBox
          winner={piCashWinner}
          onClaimSuccess={handleClaimSuccess}
          onClaimExpired={handleClaimExpired}
        />
      )}

      {/* Status Messages */}
      {message && (
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500 rounded-xl p-4 text-center">
          <p className="text-green-400 font-semibold">{message}</p>
        </div>
      )}

      {/* Ticket Filter and Display */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">My Tickets</h2>
          <span className="text-sm text-gray-400">({filteredTickets.length} total)</span>
        </div>

        {/* Filter Dropdown */}
        <select
          className="w-full p-3 rounded-lg bg-[#0f172a] text-white border border-cyan-600 focus:ring-2 focus:ring-cyan-400"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Tickets</option>
          <option value="active">Active Competitions</option>
          <option value="completed">Completed</option>
          <option value="gifted">Gifted to Me</option>
          <option value="earned">Earned/Free</option>
          <option value="tech">Featured & Travel</option>
          <option value="pi">Pi Competitions</option>
          <option value="daily">Daily Competitions</option>
          <option value="crypto">Crypto Giveaways</option>
          <option value="free">Free Tickets</option>
          <option value="cashcode">Pi Cash Code</option>
        </select>

        {/* Tickets Display */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400 mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading your tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No tickets found for this category.</p>
            <p className="text-sm mt-2">Start entering competitions to see your tickets here!</p>
          </div>
        ) : filteredTickets.length > 10 ? (
          // Compressed view for many tickets
<div className="space-y-3">
            {Object.entries(groupedTickets).map(([theme, themeTickets]) => (
              <CompressedTicketView 
                key={theme} 
                tickets={themeTickets} 
                theme={theme}
              />
            ))}
          </div>
        ) : (
          // Normal view for fewer tickets
          <div className="flex overflow-x-auto space-x-3 pb-4">
            {filteredTickets.map((ticket, index) => (
              <EnhancedTicketCard 
                key={index} 
                ticket={ticket} 
                theme={ticket.theme}
              />
            ))}
          </div>
  )}
</div>

      {/* Real-time Referral Stats */}
      <ReferralStatsCard
        username={user.username}
        signupCount={referralData.signupCount || 0}
        ticketsEarned={referralData.ticketsEarned || 0}
        miniGamesBonus={referralData.miniGamesBonus || 0}
        userReferralCode={referralData.userReferralCode || user.username}
        totalBonusTickets={referralData.totalBonusTickets || 0}
        competitionBreakdown={referralData.competitionBreakdown || {}}
      />

      {/* Enhanced Gift-a-Ticket Section */}
      <div className="bg-gradient-to-r from-[#0f172a]/80 via-[#1e293b]/90 to-[#0f172a]/80 border border-cyan-400 rounded-2xl shadow-[0_0_40px_#00ffd533] p-6 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">🎁 Gift a Ticket</h2>
          <p className="text-sm text-gray-400">Share the excitement with fellow Pioneers!</p>
    </div>

    <button
          onClick={() => setShowGiftModal(true)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
        >
          Open Gift Center
    </button>

        {message && (
          <p className="text-center text-cyan-300 text-sm bg-[#0f172a] p-2 rounded">{message}</p>
        )}
</div>

      {/* Gift Ticket Modal */}
        <GiftTicketModal 
        isOpen={showGiftModal}
          onClose={() => {
            setShowGiftModal(false);
            setMessage('');
          }}
        />
    </div>
  );
}

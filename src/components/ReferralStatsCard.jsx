'use client';

import { useState, useEffect } from 'react';

export default function ReferralStatsCard({
  username = 'unknown',
  signupCount = 0,
  ticketsEarned = 0,
  miniGamesBonus = 0,
  userReferralCode = null,
  totalBonusTickets = 0,
  competitionBreakdown = {}
}) {
  const [loading, setLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralUrl = `https://ohmycompetitions.com/signup?ref=${userReferralCode || username}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform) => {
    const shareText = encodeURIComponent('Join me on OhMyCompetitions - Win amazing prizes with Pi Network! 🎁🏆');
    const encodedUrl = encodeURIComponent(referralUrl);
    
    const shareUrls = {
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`,
      twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Calculate referral milestones
  const nextMilestone = Math.ceil((signupCount + 1) / 5) * 5;
  const progressToNextMilestone = ((signupCount % 5) / 5) * 100;

  return (
    <div className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] p-6 rounded-2xl border border-cyan-600 space-y-4 shadow-lg shadow-cyan-500/10">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <span className="text-2xl">🤝</span>
          Referral Program
        </h3>
        <p className="text-sm text-cyan-400">
          Invite friends, earn tickets and Pi rewards!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0f172a] p-3 rounded-lg border border-cyan-500 text-center">
          <p className="text-gray-400 text-xs mb-1">👥 Signups</p>
          <p className="text-white font-bold text-lg">{signupCount}</p>
        </div>
        <div className="bg-[#0f172a] p-3 rounded-lg border border-green-500 text-center">
          <p className="text-gray-400 text-xs mb-1">🎫 Tickets</p>
          <p className="text-white font-bold text-lg">{ticketsEarned}</p>
        </div>
        <div className="bg-[#0f172a] p-3 rounded-lg border border-yellow-500 text-center">
          <p className="text-gray-400 text-xs mb-1">🎮 Bonus</p>
          <p className="text-white font-bold text-lg">{miniGamesBonus}</p>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="bg-[#0f172a] p-3 rounded-lg border border-purple-500">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-purple-400">Next Milestone</span>
          <span className="text-xs text-white">{signupCount}/{nextMilestone}</span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progressToNextMilestone}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {5 - (signupCount % 5)} more referrals for bonus reward
        </p>
      </div>

      {/* Referral Link */}
      <div className="bg-[#0f172a] p-3 rounded-lg border border-cyan-400 space-y-2">
        <p className="text-xs text-cyan-400 font-medium">Your Referral Link:</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 bg-gray-800 text-white text-xs p-2 rounded border border-gray-600 truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-2 rounded text-xs font-medium transition-all ${
              copied 
                ? 'bg-green-500 text-black' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-black'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => handleShare('telegram')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded text-xs transition-colors"
        >
          📱 Telegram
        </button>
        <button
          onClick={() => handleShare('twitter')}
          className="bg-black hover:bg-gray-800 text-white p-2 rounded text-xs transition-colors"
        >
          🐦 Twitter
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded text-xs transition-colors"
        >
          💬 WhatsApp
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs transition-colors"
        >
          📘 Facebook
        </button>
      </div>

      {/* Competition Breakdown Toggle */}
      {Object.keys(competitionBreakdown).length > 0 && (
        <div className="border-t border-gray-600 pt-3">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full text-left text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showBreakdown ? '📊 Hide' : '📈 Show'} Competition Breakdown
          </button>
          
          {showBreakdown && (
            <div className="mt-3 space-y-2">
              {Object.entries(competitionBreakdown).map(([compSlug, count]) => (
                <div key={compSlug} className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 truncate">{compSlug}</span>
                  <span className="text-white font-medium">{count} tickets</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Total Bonus Tickets Display */}
      {totalBonusTickets > 0 && (
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-3 rounded-lg border border-green-500">
          <div className="text-center">
            <p className="text-green-400 text-xs font-medium">🎁 Total Bonus Tickets Earned</p>
            <p className="text-white text-lg font-bold">{totalBonusTickets}</p>
          </div>
        </div>
      )}

      {/* How it Works */}
      <details className="bg-[#0f172a] rounded-lg border border-gray-600">
        <summary className="p-3 text-sm text-cyan-400 cursor-pointer hover:text-cyan-300">
          ℹ️ How Referrals Work
        </summary>
        <div className="p-3 pt-0 text-xs text-gray-300 space-y-1">
          <p>• Share your referral link with friends</p>
          <p>• Earn bonus tickets when they sign up</p>
          <p>• Get mini-game entries every 3 referrals</p>
          <p>• Unlock special rewards at milestones</p>
        </div>
      </details>
    </div>
  );
}

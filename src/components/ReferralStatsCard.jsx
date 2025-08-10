'use client';

import { useState } from 'react';

export default function ReferralStatsCard({
  username = 'unknown',
  signupCount = 0,
  // old props (fallbacks)
  ticketsEarned = 0,
  miniGamesBonus = 0,
  totalBonusTickets = 0,
  // new preferred props (will override old if provided)
  entriesEarned,
  bonusEntries,
  totalEntries,
  userReferralCode = null,
  competitionBreakdown = {},
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Backward-compatible value mapping
  const earned = (entriesEarned ?? ticketsEarned) || 0;
  const bonus  = (bonusEntries ?? miniGamesBonus) || 0;
  const total  = (totalEntries ?? totalBonusTickets ?? (earned + bonus)) || 0;

  const referralUrl = `https://ohmycompetitions.com/signup?ref=${encodeURIComponent(
    userReferralCode || username
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = referralUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const handleShare = (platform) => {
    const shareText = encodeURIComponent('Join me on OhMyCompetitions — monthly 100π draw! 🎁🏆');
    const url = encodeURIComponent(referralUrl);
    const map = {
      telegram: `https://t.me/share/url?url=${url}&text=${shareText}`,
      twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${url}`,
      whatsapp: `https://wa.me/?text=${shareText}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    if (map[platform]) window.open(map[platform], '_blank', 'width=600,height=520');
  };

  // Milestones every 5 signups
  const nextMilestone = Math.ceil(Math.max(1, signupCount + 1) / 5) * 5;
  const progressPct = ((signupCount % 5) / 5) * 100;
  const toGo = 5 - (signupCount % 5 || 5) === 5 ? 0 : 5 - (signupCount % 5);

  return (
    <div className="bg-gradient-to-br from-[#0b1220] via-[#0b162a] to-[#0b1220] p-5 sm:p-6 rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(0,255,255,0.12)] text-white">
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="font-orbitron text-lg sm:text-xl font-bold text-cyan-300">
          Monthly 100&nbsp;π Draw — Your Entries
        </h3>
        <p className="text-xs sm:text-sm text-cyan-200/80">
          Every successful referral = <b>1 entry</b>. Bonus actions can add more.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <Tile label="Referrals" value={signupCount} />
        <Tile label="Entries from Referrals" value={earned} />
        <Tile label="Bonus Entries" value={bonus} />
        <Tile label="Total Entries" value={total} highlight />
      </div>

      {/* Milestone progress */}
      <div className="mt-4 rounded-xl border border-fuchsia-400/30 bg-fuchsia-400/10 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs text-fuchsia-200">Next Milestone</span>
          <span className="text-[11px] sm:text-xs text-white">{signupCount}/{nextMilestone}</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-pink-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-white/70">
          {toGo > 0 ? `${toGo} more referrals to hit the next milestone` : 'Milestone reached — nice!'}
        </p>
      </div>

      {/* Referral link */}
      <div className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3">
        <div className="text-[11px] sm:text-xs text-cyan-200 mb-1">Your referral link</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <code className="flex-1 whitespace-nowrap overflow-x-auto rounded-lg bg-black/40 px-3 py-2 text-xs">
            {referralUrl}
          </code>
          <button
            onClick={handleCopy}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              copied ? 'bg-emerald-400 text-black' : 'bg-cyan-400 text-black hover:brightness-110'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="mt-2 text-[11px] text-white/70">
          Code: <span className="font-semibold text-cyan-200">{userReferralCode || username}</span>
        </div>
      </div>

      {/* Share buttons */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <ShareBtn onClick={() => handleShare('telegram')}>📱 Telegram</ShareBtn>
        <ShareBtn onClick={() => handleShare('twitter')}>🐦 Twitter</ShareBtn>
        <ShareBtn onClick={() => handleShare('whatsapp')}>💬 WhatsApp</ShareBtn>
        <ShareBtn onClick={() => handleShare('facebook')}>📘 Facebook</ShareBtn>
      </div>

      {/* Breakdown */}
      {Object.keys(competitionBreakdown || {}).length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full text-left text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            {showBreakdown ? '📊 Hide' : '📈 Show'} Entry Breakdown
          </button>
          {showBreakdown && (
            <div className="mt-3 space-y-1.5">
              {Object.entries(competitionBreakdown).map(([slug, count]) => (
                <div key={slug} className="flex items-center justify-between text-xs">
                  <span className="text-white/70 truncate pr-3">{slug}</span>
                  <span className="text-cyan-200 font-semibold">{count} entries</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Terms blurb */}
      <p className="mt-4 text-[11px] text-white/60">
        Winners announced monthly. Entries reset each cycle. Terms apply.
      </p>
    </div>
  );
}

function Tile({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-xl px-3 py-3 text-center border ${
        highlight ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="text-[10px] sm:text-xs text-white/70">{label}</div>
      <div className={`mt-1 font-orbitron font-bold ${highlight ? 'text-cyan-300' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function ShareBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs py-2 transition-colors"
    >
      {children}
    </button>
  );
}

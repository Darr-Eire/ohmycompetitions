'use client';

import { useState, useCallback } from 'react';

function buildReferralLink(code) {
  const base =
    (typeof window !== 'undefined' && window.location?.origin) ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://ohmycompetitions.com';
  return `${base}/r/${encodeURIComponent(code || '')}`;
}

async function shareOrCopy(text, url, onCopied) {
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: 'OhMyCompetitions', text, url });
      return true;
    }
  } catch {
    // fall back to copy
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`.trim());
    onCopied?.();
    return true;
  } catch {
    return false;
  }
}

export default function ReferralStatsCard({
  username = 'unknown',
  signupCount = 0,
  // old props (fallbacks)
  ticketsEarned = 0,
  miniGamesBonus = 0,
  totalBonusTickets = 0,
  // new preferred props (override old if provided)
  entriesEarned,
  bonusEntries,
  totalEntries,
  userReferralCode = null,
  competitionBreakdown = {},
  className = '',
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Backward-compatible mapping
  const earned = (entriesEarned ?? ticketsEarned) || 0;
  const bonus  = (bonusEntries ?? miniGamesBonus) || 0;
  const total  = (totalEntries ?? totalBonusTickets ?? (earned + bonus)) || 0;

  const code = userReferralCode || username;
  const referralUrl = buildReferralLink(code);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // very old fallback
      try {
        const ta = document.createElement('textarea');
        ta.value = referralUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch {}
    }
  }, [referralUrl]);

  const handleShare = useCallback(async (platform) => {
    const shareText = 'Join me on OhMyCompetitions — get tickets to win prizes!';

    // Web Share if available
    const ok = await shareOrCopy(shareText, referralUrl, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
    if (ok) return;

    // Fallback: open target share URL
    const url = encodeURIComponent(referralUrl);
    const text = encodeURIComponent(shareText);
    const map = {
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    const href = map[platform];
    if (href) window.open(href, '_blank', 'width=600,height=520');
  }, [referralUrl]);

  // Milestones every 5 signups
  const remainder = signupCount % 5;
  const milestoneReached = signupCount > 0 && remainder === 0;
  const nextMilestone = milestoneReached ? signupCount + 5 : signupCount - remainder + 5;
  const progressPct = (remainder / 5) * 100;

  return (
    <div
      className={`rounded-2xl border border-cyan-600 bg-[#0f172a] 
                  p-2.5 sm:p-4 text-white ${className}`}
    >
      {/* Header (ultra compact on mobile) */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
      
          <p className="hidden sm:block text-xs text-white/70 mt-0.5">
            Every successful referral = <b>1 entry</b>. Bonus actions can add more.
          </p>
        </div>
        <span className="shrink-0 text-[10px] sm:text-xs bg-white/10 border border-white/10 rounded-lg px-2 py-0.5">
          Total: <b className="text-cyan-300">{total}</b>
        </span>
      </div>

      {/* Tiles */}
      <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5">
        <Tile label="Referrals" value={signupCount} />
        <Tile label="Entries from Referrals" value={earned} />
        <Tile label="Bonus Entries" value={bonus} />
        <Tile label="Total Entries" value={total} highlight />
      </div>

      {/* Milestone */}
      <div className="mt-2.5 rounded-xl border border-cyan-600/60 bg-white/5 p-2 sm:p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-white/80">Next Milestone</span>
          <span className="text-[10px] sm:text-xs text-white/90">
            {signupCount}/{nextMilestone}
          </span>
        </div>
        <div className="mt-1.5 h-1 sm:h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-500"
            style={{ width: `${milestoneReached ? 100 : progressPct}%` }}
          />
        </div>
      </div>

      {/* Link row */}
      <div className="mt-2.5 rounded-xl border border-cyan-600/60 bg-white/5 p-2 sm:p-2.5">
        {/* Mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          <div className="text-[11px] text-white/80">
            Code: <span className="font-semibold text-cyan-300">{code}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`ml-auto rounded-md px-2 py-1 text-[11px] font-semibold 
                        ${copied ? 'bg-emerald-400 text-black' : 'bg-cyan-400 text-black hover:brightness-110'}`}
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex flex-col sm:flex-row gap-2">
          <code className="flex-1 truncate rounded-lg bg-black/40 px-2.5 py-1.5 text-[11px]">
            {referralUrl}
          </code>
          <button
            onClick={handleCopy}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold 
                        ${copied ? 'bg-emerald-400 text-black' : 'bg-cyan-400 text-black hover:brightness-110'}`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Share */}
      <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ShareBtn onClick={() => handleShare('telegram')}>📱 Telegram</ShareBtn>
        <ShareBtn onClick={() => handleShare('twitter')}>🐦 Twitter</ShareBtn>
        <ShareBtn onClick={() => handleShare('whatsapp')}>💬 WhatsApp</ShareBtn>
        <ShareBtn onClick={() => handleShare('facebook')}>📘 Facebook</ShareBtn>
      </div>

      {/* Breakdown */}
      {Object.keys(competitionBreakdown || {}).length > 0 && (
        <div className="mt-2.5 border-t border-white/10 pt-2">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full text-left text-xs text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            {showBreakdown ? '📊 Hide' : '📈 Show'} Entry Breakdown
          </button>
          {showBreakdown && (
            <div className="mt-1.5 space-y-1">
              {Object.entries(competitionBreakdown).map(([slug, count]) => (
                <div key={slug} className="flex items-center justify-between text-[11px]">
                  <span className="text-white/70 truncate pr-3">{slug}</span>
                  <span className="text-cyan-200 font-semibold">{count} entries</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-xl px-2 py-2 text-center border leading-tight
        ${highlight ? 'border-cyan-600 bg-white/5' : 'border-white/10 bg-white/5'}`}
    >
      <div className="text-[10px] text-white/70">{label}</div>
      <div className={`mt-0.5 font-bold ${highlight ? 'text-cyan-300' : 'text-white'} text-sm`}>
        {value}
      </div>
    </div>
  );
}

function ShareBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-white/5 border border-cyan-600/60 hover:bg-white/10 
                 text-white text-[11px] py-1.5 sm:py-1.5 transition-colors"
    >
      {children}
    </button>
  );
}

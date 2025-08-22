'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePiAuth } from '../context/PiAuthContext';
import ReferralStatsCard from 'components/ReferralStatsCard';
import GiftTicketModal from 'components/GiftTicketModal';
import PiCashClaimBox from 'components/PiCashClaimBox';
import StagesXPSection from 'components/StagesXPSection';
import RedeemVoucherPanel from 'components/RedeemVoucherPanel';

/* -------------------------- tiny shared primitives -------------------------- */
function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs border transition 
      ${active ? 'bg-cyan-400 text-black border-cyan-400' : 'border-white/15 text-white/80 hover:bg-white/5'}`}
    >
      {children}
    </button>
  );
}

function Section({ title, children, right }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function CopyMono({ value, label = 'ID' }) {
  const [copied, setCopied] = useState(false);
  const v = value || '';
  const masked = v ? `${v.slice(0, 4)}••••${v.slice(-4)}` : '—';
  async function copy() {
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }
  return (
    <button
      onClick={copy}
      className="text-[11px] px-2 py-1 rounded-md bg-[#0b1220] border border-white/10 text-white/80 hover:text-white"
      aria-label={`Copy ${label}`}
      title="Copy"
    >
      <span className="font-semibold text-white/70 mr-1">{label}:</span>
      <span className="font-mono">{masked}</span>
      <span className="ml-2 text-cyan-300">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

/* ------------------------------ Tickets utils ------------------------------- */
const FAR_FUTURE = new Date('2099-12-31T23:59:59Z');

function toDateSafe(val) {
  if (!val && val !== 0) return null;
  if (typeof val === 'number') return new Date(val < 1e12 ? val * 1000 : val);

  const s = String(val).trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T23:59:59Z`);
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(s)) {
    const [y, m, d] = s.split('/');
    return new Date(`${y}-${m}-${d}T23:59:59Z`);
  }
  if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    const year = y.length === 2 ? `20${y}` : y;
    return new Date(`${year}-${m}-${d}T23:59:59Z`);
  }
  if (/^\d{2}-\d{2}-\d{2,4}$/.test(s)) {
    const [d, m, y] = s.split('-');
    const year = y.length === 2 ? `20${y}` : y;
    return new Date(`${year}-${m}-${d}T23:59:59Z`);
  }

  let d = new Date(s);
  if (!isNaN(d)) return d;
  d = new Date(s.replace(' ', 'T') + (/[zZ]|[+\-]\d{2}:?\d{2}$/.test(s) ? '' : 'Z'));
  return isNaN(d) ? null : d;
}

function resolveDrawDateLike(t) {
  const candidates = [
    t.drawDate, t.draw_at, t.drawAt,
    t.endsAt, t.endDate, t.closesAt, t.closingAt, t.deadline,
    t.expiresAt, t.closeAt,
  ];
  for (const c of candidates) {
    const d = toDateSafe(c);
    if (d) return d;
  }
  return null;
}

function computeIsActive(ticket) {
  const now = new Date();

  const dateObj =
    (ticket.drawDate && toDateSafe(ticket.drawDate)) ||
    resolveDrawDateLike(ticket);

  if (dateObj && !isNaN(dateObj) && now < dateObj) return true;

  if (ticket.isLive === true || ticket.live === true) return true;
  if (ticket.status && String(ticket.status).toLowerCase() === 'live') return true;

  if (dateObj && !isNaN(dateObj) && now >= dateObj) return false;

  if (ticket.isLive === false || ticket.live === false) return false;
  if (ticket.status && String(ticket.status).toLowerCase() === 'closed') return false;

  return true;
}

const themeOrder = ['pi', 'daily', 'launch', 'tech', 'premium', 'free', 'cashcode'];

function categorizeTicket(slug, title) {
  const s = (slug || '').toLowerCase();
  const t = (title || '').toLowerCase();

  if (s.includes('cash-code') || t.includes('cash code')) return 'cashcode';
  if (s.includes('launch-week') || t.includes('launch-week') || s.includes('launch') || t.includes('launch')) return 'launch';
  if (s.includes('daily') || t.includes('daily')) return 'daily';
  if (s.includes('pi-') || t.includes('pi ')) return 'pi';
  if (s.includes('free') || s.includes('moon')) return 'free';
  if (['dubai','holiday','penthouse','weekend','getaway','flight','hotel','luxury'].some(k => s.includes(k) || t.includes(k))) return 'premium';
  if (['ps5','xbox','nintendo','gaming','tech'].some(k => s.includes(k) || t.includes(k))) return 'tech';
  return 'tech';
}

/* --------------------------------- helpers ---------------------------------- */
async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

function formatDate2(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatDateTime2(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return '';
  return d.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/* ------------------------------- Page shell -------------------------------- */
export default function Account() {
  const { user, loginWithPi } = usePiAuth();
  const params = useSearchParams();
  const initialTab = (params?.get('tab') || 'tickets');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showGift, setShowGift] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!user) {
    return (
      <div className="bg-[#0a1024] min-h-[100dvh] max-w-md mx-auto p-6 text-white flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-cyan-300 text-center">Log in with Pi to view your dashboard</p>
        <button
          onClick={loginWithPi}
          className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-6 rounded-xl hover:brightness-110"
        >
          Login with Pi Network
        </button>
      </div>
    );
  }

  const userId = user.uid || user.piUserId;

  return (
    <div className="bg-[#0a1024] min-h-[100dvh] max-w-md mx-auto text-white">
      {/* Sticky profile header */}
      <div className="bg-[#0a1024] border-b border-white/10">
        <div className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold grid place-items-center text-lg">
            {user.username?.[0]?.toUpperCase() || 'P'}
          </div>
          <div className="min-w-0">
            <div className="font-bold truncate">{user.username || 'Pioneer'}</div>
            <div className="mt-1">
              <CopyMono value={userId} />
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowGift(true)}
              className="px-3 py-2 rounded-lg bg-cyan-400 text-black text-xs font-bold"
            >
              Gift Ticket
            </button>
            <a
              href={`/ref/${encodeURIComponent(user.username)}`}
              className="px-3 py-2 rounded-lg border border-white/15 text-xs hover:bg-white/5"
            >
              Share
            </a>
          </div>
        </div>

        {/* Quick stats + compact XP + XP Modal trigger */}
        <HeaderStats user={user} userId={userId} />

        {/* Segmented tabs */}
        <nav
          className="px-4 pb-3 pt-2 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Account sections"
        >
          {[
            ['tickets', 'Tickets'],
            ['stages', 'Stages'],
            ['rewards', 'Rewards'],
            ['activity', 'Activity'],
          ].map(([key, label]) => (
            <Chip
              key={key}
              active={activeTab === key}
              onClick={() => setActiveTab(key)}
              role="tab"
              aria-selected={activeTab === key}
            >
              {label}
            </Chip>
          ))}
        </nav>
      </div>

      {/* Panels */}
      <main className="p-4 space-y-6">
        {activeTab === 'tickets' && <TicketsPanel user={user} />}
        {activeTab === 'stages' && <StagesPanel userId={userId} username={user.username} />}
        {activeTab === 'rewards' && <RewardsPanel user={user} userId={userId} />}
        {activeTab === 'activity' && <ActivityPanel userId={userId} />}
      </main>

      <GiftTicketModal isOpen={showGift} onClose={() => setShowGift(false)} />
    </div>
  );
}

/* --------------------------- Header stats + XP --------------------------- */
function HeaderStats({ user, userId }) {
  const [stats, setStats] = useState({ purchased: 0, gifted: 0, earned: 0, joinDate: '' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`/api/user/ticket-stats?username=${user.username}`);
        const d = res.data || {};
        if (mounted)
          setStats({
            purchased: d.totalPurchased || 0,
            gifted: d.totalGifted || 0,
            earned: d.totalEarned || 0,
            joinDate: formatDate2(d.joinDate || user?.createdAt || user?.lastLogin || Date.now()),
          });
      } catch {
        try {
          const tRes = await axios.get(`/api/user/tickets?username=${user.username}`);
          const arr = Array.isArray(tRes.data) ? tRes.data : [];
          const totals = {
            purchased: arr.filter(t => !t.gifted && !t.earned).reduce((s, t) => s + (t.quantity || 0), 0),
            gifted: arr.filter(t => t.gifted).reduce((s, t) => s + (t.quantity || 0), 0),
            earned: arr.filter(t => t.earned).reduce((s, t) => s + (t.quantity || 0), 0),
          };
          if (mounted)
            setStats({
              ...totals,
              joinDate: formatDate2(user?.createdAt || user?.lastLogin || Date.now()),
            });
        } catch {
          if (mounted) setStats(s => ({ ...s, joinDate: formatDate2(Date.now()) }));
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.username]);

  return (
    <div className="px-4 pb-3">
      <div className="grid grid-cols-4 gap-2">
        <StatChip label="Bought" value={stats.purchased} />
        <StatChip label="Gifted" value={stats.gifted} />
        <StatChip label="Earned" value={stats.earned} />
        <StatChip label="Member" value={stats.joinDate} valueClassName="text-xs" />
      </div>

      <div className="mt-3">
        <CompactXPBar userId={userId} />
      </div>

      {/* XP Spend trigger */}
      <div className="mt-2 flex justify-end">
        <XPSpendModalTrigger userId={userId} username={user?.username} />
      </div>
    </div>
  );
}

function isFreeTicket(ticket, theme) {
  const fee = ticket?.entryFee ?? ticket?.price;
  return theme === 'free' || fee === 0;
}

function StatChip({ label, value, valueClassName = '' }) {
  return (
    <div className="rounded-lg bg-[#0f172a] border border-cyan-300 px-2 py-2 text-center">
      <div className="text-[10px] text-white/70">{label}</div>
      <div className={`text-sm font-extrabold text-cyan-300 truncate ${valueClassName}`}>{String(value)}</div>
    </div>
  );
}

/* -------------------------------- Tickets tab -------------------------------- */
function TicketsPanel({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('all');
  const [state, setState] = useState('active'); // active | completed | all
  const [redeemOpen, setRedeemOpen] = useState(false); // dropdown toggle

  const loadTickets = async () => {
    if (!user?.username) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/user/tickets?username=${encodeURIComponent(user.username)}`);
      const arr = Array.isArray(data) ? data : [];

      const enhanced = arr.map(t => {
        const resolved = resolveDrawDateLike(t) || FAR_FUTURE;

        const live =
          typeof t.isLive === 'boolean' ? t.isLive
          : typeof t.live === 'boolean'    ? t.live
          : (t.status && String(t.status).toLowerCase() === 'live') ? true
          : undefined;

        return {
          ...t,
          theme: categorizeTicket(t.competitionSlug, t.competitionTitle),
          drawDate: resolved.toISOString(),
          live,
        };
      });

      setTickets(enhanced);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]);

  const filtered = tickets.filter(t => {
    const isActive = computeIsActive(t);
    const matchesTheme = theme === 'all' ? true : t.theme === theme;
    const matchesState =
      state === 'all' ? true
      : state === 'active' ? isActive
      : !isActive;
    return matchesTheme && matchesState;
  });

  const grouped = useMemo(() => {
    const g = {};
    for (const t of filtered) (g[t.theme] = g[t.theme] || []).push(t);
    return g;
  }, [filtered]);

  const handleRedeemed = () => {
    loadTickets();
    setRedeemOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Redeem dropdown */}
      <div className="rounded-2xl border border-white/10 bg-[#0f172a]">
        <button
          type="button"
          onClick={() => setRedeemOpen(o => !o)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3"
          aria-expanded={redeemOpen}
          aria-controls="redeem-panel"
        >
          <div className="text-left">
            <div className="text-sm font-semibold text-white">Redeem a voucher</div>
            <div className="text-[11px] text-white/60">Enter a code to add tickets to your account</div>
          </div>
          <svg
            className={`h-5 w-5 shrink-0 transition-transform ${redeemOpen ? 'rotate-180' : 'rotate-0'}`}
            viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
          </svg>
        </button>

        {redeemOpen && (
          <div id="redeem-panel" className="px-4 pb-4">
            <RedeemVoucherPanel onRedeemed={handleRedeemed} />
          </div>
        )}
      </div>

      <Section
        title="My Tickets"
        right={
          <div className="flex gap-2">
            <Chip active={state === 'active'} onClick={() => setState('active')}>Active</Chip>
            <Chip active={state === 'completed'} onClick={() => setState('completed')}>Completed</Chip>
            <Chip active={state === 'all'} onClick={() => setState('all')}>All</Chip>
          </div>
        }
      >
        <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={theme === 'all'} onClick={() => setTheme('all')}>All</Chip>
          {themeOrder.map(th => (
            <Chip key={th} active={theme === th} onClick={() => setTheme(th)}>
              {th}
            </Chip>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-white/70 py-10">Loading…</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center text-white/60 py-10">No tickets found</div>
        ) : (
          themeOrder
            .filter(th => grouped[th]?.length)
            .map(th => (
              <div key={th} className="space-y-2">
                <div className="text-xs text-white/60">{th.toUpperCase()}</div>
                <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 snap-x snap-mandatory
                                [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {grouped[th].map((t, i) => (
                    <div key={i} className="snap-start shrink-0 w-60">
                      <EnhancedTicketCard ticket={t} theme={t.theme} />
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </Section>
    </div>
  );
}

/* -------------------------------- Stages tab -------------------------------- */
function StagesPanel({ userId, username }) {
  const router = useRouter();
  const [stageTickets, setStageTickets] = useState([]);
  const [history, setHistory] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [t, h, n] = await Promise.all([
          fetchJSON(`/api/user/stage-tickets?userId=${encodeURIComponent(userId)}`).catch(() => []),
          fetchJSON(`/api/stages/history?userId=${encodeURIComponent(userId)}`).catch(() => []),
          fetchJSON(`/api/stages/next?userId=${encodeURIComponent(userId)}`).catch(() => null),
        ]);
        if (!mounted) return;
        setStageTickets(Array.isArray(t) ? t : []);
        setHistory(Array.isArray(h) ? h : []);
        setNext(n && n.next ? n.next : null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const stats = useMemo(() => {
    const played = history.length;
    const advances = history.filter(r => r.advanced).length;
    const winRate = played ? Math.round((100 * advances) / played) : 0;
    const ranks = history.map(r => r.rank).filter(Boolean);
    const bestRank = ranks.length ? Math.min(...ranks) : '—';
    const avgRank = ranks.length ? Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length) : '—';
    return { played, advances, winRate, bestRank, avgRank };
  }, [history]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <XPSpendModalTrigger userId={userId} username={username} />
      </div>

      {next && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-400/50 bg-emerald-400/10 p-3">
          <div className="text-white text-sm">
            Continue your run: <span className="font-bold">Stage {next.stage}</span>
          </div>
          <button
            onClick={() => router.push(`/battles?stage=${next.stage}`)}
            className="bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg"
          >
            Continue
          </button>
        </div>
      )}

      <Section title="My Stage Tickets">
        {loading ? (
          <div className="text-center text-white/70 py-6">Loading…</div>
        ) : stageTickets.length === 0 ? (
          <div className="text-center text-white/60 py-6">You have no stage tickets yet.</div>
        ) : (
          <div className="flex overflow-x-auto gap-3 -mx-2 px-2 snap-x snap-mandatory
                          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {stageTickets.map((t, i) => (
              <div key={i} className="snap-start shrink-0 min-w-[180px] rounded-xl border border-cyan-300 bg-white/5 p-3">
                <div className="text-sm text-white font-bold">Stage {t.stage}</div>
                <div className="text-xs text-white/70 mt-1">{t.count} ticket(s)</div>
                {t.expiresAt && (
                  <div className="text-[11px] text-white/60 mt-1">Expires: {formatDate2(t.expiresAt)}</div>
                )}
                <button
                  onClick={() => location.assign(`/battles?stage=${t.stage}`)}
                  className="mt-3 w-full bg-cyan-400 text-black font-bold text-sm py-2 rounded-lg"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Stage History"
        right={
          <div className="text-xs text-white/60">
            Played {stats.played} • Advances {stats.advances} • Win {stats.winRate}% • Best {stats.bestRank} • Avg {stats.avgRank}
          </div>
        }
      >
        {loading ? (
          <div className="text-center text-white/70 py-6">Loading…</div>
        ) : history.length === 0 ? (
          <div className="text-center text-white/60 py-6">No history yet</div>
        ) : (
          <div className="rounded-2xl border border-cyan-600 bg-[#0f172a] overflow-hidden">
            <div className="grid grid-cols-5 text-xs text-white/60 border-b border-white/10 px-3 py-2">
              <div>When</div>
              <div>Stage</div>
              <div>Room</div>
              <div>Rank</div>
              <div>Advanced</div>
            </div>
            {history.map((r, i) => (
              <div key={i} className="grid grid-cols-5 text-xs px-3 py-2 border-b border-white/5">
                <div className="text-white/80">{formatDateTime2(r.playedAt)}</div>
                <div className="text-white">Stage {r.stage}</div>
                <div className="text-white/80">{r.roomSlug || '—'}</div>
                <div className="text-cyan-300">{r.rank ?? '—'}</div>
                <div className={r.advanced ? 'text-emerald-400' : 'text-white/60'}>{r.advanced ? 'Yes' : 'No'}</div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Stages XP">
        <StagesXPSection userId={userId} />
      </Section>
    </div>
  );
}

/* ------------------------------- Rewards tab ------------------------------- */
function RewardsPanel({ user }) {
  const [checking, setChecking] = useState(true);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  const [referral, setReferral] = useState({
    signupCount: 0,
    ticketsEarned: 0,
    miniGamesBonus: 0,
    userReferralCode: user?.username,
    totalBonusTickets: 0,
    competitionBreakdown: {},
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (user?.uid) {
        try {
          setChecking(true);
          const res = await axios.post('/api/pi-cash-code-winner-check', { uid: user.uid });
          if (mounted && res.data?.success && res.data?.isWinner) setWinner(res.data.winner);
        } catch {} finally {
          if (mounted) setChecking(false);
        }
      } else {
        setChecking(false);
      }
      try {
        const r = await axios.get(`/api/referrals/stats?user=${user.username}`);
        if (mounted)
          setReferral({
            signupCount: r.data?.signupCount || 0,
            ticketsEarned: r.data?.ticketsEarned || 0,
            miniGamesBonus: r.data?.miniGamesBonus || 0,
            userReferralCode: r.data?.userReferralCode || user.username,
            totalBonusTickets: r.data?.totalBonusTickets || 0,
            competitionBreakdown: r.data?.competitionBreakdown || {},
          });
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [user?.uid, user?.username]);

  const handleClaimSuccess = result => {
    setWinner(null);
    setMessage(`🎉 Successfully claimed ${result.prizeAmount} π! Check your Pi wallet.`);
    setTimeout(() => setMessage(''), 5000);
  };
  const handleClaimExpired = () => {
    setWinner(null);
    setMessage('⏰ Claim window expired. Prize rolled over to next week.');
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="space-y-6">
      {checking ? (
        <div className="text-center text-white/70 py-10">Checking rewards…</div>
      ) : (
        <>
          {winner && <PiCashClaimBox winner={winner} onClaimSuccess={handleClaimSuccess} onClaimExpired={handleClaimExpired} />}
          {message && (
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500 rounded-xl p-4 text-center">
              <p className="text-green-400 font-semibold">{message}</p>
            </div>
          )}
        </>
      )}

      <Section title="Referral Rewards" right={<span className="text-xs text-gray-300">Code: {referral.userReferralCode}</span>}>
        <ReferralStatsCard
          username={user.username}
          signupCount={referral.signupCount}
          ticketsEarned={referral.ticketsEarned}
          miniGamesBonus={referral.miniGamesBonus}
          userReferralCode={referral.userReferralCode}
          totalBonusTickets={referral.totalBonusTickets}
          competitionBreakdown={referral.competitionBreakdown}
        />
      </Section>
    </div>
  );
}

/* -------------------------- Compact XP (reused) -------------------------- */
function CompactXPBar({ userId }) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [next, setNext] = useState(100);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch(`/api/user/xp/get?userId=${encodeURIComponent(userId)}`);
        const data = await resp.json();
        if (mounted && resp.ok) {
          setXp(data.xp ?? 0);
          setLevel(data.level ?? 1);
          setNext(data.nextLevelXP ?? 100);
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const pct = Math.min(100, Math.floor((next ? xp / next : 0) * 100));

  return (
    <div className="rounded-xl border border-cyan-300 bg-[#0f172a] p-3">
      <div className="flex items-center justify-between text-[11px] text-white/70">
        <span className="font-semibold text-white">Stages XP</span>
        <span>Level {level}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[11px] text-white/60 flex items-center justify-between">
        <span>
          {xp}/{next} XP
        </span>
        <span>{Math.max(0, next - xp)} to next</span>
      </div>
    </div>
  );
}

/* -------------------- Special ticket helpers & cards -------------------- */
function isLaunchTicket(ticket) {
  const s = (ticket?.competitionSlug || '').toLowerCase();
  const t = (ticket?.competitionTitle || '').toLowerCase();
  return s.includes('launch') || s.includes('launch-week') || t.includes('launch') || t.includes('launch-week');
}

function formatPrizeForPi(prizeLike) {
  if (prizeLike === 0 || prizeLike) {
    const s = String(prizeLike);
    if (s.includes('π')) return s;
    const n = Number(s);
    return Number.isNaN(n) ? s : `${n} π`;
  }
  return 'N/A';
}

function TopGlow({ from, to }) {
  return (
    <div
      className={`h-1.5 w-full rounded-full bg-gradient-to-r ${from} ${to} opacity-70`}
      aria-hidden="true"
    />
  );
}

function MetaRow({ quantity, drawDate, isActive, accent = 'text-cyan-300' }) {
  return (
    <div className="grid grid-cols-3 gap-1 text-[11px]">
      <div className="truncate"><span className={accent}>🎟</span> {quantity}</div>
      <div className="truncate"><span className={accent}>🕒</span> {formatDate2(drawDate)}</div>
      <div className={`truncate ${isActive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isActive ? 'Active' : 'Closed'}
      </div>
    </div>
  );
}

function SoftBadge({ children, border, text }) {
  return (
    <span
      className={`text-[10px] inline-block mt-1 px-2 py-0.5 rounded-full border ${border} ${text} backdrop-blur-sm`}
    >
      {children}
    </span>
  );
}

function PrizePanel({ label, value, ring, border, bg, textMain, textSub, compressed }) {
  const h = compressed ? 'h-20' : 'h-24';
  return (
    <div
      className={`relative ${h} w-full rounded-xl ${border} ${bg} grid place-items-center overflow-hidden`}
      role="img"
      aria-label={`${label}: ${value}`}
    >
      <div className={`absolute inset-0 rounded-xl ring-1 ${ring} pointer-events-none`} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-40" />
      <div className="text-center px-3">
        <div className={`text-[11px] ${textSub} tracking-widest uppercase mb-0.5`}>{label}</div>
        <div className={`text-base font-extrabold ${textMain} truncate max-w-[14rem]`} title={value}>
          {value}
        </div>
        <div className={`text-[10px] ${textSub} tracking-widest uppercase mt-0.5`}>Up for Grabs</div>
      </div>
    </div>
  );
}

/* ---- PI Ticket (text-only, app-matched) ---- */
function PiTicketCard({ ticket, compressed = false }) {
  const drawDate = toDateSafe(ticket.drawDate) || resolveDrawDateLike(ticket) || FAR_FUTURE;
  const isActive = computeIsActive(ticket);
  const prize = formatPrizeForPi(ticket.prize);

  return (
    <div
      className={`w-64 snap-start bg-[#0f172a] text-white border-2 rounded-2xl p-3 space-y-2 shrink-0
                  border-yellow-400/60 hover:border-yellow-300 transition
                  shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-0.5`}
    >
      <TopGlow from="from-yellow-400/60" to="to-cyan-300/60" />

      <div className="text-center">
        <h3 className="text-sm font-bold truncate">{ticket.competitionTitle}</h3>
        <SoftBadge border="border-yellow-400/50" text="text-yellow-300">{ticket.live ? 'LIVE' : 'PI PRIZE'}</SoftBadge>
      </div>

      {isFreeTicket(ticket, 'pi') && (
        <div className="w-full">
          <div className="mx-auto mb-1 w-fit px-2 py-0.5 text-[10px] rounded-full border border-yellow-300/40 text-yellow-200/90">
            FREE ENTRY
          </div>
        </div>
      )}

      <PrizePanel
        label="Prize"
        value={prize}
        ring="ring-yellow-400/30"
        border="border border-yellow-400/30"
        bg="bg-yellow-400/10"
        textMain="text-yellow-300"
        textSub="text-yellow-200/80"
        compressed={compressed}
      />

      <MetaRow
        quantity={ticket.quantity}
        drawDate={drawDate}
        isActive={isActive}
        accent="text-yellow-300"
      />

      {ticket.ticketNumbers?.length > 0 && !compressed && (
        <div className="text-[10px] text-yellow-100/80 mt-2 max-h-24 overflow-y-auto">
          <strong>Ticket IDs:</strong> {ticket.ticketNumbers.join(', ')}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Activity tab ------------------------------- */
/* ------------------------------- Activity tab ------------------------------- */
function ActivityPanel({ userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');    // all | entry | reward
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | completed | failed
  const [sort, setSort] = useState('new');                // new | old | amount

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await fetchJSON(`/api/pi/transactions?userId=${encodeURIComponent(userId)}`);
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  // Helpers
  const short = (s) => (s ? `${String(s).slice(0, 6)}…${String(s).slice(-4)}` : '—');
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };
  const statusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    const base = 'text-[10px] px-2 py-0.5 rounded-full border';
    if (s.includes('pending')) return `${base} border-amber-400/40 text-amber-300 bg-amber-400/10`;
    if (s.includes('complete') || s === 'succeeded' || s === 'success')
      return `${base} border-emerald-400/40 text-emerald-300 bg-emerald-400/10`;
    if (s.includes('fail') || s.includes('error') || s.includes('cancel'))
      return `${base} border-red-400/40 text-red-300 bg-red-400/10`;
    return `${base} border-white/15 text-white/70`;
  };

  // Filtering + sorting
  const filtered = useMemo(() => {
    let arr = items.slice();
    const text = q.trim().toLowerCase();

    if (text) {
      arr = arr.filter(tx =>
        (tx.memo || '').toLowerCase().includes(text) ||
        (tx.paymentId || '').toLowerCase().includes(text) ||
        (tx.txId || '').toLowerCase().includes(text)
      );
    }
    if (typeFilter !== 'all') arr = arr.filter(tx => (tx.type || '').toLowerCase() === typeFilter);
    if (statusFilter !== 'all') arr = arr.filter(tx => (tx.status || '').toLowerCase().includes(statusFilter));

    if (sort === 'new') arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'old') arr.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === 'amount') arr.sort((a,b) => (Number(b.amount)||0) - (Number(a.amount)||0));

    return arr;
  }, [items, q, typeFilter, statusFilter, sort]);

  // Group by YYYY-MM-DD
  const grouped = useMemo(() => {
    const map = {};
    for (const tx of filtered) {
      const d = new Date(tx.createdAt);
      const key = isNaN(d) ? 'Unknown' : d.toISOString().slice(0,10); // YYYY-MM-DD
      (map[key] = map[key] || []).push(tx);
    }
    // return entries sorted by date desc
    return Object.entries(map).sort(([a],[b]) => (a < b ? 1 : -1));
  }, [filtered]);

  async function resend(paymentId) {
    try {
      const res = await fetch('/api/pi/resend-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      if (!res.ok) throw new Error('Failed');
      alert('Resend requested ✅');
    } catch (e) {
      alert(e.message || 'Could not resend');
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="rounded-xl border border-white/10 bg-[#0f172a] p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search memo, paymentId, txId…"
            className="flex-1 bg-[#0b1220] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400"
          />
          <div className="flex gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e)=>setTypeFilter(e.target.value)}
              className="bg-[#0b1220] border border-white/10 rounded-lg px-2 py-2 text-xs outline-none focus:border-cyan-400"
            >
              <option value="all">All types</option>
              <option value="entry">Entries</option>
              <option value="reward">Rewards</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e)=>setStatusFilter(e.target.value)}
              className="bg-[#0b1220] border border-white/10 rounded-lg px-2 py-2 text-xs outline-none focus:border-cyan-400"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={sort}
              onChange={(e)=>setSort(e.target.value)}
              className="bg-[#0b1220] border border-white/10 rounded-lg px-2 py-2 text-xs outline-none focus:border-cyan-400"
            >
              <option value="new">Newest first</option>
              <option value="old">Oldest first</option>
              <option value="amount">Amount (high→low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center text-white/70 py-10">Loading…</div>
      ) : grouped.length === 0 ? (
        <div className="text-center text-white/60 py-10">No transactions</div>
      ) : (
        grouped.map(([day, list]) => (
          <div key={day} className="space-y-2">
            <div className="text-xs text-white/50 font-semibold mt-2">
              {day === 'Unknown' ? 'Unknown date' : new Date(day).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
            </div>
            {list.map(tx => {
              const isPending = String(tx.status || '').toLowerCase().includes('pending');
              return (
                <div key={tx.paymentId} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  {/* Top row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <div className="text-white font-semibold truncate">{tx.memo || '—'}</div>
                      <span className={statusBadge(tx.status)}>{tx.status || '—'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-300/50 text-cyan-200">
                        {Number(tx.amount) || 0} π
                      </span>
                      {tx.type && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-white/70">
                          {tx.type}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/60">{formatDateTime2(tx.createdAt)}</div>
                  </div>

                  {/* IDs */}
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-white/70">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white/60">Payment ID:</span>
                      <span className="break-all">{tx.paymentId}</span>
                      <button
                        onClick={() => copy(tx.paymentId)}
                        className="ml-auto sm:ml-0 text-[10px] px-2 py-0.5 rounded border border-white/15 hover:bg-white/5"
                      >
                        Copy
                      </button>
                    </div>
                    {tx.txId ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white/60">txId:</span>
                        <span className="break-all">{tx.txId}</span>
                        <button
                          onClick={() => copy(tx.txId)}
                          className="ml-auto sm:ml-0 text-[10px] px-2 py-0.5 rounded border border-white/15 hover:bg-white/5"
                        >
                          Copy
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white/60">txId:</span>
                        <span className="text-white/40">—</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {tx.needsCompletion && (
                    <div className="mt-3">
                      <button
                        onClick={() => resend(tx.paymentId)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg ${
                          isPending
                            ? 'bg-amber-400 text-black'
                            : 'bg-white/10 text-white/60 cursor-not-allowed'
                        }`}
                        disabled={!isPending}
                        title={isPending ? 'Trigger server completion' : 'Completion not needed'}
                      >
                        Resend server completion
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}


/* ---- DAILY Ticket (text-only) ---- */
function DailyTicketCard({ ticket, compressed = false }) {
  const drawDate = toDateSafe(ticket.drawDate) || resolveDrawDateLike(ticket) || FAR_FUTURE;
  const isActive = computeIsActive(ticket);

  return (
    <div
      className={`w-64 snap-start bg-[#0f172a] text-white border-2 rounded-2xl p-3 space-y-2 shrink-0
                  border-emerald-400/60 hover:border-emerald-300 transition
                  shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5`}
    >
      <TopGlow from="from-emerald-400/60" to="to-cyan-300/60" />

      <div className="text-center">
        <h3 className="text-sm font-bold truncate">{ticket.competitionTitle}</h3>
        <SoftBadge border="border-emerald-400/50" text="text-emerald-300">{ticket.live ? 'LIVE' : 'DAILY TICKET'}</SoftBadge>
      </div>

      {isFreeTicket(ticket, 'daily') && (
        <div className="mx-auto mb-1 w-fit px-2 py-0.5 text-[10px] rounded-full border border-emerald-300/40 text-emerald-200/90">
          FREE ENTRY
        </div>
      )}

      <PrizePanel
        label="Today’s Prize"
        value={ticket.prize || 'N/A'}
        ring="ring-emerald-400/30"
        border="border border-emerald-400/30"
        bg="bg-emerald-400/10"
        textMain="text-emerald-300"
        textSub="text-emerald-200/80"
        compressed={compressed}
      />

      <MetaRow
        quantity={ticket.quantity}
        drawDate={drawDate}
        isActive={isActive}
        accent="text-emerald-300"
      />

      {ticket.ticketNumbers?.length > 0 && !compressed && (
        <div className="text-[10px] text-emerald-100/80 mt-2 max-h-24 overflow-y-auto">
          <strong>Ticket IDs:</strong> {ticket.ticketNumbers.join(', ')}
        </div>
      )}
    </div>
  );
}

/* ---- LAUNCH WEEK Ticket (text-only) ---- */
function LaunchTicketCard({ ticket, compressed = false }) {
  const drawDate = toDateSafe(ticket.drawDate) || resolveDrawDateLike(ticket) || FAR_FUTURE;
  const isActive = computeIsActive(ticket);

  return (
    <div
      className={`w-64 snap-start bg-[#0f172a] text-white border-2 rounded-2xl p-3 space-y-2 shrink-0
                  border-pink-400/60 hover:border-pink-300 transition
                  shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5`}
    >
      <TopGlow from="from-pink-400/60" to="to-cyan-300/60" />

      <div className="text-center">
        <h3 className="text-sm font-bold truncate">{ticket.competitionTitle}</h3>
        <SoftBadge border="border-pink-400/50" text="text-pink-300">{ticket.live ? 'LIVE' : 'LAUNCH WEEK'}</SoftBadge>
      </div>

      {isFreeTicket(ticket, 'free') && (
        <div className="mx-auto mb-1 w-fit px-2 py-0.5 text-[10px] rounded-full border border-pink-300/40 text-pink-200/90">
          FREE ENTRY
        </div>
      )}

      <PrizePanel
        label="Promo Prize"
        value={ticket.prize || 'N/A'}
        ring="ring-pink-400/30"
        border="border border-pink-400/30"
        bg="bg-pink-400/10"
        textMain="text-pink-300"
        textSub="text-pink-200/80"
        compressed={compressed}
      />

      <MetaRow
        quantity={ticket.quantity}
        drawDate={drawDate}
        isActive={isActive}
        accent="text-pink-300"
      />

      {ticket.ticketNumbers?.length > 0 && !compressed && (
        <div className="text-[10px] text-pink-100/80 mt-2 max-h-24 overflow-y-auto">
          <strong>Ticket IDs:</strong> {ticket.ticketNumbers.join(', ')}
        </div>
      )}
    </div>
  );
}

/* --------------------------- Ticket Card (router) --------------------------- */
function EnhancedTicketCard({ ticket, theme, compressed = false }) {
  if (!ticket) return null;

  if (theme === 'pi') return <PiTicketCard ticket={ticket} compressed={compressed} />;
  if (theme === 'daily') return <DailyTicketCard ticket={ticket} compressed={compressed} />;
  if (isLaunchTicket(ticket) || theme === 'launch') return <LaunchTicketCard ticket={ticket} compressed={compressed} />;

  const drawDate = toDateSafe(ticket.drawDate) || resolveDrawDateLike(ticket) || FAR_FUTURE;
  const isActive = computeIsActive(ticket);

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
    tech: 'border-blue-500 bg-gradient-to-br from-blue-900/20 to-blue-800/20',
    premium: 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-purple-800/20',
    pi: 'border-yellow-500 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20',
    daily: 'border-green-500 bg-gradient-to-br from-green-900/20 to-green-800/20',
    free: 'border-cyan-500 bg-gradient-to-br from-cyan-900/20 to-cyan-800/20',
    cashcode: 'border-pink-500 bg-gradient-to-br from-pink-900/20 to-pink-800/20',
  };

  const cardWidth = compressed ? 'w-48' : 'w-64';
  const imageHeight = compressed ? 'h-24' : 'h-32';

  return (
    <div
      className={`${cardWidth} snap-start bg-[#0f172a] text-white border-2 rounded-2xl p-3 space-y-2 shrink-0 transition
                  hover:-translate-y-0.5 hover:shadow-cyan-500/10 ${themeStyles[theme] || themeStyles.tech}`}
    >
      <TopGlow from="from-cyan-400/60" to="to-blue-400/60" />

      <div className="text-center">
        <h3 className="text-sm font-bold truncate">{ticket.competitionTitle}</h3>
        <span className={`text-[10px] font-medium ${statusColor} mt-1 block`}>{statusLabel}</span>
      </div>

      <Image
        src={ticket.imageUrl || '/images/pi2.png'}
        alt={ticket.prize || 'Prize'}
        width={300}
        height={compressed ? 96 : 128}
        className={`w-full object-cover rounded-md ${imageHeight} ring-1 ring-white/10`}
        unoptimized
      />

      <div className="grid grid-cols-2 text-xs gap-1">
        <p className="col-span-2 text-cyan-300 font-medium truncate">{ticket.prize}</p>
        <p>🎟 {ticket.quantity}</p>
        <p>🕒 {formatDate2(drawDate)}</p>
        <p className={isActive ? 'text-emerald-400' : 'text-red-400'}>{isActive ? 'Active' : 'Closed'}</p>
      </div>

      {!compressed && ticket.ticketNumbers?.length > 0 && (
        <div className="text-[10px] text-gray-300 mt-2 text-left max-h-24 overflow-y-auto break-words whitespace-pre-wrap leading-relaxed">
          <strong>Ticket IDs:</strong>
          <div className="mt-1">{ticket.ticketNumbers.join(', ')}</div>
        </div>
      )}
    </div>
  );
}

/* ----------------------- XP Spend Modal + Trigger ----------------------- */
/* ----------------------- XP Spend Modal + Trigger (v3) ----------------------- */
function XPSpendModalTrigger({ userId, username }) {
  const [open, setOpen] = useState(false);
  const [xp, setXp] = useState(null);
  const [level, setLevel] = useState(null);
  const disabled = !userId;

  // Fetch XP/Level (so the chip is accurate before opening)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userId) { setXp(null); setLevel(null); return; }
      try {
        const res = await fetch(`/api/user/xp/get?userId=${encodeURIComponent(userId)}`);
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          setXp(j?.xp ?? 0);
          setLevel(j?.level ?? 1);
        } else {
          setXp(0);
          setLevel(1);
        }
      } catch {
        if (mounted) { setXp(0); setLevel(1); }
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  // Keyboard shortcut: ⌘/Ctrl + Shift + X
  useEffect(() => {
    function onKey(e) {
      const mod = e.ctrlKey || e.metaKey; // Ctrl (Win/Linux) or Cmd (Mac)
      if (mod && e.shiftKey && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        if (!disabled) setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled]);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* XP chip (hidden if we don’t know yet) */}
        {xp != null && (
          <span
            className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full
                       border border-cyan-300/60 text-cyan-200 bg-cyan-300/10"
            title={`Level ${level ?? 1}`}
            aria-label={`XP ${xp}, Level ${level ?? 1}`}
          >
            XP: <span className="font-bold">{xp}</span>
          </span>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className={`text-[12px] px-3 py-1.5 rounded-lg font-bold shadow-sm transition
            ${disabled
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-cyan-400 text-black hover:brightness-110'
            }`}
          aria-haspopup="dialog"
          aria-expanded={open ? 'true' : 'false'}
          aria-controls="xp-spend-modal"
          title="Spend XP (⌘/Ctrl + Shift + X)"
        >
          Spend XP
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div id="xp-spend-modal">
          <XPSpendModal
            userId={userId}
            username={username}
            isOpen={open}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}


function XPSpendModal({ userId, username, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [offers, setOffers] = useState([]);
  const [myTicketCounts, setMyTicketCounts] = useState({});
  const [spending, setSpending] = useState({});
  const [msg, setMsg] = useState('');
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all'); // all | eligible | locked
  const [sort, setSort] = useState('xp'); // xp | end | az

  const safeSlug = (s) => (s || '').replace(/^\/+|\/+$/g, '');

  // Extract a human-readable "first prize" from multiple possible shapes
  const firstPrize = (raw) => {
    const c = raw?.comp || raw || {};
    if (typeof c.prize === 'string' && c.prize.trim()) return c.prize.trim();

    // prizes: [{ prize: '...' }] or ['...']
    if (Array.isArray(c.prizes) && c.prizes.length) {
      const p0 = c.prizes[0];
      if (typeof p0 === 'string' && p0.trim()) return p0.trim();
      if (p0 && typeof p0.prize === 'string' && p0.prize.trim()) return p0.prize.trim();
    }

    // prizeBreakdown: [{ prize: '...' }, ...]
    if (Array.isArray(c.prizeBreakdown) && c.prizeBreakdown.length) {
      const b0 = c.prizeBreakdown[0];
      if (b0 && typeof b0.prize === 'string' && b0.prize.trim()) return b0.prize.trim();
    }

    return null;
  };

 const normOffer = (raw) => {
  const comp = raw.comp || raw;
  const slug = safeSlug(comp.slug || raw.slug || (comp.href || '').split('/').pop());
  const id = raw._id || comp._id || slug || `${slug}-${comp?.xpCost || 0}`;
  const title = comp.title || raw.title || 'Competition';
  const endsAt = comp.endsAt || comp.closeAt || comp.drawAt || comp.drawDate || raw.endsAt || null;
  const status = comp.status || raw.status || 'active';
  const entryFeePi = typeof comp.entryFee === 'number' ? comp.entryFee : raw.entryFeePi; // keep either

  const xpCost = Number(comp.xpCost ?? raw.xpCost ?? 0) || 0;
  const minLevel = Number(comp.minLevel ?? raw.minLevel ?? 1) || 1;

  // Prefer server-sent prize (already normalized)
  const prize =
    (typeof raw.prize === 'string' && raw.prize) ? raw.prize :
    (typeof comp.prize === 'string' && comp.prize) ? comp.prize :
    null;

  return { id, slug, title, endsAt, status, xpCost, minLevel, entryFeePi, prize };
};


  useEffect(() => {
    if (!isOpen || !userId) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      setMsg('');
      try {
        // XP & Level
        const xpRes = await fetch(`/api/user/xp/get?userId=${encodeURIComponent(userId)}`).catch(() => null);
        if (xpRes?.ok) {
          const j = await xpRes.json();
          if (mounted) {
            setXp(j?.xp ?? 0);
            setLevel(j?.level ?? 1);
          }
        } else {
          if (mounted) { setXp(0); setLevel(1); }
        }

        // Offers
        let normalized = [];
        try {
          const o1 = await fetch(`/api/xp/offers`);
          if (o1.ok) {
            const data = await o1.json();
            const arr = Array.isArray(data) ? data : (Array.isArray(data?.offers) ? data.offers : []);
            normalized = arr.map(normOffer).filter(o => (o.xpCost ?? 0) > 0);
          }
        } catch {}

        // My ticket counts by slug
        let counts = {};
        try {
          let tRes = await fetch(`/api/user/tickets?username=${encodeURIComponent(username || '')}`);
          if (!tRes.ok || !username) {
            tRes = await fetch(`/api/user/tickets?userId=${encodeURIComponent(userId)}`);
          }
          if (tRes.ok) {
            const arr = await tRes.json();
            if (Array.isArray(arr)) {
              for (const tk of arr) {
                const slug = safeSlug(tk.competitionSlug || '');
                if (!slug) continue;
                counts[slug] = (counts[slug] || 0) + (tk.quantity || 0);
              }
            }
          }
        } catch {}

        if (!mounted) return;

        const now = Date.now();
        const withFlags = normalized.map(o => {
          const isClosed =
            (o.status && String(o.status).toLowerCase() === 'closed') ||
            (o.endsAt ? new Date(o.endsAt).getTime() < now : false);
          const canSpend = (xp >= o.xpCost) && (level >= o.minLevel) && !isClosed;
          return { ...o, isClosed, canSpend, youOwn: counts[o.slug] || 0 };
        });

        setOffers(withFlags);
        setMyTicketCounts(counts);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [isOpen, userId, username]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    let arr = offers;
    if (text) arr = arr.filter(o => o.title.toLowerCase().includes(text) || o.slug.toLowerCase().includes(text));
    if (tab === 'eligible') arr = arr.filter(o => o.canSpend);
    if (tab === 'locked') arr = arr.filter(o => !o.canSpend);
    if (sort === 'xp') arr = [...arr].sort((a,b) => a.xpCost - b.xpCost);
    if (sort === 'end') arr = [...arr].sort((a,b) => {
      const ta = a.endsAt ? new Date(a.endsAt).getTime() : Infinity;
      const tb = b.endsAt ? new Date(b.endsAt).getTime() : Infinity;
      return ta - tb;
    });
    if (sort === 'az') arr = [...arr].sort((a,b) => a.title.localeCompare(b.title));
    return arr;
  }, [offers, q, tab, sort]);

  async function spend(o) {
    if (!o?.id) return;
    setSpending(s => ({ ...s, [o.id]: true }));
    setMsg('');
    try {
      const res = await fetch(`/api/user/xp/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, competitionId: o.id, slug: o.slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || 'Could not spend XP.');
      }
      setXp(x => Math.max(0, x - (o.xpCost || 0)));
      setOffers(list => list.map(it => it.id === o.id ? { ...it, youOwn: (it.youOwn || 0) + 1, canSpend: (xp - (o.xpCost||0)) >= (it.xpCost||0) } : it));
      setMsg(`✅ Spent ${o.xpCost} XP on “${o.title}”. Ticket added.`);
    } catch (e) {
      setMsg(`⚠️ ${e.message || 'Something went wrong'}`);
    } finally {
      setSpending(s => ({ ...s, [o.id]: false }));
    }
  }

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative z-[101] w-full max-w-2xl rounded-2xl border border-cyan-300/60 bg-[#0b1220] text-white shadow-2xl mx-3 sm:mx-0 overflow-hidden">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-[#0b1220]/95 backdrop-blur border-b border-white/10">
          <div className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold">Spend XP on Competitions</h3>
              <div className="mt-1 text-xs text-white/70 flex items-center gap-3">
                <span>XP: <span className="text-cyan-300 font-bold">{xp}</span></span>
                <span>Level: <span className="text-cyan-300 font-bold">{level}</span></span>
              </div>
            </div>
            <button onClick={onClose} className="px-3 py-1.5 rounded-md border border-white/15 text-white/80 hover:bg-white/5 text-sm">Close</button>
          </div>

          {/* Controls */}
          <div className="px-4 pb-3 flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search competitions…"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 text-xs">⌘K</span>
              </div>
              <div className="flex items-center gap-2">
                {['all','eligible','locked'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                      tab === t ? 'bg-cyan-400 text-black border-cyan-400' : 'border-white/15 text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {t[0].toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-[#0f172a] border border-white/10 rounded-lg px-2 py-2 text-xs outline-none focus:border-cyan-400"
              >
                <option value="xp">Sort: Lowest XP</option>
                <option value="end">Sort: Ending Soon</option>
                <option value="az">Sort: A → Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[70vh] overflow-auto space-y-3">
          {loading ? (
            <XPListSkeleton />
          ) : filtered.length === 0 ? (
            <div className="text-center text-white/70 py-14">
              {q
                ? <>No results for <span className="text-cyan-300">“{q}”</span>.</>
                : <>No XP offers available right now.</>
              }
            </div>
          ) : (
            filtered.map(o => {
              const disabled = !o.canSpend || spending[o.id];
              const reason =
                o.isClosed ? 'Closed'
                : level < o.minLevel ? `Requires L${o.minLevel}`
                : xp < o.xpCost ? `${o.xpCost - xp} XP short`
                : null;

              return (
                <div key={o.id} className="rounded-xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#0e1426] p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`/competitions/${encodeURIComponent(o.slug)}`}
                          className="font-semibold text-white hover:underline truncate"
                          title={o.title}
                        >
                          {o.title}
                        </a>

                        {/* Chips */}
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-300/50 text-cyan-200">
                          {o.xpCost} XP
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-white/70">
                          Min L{o.minLevel}
                        </span>
                        {o.endsAt && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-white/60">
                            Ends {formatDate2(o.endsAt)}
                          </span>
                        )}
                        {o.entryFeePi != null && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-white/60">
                            {o.entryFeePi} π
                          </span>
                        )}
                        {o.isClosed && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-400/40 text-red-300">
                            Closed
                          </span>
                        )}
                      </div>

                      {/* Prize highlighted */}
                    <div className="mt-2">
  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-cyan-300/60 text-cyan-200 bg-cyan-300/10">
    <span>🏆 1st Prize:</span>
    <span className="font-bold">
      {o.prize
        ? isNaN(Number(o.prize))
          ? o.prize
          : `${o.prize} π`
        : 'N/A'}
    </span>
  </span>
</div>


                      {/* You own tickets */}
                      <div className="mt-1 text-xs text-white/70">
                        You own <span className="text-cyan-300 font-bold">{o.youOwn || 0}</span> ticket{o.youOwn === 1 ? '' : 's'}.
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <a
                        href={`/competitions/${encodeURIComponent(o.slug)}`}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/15 hover:bg-white/5"
                      >
                        View
                      </a>
                      <button
                        disabled={disabled}
                        onClick={() => spend(o)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold min-w-[120px] ${
                          disabled
                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                            : 'bg-cyan-400 text-black hover:brightness-110'
                        }`}
                      >
                        {spending[o.id] ? 'Processing…' : `Spend ${o.xpCost} XP`}
                      </button>
                      {!o.canSpend && reason && (
                        <div className="text-[10px] text-white/60">
                          {reason} {xp < o.xpCost && (
                            <a href="/battles?stage=1" className="text-cyan-300 hover:underline ml-1">Grind Stages →</a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-[#0b1220]/95 backdrop-blur border-t border-white/10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-white/70">
              Rule: ~<span className="text-cyan-300 font-semibold">1 XP per 0.15π</span>. Big comps may need higher levels.
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/battles?stage=1"
                className="text-xs px-3 py-1.5 rounded-lg border border-cyan-300/60 text-cyan-200 hover:bg-cyan-300/10"
              >
                Play Stage 1 (+1 XP)
              </a>
              <button
                onClick={onClose}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
              >
                Done
              </button>
            </div>
          </div>
          {msg && (
            <div className="px-4 pb-4">
              <div className="rounded-lg border border-white/15 bg-white/5 p-3 text-sm text-white/90">
                {msg}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ---------------------------- Skeleton list UI ---------------------------- */
function XPListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_,i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-[#0f172a] p-3">
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-lg bg-white/5 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="h-4 w-40 bg-white/10 rounded mb-2 animate-pulse" />
              <div className="h-3 w-64 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="w-28">
              <div className="h-8 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


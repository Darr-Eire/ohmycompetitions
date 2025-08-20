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
const themeOrder = ['tech','premium','pi','daily','free','cashcode'];

function categorizeTicket(slug, title) {
  const s = (slug || '').toLowerCase();
  const t = (title || '').toLowerCase();

  if (s.includes('cash-code') || t.includes('cash code')) return 'cashcode';
  if (s.includes('pi-') || t.includes('pi ')) return 'pi';
  if (s.includes('daily') || t.includes('daily')) return 'daily';
  if (s.includes('free') || s.includes('moon')) return 'free';

  if (
    ['dubai','holiday','penthouse','weekend','getaway','flight','hotel','luxury']
      .some(k => s.includes(k) || t.includes(k))
  ) return 'premium';

  if (
    ['ps5','xbox','nintendo','gaming','tech']
      .some(k => s.includes(k) || t.includes(k))
  ) return 'tech';

  return 'tech';
}

/* --------------------------------- helpers ---------------------------------- */
async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

// Always show 2-digit year (e.g. 16/08/25)
function formatDate2(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// Date + time with 2-digit year
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

        {/* Quick stats + compact XP */}
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
        {activeTab === 'stages' && <StagesPanel userId={userId} />}
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
        // Primary: lightweight endpoint
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
        // Fallback: compute from full tickets
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
    </div>
  );
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
      const enhanced = arr.map(t => ({
        ...t,
        theme: categorizeTicket(t.competitionSlug, t.competitionTitle),
        drawDate: t.drawDate || t.endsAt || new Date().toISOString(),
      }));
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

  const now = new Date();
  const filtered = tickets.filter(t => {
    const draw = new Date(t.drawDate);
    const matchesTheme = theme === 'all' ? true : t.theme === theme;
    const matchesState = state === 'all' ? true : state === 'active' ? draw > now : draw <= now;
    return matchesTheme && matchesState;
  });

  const grouped = useMemo(() => {
    const g = {};
    for (const t of filtered) (g[t.theme] = g[t.theme] || []).push(t);
    return g;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* New: Redeem voucher box (refreshes tickets on success) */}
      <RedeemVoucherPanel onRedeemed={loadTickets} />

      <Section
        title="My Tickets"
        right={
          <div className="flex gap-2">
            <Chip active={state === 'active'} onClick={() => setState('active')}>
              Active
            </Chip>
            <Chip active={state === 'completed'} onClick={() => setState('completed')}>
              Completed
            </Chip>
            <Chip active={state === 'all'} onClick={() => setState('all')}>
              All
            </Chip>
          </div>
        }
      >
        <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={theme === 'all'} onClick={() => setTheme('all')}>
            All
          </Chip>
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
function StagesPanel({ userId }) {
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
              <div key={i} className="snap-start shrink-0 min-w-[180px] rounded-xl border border-cyan-300 bg:white/5 bg-white/5 p-3">
                <div className="text-sm text-white font-bold">Stage {t.stage}</div>
                <div className="text-xs text:white/70 text-white/70 mt-1">{t.count} ticket(s)</div>
                {t.expiresAt && (
                  <div className="text*[11px] text:white/60 text-white/60 mt-1">Expires: {formatDate2(t.expiresAt)}</div>
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
      // Pi Cash check
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
      // Referrals
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

/* ------------------------------- Activity tab ------------------------------- */
function ActivityPanel({ userId }) {
  const [type, setType] = useState('all'); // all | entry | reward
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return () => {
      mounted = false;
    };
  }, [userId]);

  const filtered = items.filter(t => (type === 'all' ? true : t.type === type));

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
      <div className="flex gap-2">
        <Chip active={type === 'all'} onClick={() => setType('all')}>
          All
        </Chip>
        <Chip active={type === 'entry'} onClick={() => setType('entry')}>
          Entries
        </Chip>
        <Chip active={type === 'reward'} onClick={() => setType('reward')}>
          Rewards
        </Chip>
      </div>

      {loading ? (
        <div className="text-center text-white/70 py-10">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-white/60 py-10">No transactions</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(tx => (
            <div key={tx.paymentId} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex justify-between text-sm">
                <div className="text-white font-semibold">{tx.memo || '—'}</div>
                <div className="text-cyan-300 font-bold">{tx.amount} π</div>
              </div>
              <div className="text-xs text-white/60 mt-1 space-y-0.5">
                <div>
                  Status: <span className="text-white/80">{tx.status}</span>
                </div>
                <div>Type: {tx.type}</div>
                <div>
                  Payment ID: <span className="break-all">{tx.paymentId}</span>
                </div>
                {tx.txId ? (
                  <div>
                    txId: <span className="break-all">{tx.txId}</span>
                  </div>
                ) : null}
                <div>{formatDateTime2(tx.createdAt)}</div>
              </div>
              {tx.needsCompletion && (
                <div className="mt-2">
                  <button
                    onClick={() => resend(tx.paymentId)}
                    className="text-xs bg-amber-400 text-black font-bold px-3 py-1 rounded-lg"
                  >
                    Resend server completion
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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

/* --------------------------- Ticket Card (inlined) --------------------------- */
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
      className={`${cardWidth} snap-start bg-[#1e293b] text-white border-2 rounded-xl shadow-lg p-3 space-y-2 shrink-0 ${
        themeStyles[theme] || themeStyles.tech
      }`}
    >
      <div className="text-center">
        <h3 className="text-sm font-bold truncate">{ticket.competitionTitle}</h3>
        <span className={`text-xs font-medium ${statusColor} mt-1 block`}>{statusLabel}</span>
      </div>

      <Image
        src={ticket.imageUrl || '/images/pi2.png'}
        alt={ticket.prize || 'Prize'}
        width={300}
        height={compressed ? 96 : 128}
        className={`w-full object-cover rounded-md ${imageHeight}`}
        unoptimized
      />

      <div className="grid grid-cols-2 text-xs gap-1">
        <p className="col-span-2 text-cyan-300 font-medium truncate">{ticket.prize}</p>
        <p>🎟 {ticket.quantity}</p>
        {/* crypto/price line removed on purpose */}
        <p>🕒 {formatDate2(drawDate)}</p>
        <p>{isActive ? '🟢 Active' : '🔴 Closed'}</p>
      </div>

      {!compressed && ticket.ticketNumbers && ticket.ticketNumbers.length > 0 && (
        <div className="text-[10px] text-gray-300 mt-2 text-left max-h-24 overflow-y-auto break-words whitespace-pre-wrap leading-relaxed">
          <strong>Ticket IDs:</strong>
          <div className="mt-1">{ticket.ticketNumbers.join(', ')}</div>
        </div>
      )}
    </div>
  );
}

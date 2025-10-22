// src/pages/account.js
'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { usePiAuth } from '../context/PiAuthContext';
import GiftTicketModal from 'components/GiftTicketModal';
import PiCashClaimBox from 'components/PiCashClaimBox';
import StagesXPSection from '../components/StagesXPSection';
import RedeemVoucherPanel from 'components/RedeemVoucherPanel';
import AccountTicketsPanel from 'components/AccountTicketsPanel';

/* ---------- Client-only modal to avoid SSR DOM issues ---------- */
const XPSpendModalTrigger = dynamic(
  () => import('../components/account/XPSpendModalTrigger'),
  { ssr: false }
);

/* ------------------------------ utilities ------------------------------ */
const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ohmycompetitions.com').replace(/\/+$/, '');
const href = (url) => (/^https?:\/\//i.test(site) ? site : `https://${site}`) + url;

function buildReferralLink(username) {
  const u = username || '';
  return u ? `${href(`/signup?ref=${encodeURIComponent(u)}`)}` : '';
}

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

/* -------------------------- tiny UI primitives -------------------------- */
function IconChevronDown(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" clipRule="evenodd" />
    </svg>
  );
}

function SegButton({ active, children, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`flex-1 min-w-[70px] inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition border
        ${active ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_30px_#00fff055]'
                 : 'border-white/10 text-white/80 hover:bg-white/5'}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span className="truncate">{children}</span>
    </button>
  );
}

function SectionCard({ title, right, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/5 ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-white font-bold text-sm">{title}</h3>
        {right}
      </div>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

function CopyMono({ value, label = 'ID' }) {
  const [copied, setCopied] = useState(false);
  const v = value || '';
  const masked = useMemo(() => (v ? `${v.slice(0, 4)}••••${v.slice(-4)}` : '—'), [v]);

  const copy = useCallback(async () => {
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }, [v]);

  return (
    <button
      onClick={copy}
      className="text-[11px] px-2 py-1 rounded-md bg-[#0b1220] border border-white/10 text-white/80 hover:text-white"
      aria-label={`Copy ${label}`}
      title="Copy"
      type="button"
    >
      <span className="font-semibold text-white/70 mr-1">{label}:</span>
      <span className="font-mono">{masked}</span>
      <span className="ml-2 text-cyan-300">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

/* ------------------------------ main page ------------------------------ */
export default function Account() {
  const router = useRouter();
  const { user, loginWithPi } = usePiAuth();

  // derive referral code
  const [refCode, setRefCode] = useState(user?.referralCode || user?.username || '');
  const refLink = useMemo(() => buildReferralLink(refCode), [refCode]);

  // tab state (tickets default)
  const [activeTab, setActiveTab] = useState('tickets');
  useEffect(() => {
    if (!router.isReady) return;
    const tab = (router.query?.tab ?? 'tickets').toString();
    setActiveTab(tab);
  }, [router.isReady, router.query?.tab]);

  // gift modal
  const [showGift, setShowGift] = useState(false);

  // load referral code (server truth)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user) return;
        const userId = user.uid || user.piUserId;
        if (!userId) {
          if (mounted) setRefCode(user?.referralCode || user?.username || '');
          return;
        }
        const rsp = await fetch(`/api/referrals/me?userId=${encodeURIComponent(userId)}`);
        if (rsp?.ok) {
          const j = await rsp.json();
          if (mounted && j?.referralCode) setRefCode(j.referralCode);
          else if (mounted) setRefCode(user?.referralCode || user?.username || '');
        } else if (mounted) {
          setRefCode(user?.referralCode || user?.username || '');
        }
      } catch {
        if (mounted) setRefCode(user?.referralCode || user?.username || '');
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  if (!user) {
    return (
      <div className="bg-[#0a1024] min-h-[100dvh] max-w-md mx-auto p-6 text-white flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-cyan-300 text-center">Login with Pi to view your dashboard</p>
        <button
          onClick={loginWithPi}
          className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-6 rounded-xl hover:brightness-110"
          type="button"
        >
          Login with Pi Network
        </button>
      </div>
    );
  }

  const userId = user.uid || user.piUserId;
  const avatarLetter = user.username?.[0]?.toUpperCase() || 'P';

  return (
    <div className="relative z-0 bg-[#0a1024] min-h-[100dvh] max-w-md mx-auto text-white pb-[76px]">
      {/* Top safe area header */}
      <header className="sticky top-0 z-50 bg-[#0a1024]/90 backdrop-blur border-b border-white/10">
        <div className="px-4 pt-3 pb-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold grid place-items-center text-lg select-none">
            {avatarLetter}
          </div>
          <div className="min-w-0">
            <div className="font-bold truncate text-white">{user.username || 'Pioneer'}</div>
            <div className="mt-1">
              <CopyMono value={userId} />
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowGift(true)}
              className="px-3 py-2 rounded-lg bg-cyan-400 text-black text-xs font-bold"
              type="button"
            >
              Gift Ticket
            </button>
            <ShareReferralButton refLink={refLink} />
          </div>
        </div>

        {/* Segmented tabs */}
        <nav className="px-4 pb-3" role="tablist" aria-label="Account sections">
          <div className="grid grid-cols-4 gap-2">
            <SegButton active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')}>Tickets</SegButton>
            <SegButton active={activeTab === 'stages'} onClick={() => setActiveTab('stages')}>Stages</SegButton>
            <SegButton active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')}>Rewards</SegButton>
            <SegButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>Activity</SegButton>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="p-4 space-y-6">
        {activeTab === 'tickets' && <TicketsPanel user={user} />}
        {activeTab === 'stages' && <StagesPanel userId={userId} username={user.username} />}
        {activeTab === 'rewards' && <RewardsPanel user={user} />}
        {activeTab === 'activity' && <ActivityPanel userId={userId} />}
      </main>

      {/* Bottom action bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-md px-4 pb-5 pt-3 bg-[#0a1024]/90 backdrop-blur border-t border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigator.share ? navigator.share({ title: 'OMC Referral', url: refLink }) : window.open(refLink, '_blank', 'noopener,noreferrer')}
              className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/5"
              type="button"
            >
              Share Referral
            </button>
            <button
              onClick={() => setShowGift(true)}
              className="flex-1 rounded-xl bg-cyan-400 text-black px-4 py-3 text-sm font-bold"
              type="button"
            >
              Gift Ticket
            </button>
          </div>
        </div>
      </footer>

      <GiftTicketModal isOpen={showGift} onClose={() => setShowGift(false)} />
    </div>
  );
}

/* ------------------------------ Tickets Panel ------------------------------ */
function TicketsPanel({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeemOpen, setRedeemOpen] = useState(false);

  const loadTickets = useCallback(async () => {
    if (!user?.username) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`/api/user/tickets?username=${encodeURIComponent(user.username)}`);
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setTickets([]);
      setError('Could not load tickets. Pull to refresh or try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Redeem a voucher"
        right={
          <button
            type="button"
            onClick={() => setRedeemOpen((o) => !o)}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/5"
            aria-expanded={redeemOpen}
            aria-controls="redeem-panel"
          >
            {redeemOpen ? 'Hide' : 'Show'}
          </button>
        }
      >
        {redeemOpen && (
          <div id="redeem-panel">
            <RedeemVoucherPanel onRedeemed={loadTickets} />
          </div>
        )}
        {!redeemOpen && (
          <p className="text-[13px] text-white/70">Enter a code to add tickets to your account.</p>
        )}
      </SectionCard>

      {loading ? (
        <TicketSkeleton />
      ) : error ? (
        <ErrorBox message={error} onRetry={loadTickets} />
      ) : (
        <AccountTicketsPanel tickets={tickets} loading={loading} />
      )}
    </div>
  );
}

/* ------------------------------ Stages Panel ------------------------------ */
function StagesPanel({ userId, username }) {
  const router = useRouter();
  const [stageTickets, setStageTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [next, setNext] = useState(null);

  const loadStages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tickets, nxt] = await Promise.all([
        fetchJSON(`/api/user/stage-tickets?userId=${encodeURIComponent(userId)}`).catch(() => []),
        fetchJSON(`/api/stages/next?userId=${encodeURIComponent(userId)}`).catch(() => null),
      ]);
      setStageTickets(Array.isArray(tickets) ? tickets : []);
      setNext(nxt && nxt.next ? nxt.next : null);
    } catch (e) {
      setStageTickets([]);
      setError('Could not load your stages.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadStages(); }, [loadStages]);

  return (
    <div className="space-y-4">
      {next && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-400/50 bg-emerald-400/10 p-3">
          <div className="text-white text-sm">
            Continue your run: <span className="font-bold">Stage {next.stage}</span>
          </div>
          <button
            onClick={() => router.push(`/stages?stage=${next.stage}`)}
            className="bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg"
            type="button"
          >
            Continue
          </button>
        </div>
      )}

      <SectionCard title="My Stage Tickets" right={<RefreshButton onClick={loadStages} />}>
        {loading ? (
          <StageTicketSkeleton />)
        : error ? (
          <ErrorBox message={error} onRetry={loadStages} />
        ) : stageTickets.length === 0 ? (
          <EmptyState title="No stage tickets yet" subtitle="Earn or buy tickets to start a run." />
        ) : (
          <div
            className="flex overflow-x-auto gap-3 -mx-2 px-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {stageTickets.map((t, i) => (
              <div key={i} className="snap-start shrink-0 min-w-[180px] rounded-xl border border-cyan-300 bg-white/5 p-3">
                <div className="text-sm text-white font-bold">Stage {t.stage}</div>
                <div className="text-xs text-white/70 mt-1">{t.count} ticket(s)</div>
                {t.expiresAt && (
                  <div className="text-[11px] text-white/60 mt-1">Expires: {new Date(t.expiresAt).toLocaleDateString()}</div>
                )}
                <button
                  onClick={() => router.push(`/stages?stage=${t.stage}`)}
                  className="mt-3 w-full bg-cyan-400 text-black font-bold text-sm py-2 rounded-lg"
                  type="button"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Stages XP">
        <StagesXPSection userId={userId} />
      </SectionCard>

      <div className="flex justify-end">
        <XPSpendModalTrigger userId={userId} username={username} />
      </div>
    </div>
  );
}

/* ------------------------------ Rewards Panel ------------------------------ */
function RewardsPanel({ user }) {
  const [checking, setChecking] = useState(true);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setChecking(true);
        const res = await axios.post('/api/pi-cash-code-winner-check', { uid: user.uid });
        if (mounted && res.data?.success && res.data?.isWinner) setWinner(res.data.winner);
        if (mounted && res.data?.message) setMessage(res.data.message);
      } catch {}
      finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [user?.uid]);

  return (
    <div className="space-y-4">
      {checking ? (
        <RewardsSkeleton />
      ) : (
        <>
          {winner && <PiCashClaimBox winner={winner} />}
          {message && (
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500 rounded-xl p-4 text-center">
              <p className="text-green-400 font-semibold">{message}</p>
            </div>
          )}
          {!winner && !message && (
            <EmptyState title="No rewards yet" subtitle="Keep playing, redeem vouchers, and complete stages to earn rewards." />
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------ Activity Panel ------------------------------ */
function ActivityPanel({ userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchJSON(`/api/pi/transactions?userId=${encodeURIComponent(userId)}`);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setError('Could not load transactions.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="text-center text-white/70 py-10">Loading transactions…</div>;

  return items.length === 0 ? (
    <EmptyState title="No transactions yet" subtitle="Your purchases and wins will appear here." />
  ) : (
    <div className="space-y-3">
      {error && <ErrorBox message={error} onRetry={load} />}
      {items.map((tx) => (
        <div key={tx.paymentId} className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold truncate pr-3">{tx.memo || '—'}</span>
            <span className="text-cyan-300 shrink-0">{tx.amount} π</span>
          </div>
          <div className="text-xs text-white/60">{new Date(tx.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ micro comps ------------------------------ */
function TicketSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}
function StageTicketSkeleton() {
  return (
    <div className="flex gap-3">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-28 w-40 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}
function RewardsSkeleton() {
  return <div className="h-24 rounded-xl bg-white/5 animate-pulse" />;
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <p className="text-white font-semibold">{title}</p>
      {subtitle && <p className="text-white/70 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function ErrorBox({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-red-300 text-sm">{message}</p>
        {onRetry && (
          <button onClick={onRetry} type="button" className="px-3 py-1 rounded-lg bg-white/10 text-white/90 text-xs hover:bg-white/20">Retry</button>
        )}
      </div>
    </div>
  );
}

function RefreshButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/5">Refresh</button>
  );
}

/* ---------------------- Share Referral Button ---------------------- */
function ShareReferralButton({ refLink }) {
  const [copied, setCopied] = useState(false);

  const onClick = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'OMC Referral', url: refLink });
        return;
      }
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // As a fallback just open it (e.g., some older browsers)
      window.open(refLink, '_blank', 'noopener,noreferrer');
    }
  }, [refLink]);

  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-lg border border-white/15 text-xs hover:bg-white/5"
      title="Share referral link"
      type="button"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}

// src/pages/account.js
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { usePiAuth } from '../context/PiAuthContext';
import GiftTicketModal from 'components/GiftTicketModal';
import PiCashClaimBox from 'components/PiCashClaimBox';
import StagesXPSection from 'components/StagesXPSection';
import RedeemVoucherPanel from 'components/RedeemVoucherPanel';
import AccountTicketsPanel from 'components/AccountTicketsPanel';

/* ---------- Client-only modal to avoid SSR DOM issues ---------- */
const XPSpendModalTrigger = dynamic(
  () => import('../components/account/XPSpendModalTrigger'),
  { ssr: false }
);

/* -------------------------- Tiny UI Primitives -------------------------- */
function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`px-3 py-1 rounded-full text-xs border transition
        ${active ? 'bg-cyan-400 text-black border-cyan-400'
                 : 'border-white/15 text-white/80 hover:bg-white/5'}`}
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
      type="button"
    >
      <span className="font-semibold text-white/70 mr-1">{label}:</span>
      <span className="font-mono">{masked}</span>
      <span className="ml-2 text-cyan-300">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

/* --------------------------- Fetch Helper --------------------------- */
async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

/* ------------------------------- Main Page ------------------------------- */
export default function Account() {
  const router = useRouter();
  const { user, loginWithPi } = usePiAuth();

  const [refCode, setRefCode] = useState(user?.referralCode || user?.username || '');

  // Build referral link (env-aware)
  const site =
    (process.env.NEXT_PUBLIC_SITE_URL || 'https://ohmycompetitions.com').replace(/\/+$/, '');
  const buildReferralLink = (username) =>
    `${/^https?:\/\//i.test(site) ? site : `https://${site}`}/signup?ref=${encodeURIComponent(
      username
    )}`;

  const refLink = refCode ? buildReferralLink(refCode) : '';

  // Tabs: derive from query when router is ready
  const [activeTab, setActiveTab] = useState('tickets');
  useEffect(() => {
    if (!router.isReady) return;
    const tab = (router.query?.tab ?? 'tickets').toString();
    setActiveTab(tab);
  }, [router.isReady, router.query?.tab]);

  const [showGift, setShowGift] = useState(false);

  // Load referral code
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
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="bg-[#0a1024] min-h-[100dvh] max-w-md mx-auto p-6 text-white flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-cyan-300 text-center">Log in with Pi to view your dashboard</p>
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

  return (
    <div className="relative z-0 bg-[#0a1024] min-h-[100dvh] max-w-md mx-auto text-white pt-16 sm:pt-20">
      {/* Profile Header (below global fixed header) */}
      <div className="bg-[#0a1024] border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
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
              type="button"
            >
              Gift Ticket
            </button>
            <ShareReferralButton refLink={refLink} />
          </div>
        </div>
      </div>

      {/* Tabs */}
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
          <Chip key={key} active={activeTab === key} onClick={() => setActiveTab(key)}>
            {label}
          </Chip>
        ))}
      </nav>

      {/* Panels */}
      <main className="p-4 space-y-6">
        {activeTab === 'tickets' && <TicketsPanel user={user} />}
        {activeTab === 'stages' && <StagesPanel userId={userId} username={user.username} />}
        {activeTab === 'rewards' && <RewardsPanel user={user} />}
        {activeTab === 'activity' && <ActivityPanel userId={userId} />}
      </main>

      <GiftTicketModal isOpen={showGift} onClose={() => setShowGift(false)} />
    </div>
  );
}

/* ------------------------------ Tickets Panel ------------------------------ */
function TicketsPanel({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemOpen, setRedeemOpen] = useState(false);

  const loadTickets = useCallback(async () => {
    if (!user?.username) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/user/tickets?username=${encodeURIComponent(user.username)}`
      );
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return (
    <div className="space-y-3">
      {/* Sticky voucher header pinned below global header */}
      <div className="sticky top-16 sm:top-20 z-40">
        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/95 backdrop-blur">
          <button
            type="button"
            onClick={() => setRedeemOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3"
            aria-expanded={redeemOpen}
            aria-controls="redeem-panel"
          >
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Redeem a voucher</div>
              <div className="text-[11px] text-white/60">Enter a code to add tickets to your account</div>
            </div>
            <svg
              className={`h-5 w-5 shrink-0 transition-transform ${
                redeemOpen ? 'rotate-180' : 'rotate-0'
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {redeemOpen && (
            <div id="redeem-panel" className="px-4 pb-4">
              <RedeemVoucherPanel onRedeemed={loadTickets} />
            </div>
          )}
        </div>
      </div>

      {/* Tickets list – page scrolls; no inner scroll trap */}
      <div>
        {loading ? <TicketSkeleton /> : <AccountTicketsPanel tickets={tickets} loading={loading} />}
      </div>
    </div>
  );
}

/* ------------------------------- Stages Panel ------------------------------- */
function StagesPanel({ userId, username }) {
  const router = useRouter();
  const [stageTickets, setStageTickets] = useState([]);
  const [history, setHistory] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStages = useCallback(async () => {
    setLoading(true);
    try {
      const [tickets, hist, nxt] = await Promise.all([
        fetchJSON(`/api/user/stage-tickets?userId=${encodeURIComponent(userId)}`).catch(() => []),
        fetchJSON(`/api/stages/history?userId=${encodeURIComponent(userId)}`).catch(() => []),
        fetchJSON(`/api/stages/next?userId=${encodeURIComponent(userId)}`).catch(() => null),
      ]);
      setStageTickets(Array.isArray(tickets) ? tickets : []);
      setHistory(Array.isArray(hist) ? hist : []);
      setNext(nxt && nxt.next ? nxt.next : null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

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
            onClick={() => router.push(`/stages?stage=${next.stage}`)}
            className="bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg"
            type="button"
          >
            Continue
          </button>
        </div>
      )}

      {/* My Stage Tickets */}
      <Section title="My Stage Tickets">
        {loading ? (
          <StageTicketSkeleton />
        ) : stageTickets.length === 0 ? (
          <div className="text-center text-white/60 py-6">You have no stage tickets yet.</div>
        ) : (
          <div
            className="flex overflow-x-auto gap-3 -mx-2 px-2 snap-x snap-mandatory
                       [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {stageTickets.map((t, i) => (
              <div
                key={i}
                className="snap-start shrink-0 min-w-[180px] rounded-xl border border-cyan-300 bg-white/5 p-3"
              >
                <div className="text-sm text-white font-bold">Stage {t.stage}</div>
                <div className="text-xs text-white/70 mt-1">{t.count} ticket(s)</div>
                {t.expiresAt && (
                  <div className="text-[11px] text-white/60 mt-1">
                    Expires: {new Date(t.expiresAt).toLocaleDateString()}
                  </div>
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
      </Section>

      <Section title="Stages XP">
        <StagesXPSection userId={userId} />
      </Section>
    </div>
  );
}

/* ------------------------------- Rewards Panel ------------------------------- */
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
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  return (
    <div className="space-y-6">
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
        </>
      )}
    </div>
  );
}

/* --------------------------- Activity Panel --------------------------- */
function ActivityPanel({ userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
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

  if (loading) {
    return <div className="text-center text-white/70 py-10">Loading transactions…</div>;
  }

  return items.length === 0 ? (
    <div className="text-center text-white/60 py-10">No transactions yet</div>
  ) : (
    <div className="space-y-3">
      {items.map((tx) => (
        <div key={tx.paymentId} className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">{tx.memo || '—'}</span>
            <span className="text-cyan-300">{tx.amount} π</span>
          </div>
          <div className="text-xs text-white/60">{new Date(tx.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------- Skeleton Loaders ---------------------- */
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

/* ---------------------- Share Referral Button ---------------------- */
function ShareReferralButton({ refLink }) {
  const [copied, setCopied] = useState(false);

  const onClick = useCallback(async () => {
    try {
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

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

/** ----------------------------- Utils ------------------ */
const FAR_FUTURE = new Date('2099-12-31T23:59:59Z');

function toDateSafe(val) {
  if (!val && val !== 0) return null;
  if (typeof val === 'number') return new Date(val < 1e12 ? val * 1000 : val);
  const s = String(val).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T23:59:59Z`);
  let d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d;
  d = new Date(s.replace(' ', 'T') + (/[zZ]|[+\-]\d{2}:?\d{2}$/.test(s) ? '' : 'Z'));
  return Number.isNaN(d.getTime()) ? null : d;
}

function resolveDrawDateLike(t) {
  const cands = [t.drawDate, t.draw_at, t.drawAt, t.endsAt, t.endDate, t.closesAt, t.expiresAt];
  for (const c of cands) {
    const d = toDateSafe(c);
    if (d) return d;
  }
  return null;
}

function isActiveTicket(t) {
  const d = resolveDrawDateLike(t) || FAR_FUTURE;
  return Date.now() < d.getTime();
}

function formatDate(dLike) {
  const d = new Date(dLike);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function categorizeTicket(ticket) {
  const slug = (ticket.competitionSlug || '').toLowerCase();
  const title = (ticket.competitionTitle || '').toLowerCase();

  if (slug.includes('cash-code') || title.includes('cash code')) return 'cashcode';
  if (slug.includes('daily') || title.includes('daily')) return 'daily';
  if (slug.includes('pi-') || title.includes('pi ') || slug.includes('pioneer')) return 'pi';

  if (
    slug.includes('dubai') || slug.includes('holiday') || title.includes('travel') ||
    title.includes('luxury') || slug.includes('penthouse') || slug.includes('weekend') ||
    slug.includes('getaway') || slug.includes('flight') || slug.includes('hotel')
  ) return 'premium';

  if (
    slug.includes('ps5') || slug.includes('xbox') || slug.includes('nintendo') ||
    slug.includes('tv') || slug.includes('macbook') || title.includes('gaming') || title.includes('tech')
  ) return 'tech';

  if (slug.includes('btc') || slug.includes('crypto') || title.includes('btc') || title.includes('crypto')) return 'crypto';
  if (slug.includes('free') || slug.includes('moon') || Number(ticket.entryFee) === 0) return 'free';

  return 'tech';
}

const THEME_META = {
  tech:     { label: 'Featured',  ring: 'ring-blue-400/30',   border: 'border-blue-500',    bg: 'from-blue-900/20 to-blue-800/20',   accent: 'text-blue-200',   borderSoft: 'border-blue-400/30' },
  premium:  { label: 'Travel',    ring: 'ring-purple-400/30', border: 'border-purple-500',  bg: 'from-purple-900/20 to-purple-800/20', accent: 'text-purple-200', borderSoft: 'border-purple-400/30' },
  pi:       { label: 'Pi',        ring: 'ring-yellow-400/30', border: 'border-yellow-500',  bg: 'from-yellow-900/20 to-yellow-800/20', accent: 'text-yellow-200', borderSoft: 'border-yellow-400/30' },
  daily:    { label: 'Daily',     ring: 'ring-emerald-400/30',border: 'border-emerald-500', bg: 'from-emerald-900/20 to-emerald-800/20', accent: 'text-emerald-200', borderSoft: 'border-emerald-400/30' },
  crypto:   { label: 'Crypto',    ring: 'ring-orange-400/30', border: 'border-orange-500',  bg: 'from-orange-900/20 to-orange-800/20', accent: 'text-orange-200', borderSoft: 'border-orange-400/30' },
  free:     { label: 'Free',      ring: 'ring-cyan-400/30',   border: 'border-cyan-500',    bg: 'from-cyan-900/20 to-cyan-800/20',     accent: 'text-cyan-200',   borderSoft: 'border-cyan-400/30' },
  cashcode: { label: 'Cash Code', ring: 'ring-pink-400/30',   border: 'border-pink-500',    bg: 'from-pink-900/20 to-pink-800/20',     accent: 'text-pink-200',   borderSoft: 'border-pink-400/30' },
};

const THEME_ORDER = ['pi','daily','tech','premium','crypto','free','cashcode'];

/** ----------------------------- Tiny UI -------------------------------- */
function Pill({ active, onClick, children }) {
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

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-[#0f172a] border border-cyan-300 px-2 py-2 text-center">
      <div className="text-[10px] text-white/70">{label}</div>
      <div className="text-sm font-extrabold text-cyan-300 truncate">{String(value)}</div>
    </div>
  );
}

/** ---------------------- Group identical competitions ------------------- */
function groupByCompetition(items) {
  const map = new Map();
  for (const t of items) {
    const key = (t.competitionSlug || t.competitionTitle || 'unknown').toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  }
  return Array.from(map.entries()).map(([key, tickets]) => {
    tickets.sort((a, b) => {
      const da = resolveDrawDateLike(a) || FAR_FUTURE;
      const db = resolveDrawDateLike(b) || FAR_FUTURE;
      return da - db; // earlier first, latest last (on top)
    });
    const sample = tickets[tickets.length - 1];
    const totalQuantity = tickets.reduce((s, it) => s + (Number(it.quantity) || 1), 0);
    const allTicketNumbers = tickets.flatMap((it) =>
      Array.isArray(it.ticketNumbers) ? it.ticketNumbers : []
    );
    // dedupe ids but preserve order
    const seen = new Set();
    const dedupIds = allTicketNumbers.filter((id) => (seen.has(id) ? false : (seen.add(id), true)));
    return { key, tickets, sample, totalQuantity, allTicketNumbers: dedupIds };
  });
}

/** --------------------- Prize (centered) for non-image themes ----------- */
function PrizeTile({ value, theme }) {
  const meta = THEME_META[theme] || THEME_META.tech;
  return (
    <div
      className={`relative w-full rounded-xl border ${meta.borderSoft} bg-gradient-to-b from-white/5 to-transparent p-3 grid place-items-center text-center`}
      role="img"
      aria-label={`Prize Pool: ${value || 'N/A'}`}
    >
      <div className="text-[10px] uppercase tracking-widest text-white/70">Prize Pool</div>
      <div
        className={`mt-1 text-xl font-extrabold ${meta.accent} leading-tight max-w-[14rem] truncate`}
        title={value || 'N/A'}
      >
        {value || 'N/A'}
      </div>
      <div className="mt-1 text-[10px] text-white/60 tracking-widest uppercase">Up for Grabs</div>
      <div className={`pointer-events-none absolute inset-0 rounded-xl ring-1 ${meta.ring}`} />
    </div>
  );
}

/** --------------------------- Ticket Card (glass) ----------------------- */
function TicketCard({ ticket, theme, compact = false }) {
  const meta = THEME_META[theme] || THEME_META.tech;
  const drawDate = resolveDrawDateLike(ticket) || FAR_FUTURE;
  const live = isActiveTicket(ticket);

  let statusLabel = 'Purchased';
  let statusColor = 'text-cyan-300';
  if (ticket.gifted)  { statusLabel = 'Gifted'; statusColor = 'text-yellow-300'; }
  if (ticket.earned)  { statusLabel = 'Earned'; statusColor = 'text-emerald-300'; }

  const showImage = theme === 'tech' || theme === 'premium';
  const media = showImage ? (
    <div className="relative">
      <Image
        src={ticket.imageUrl || '/images/pi2.png'}
        alt={ticket.prize || 'Prize'}
        width={320}
        height={compact ? 96 : 128}
        className={`w-full object-cover rounded-lg ring-1 ring-white/10 ${compact ? 'h-24' : 'h-32'}`}
        unoptimized
      />
      <div className={`pointer-events-none absolute inset-0 rounded-lg ring-1 ${meta.ring}`} />
      <span className={`absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded ${live ? 'bg-emerald-400 text-black' : 'bg-red-500 text-white'}`}>
        {live ? 'LIVE' : 'ENDED'}
      </span>
    </div>
  ) : (
    <PrizeTile value={ticket.prize} theme={theme} />
  );

  return (
    <div className={`w-[16rem] ${compact ? 'w-48' : ''} shrink-0 rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-3 text-white`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-black/20">
          {THEME_META[theme]?.label || 'Competition'}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${live ? 'bg-emerald-400 text-black' : 'bg-red-500 text-white'}`}>
          {live ? 'LIVE' : 'ENDED'}
        </span>
      </div>

      <div className="mt-1 text-sm font-bold truncate">{ticket.competitionTitle}</div>
      <div className={`text-[11px] ${statusColor}`}>• {statusLabel}</div>

      <div className="mt-2">{media}</div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded bg-white/5 px-2 py-1">🎟 {ticket.quantity || 1}</div>
        <div className="rounded bg-white/5 px-2 py-1">💰 {(Number(ticket.entryFee)||0).toFixed(2)} π</div>
        <div className="rounded bg-white/5 px-2 py-1">🕒 {formatDate(drawDate)}</div>
      </div>

      {!compact && ticket.ticketNumbers?.length > 0 && (
        <div className="mt-2 text-[10px] text-white/70 max-h-20 overflow-y-auto">
          <span className="text-white/60">Ticket IDs:</span> {ticket.ticketNumbers.join(', ')}
        </div>
      )}
      {!compact && ticket.gifted && ticket.giftedBy && (
        <div className="mt-2 text-[10px] text-yellow-200/90 bg-yellow-400/10 border border-yellow-400/30 px-2 py-1 rounded">
          🎁 From {ticket.giftedBy}
        </div>
      )}
    </div>
  );
}

/** --------------- Overlapped deck you can flick & expand --------------- */
function CompetitionDeck({ theme, group }) {
  const wrapperRef = useRef(null);
  const [selected, setSelected] = useState(group.tickets.length - 1); // latest on top
  const [showExpanded, setShowExpanded] = useState(false);
  const items = group.tickets;

  // layout for compact cards
  const CARD_W = 192;      // Tailwind w-48
  const CARD_H = 230;      // approx card height
  const OFFSET  = 56;      // step to the right

  const width  = CARD_W + Math.max(0, items.length - 1) * OFFSET;
  const height = CARD_H;

  // click a compact card → focus + expand
  function onSelect(i) {
    setSelected(i);
    setShowExpanded(true);
  }

  // click outside deck → collapse to stack
  useEffect(() => {
    function onDocClick(e) {
      const el = wrapperRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setShowExpanded(false);
    }
    function onEsc(e) {
      if (e.key === 'Escape') setShowExpanded(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="min-w-[18rem]">
      {/* Scrollable container for flicking through wide stacks */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory
                      [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div
          className="relative"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {items.map((t, i) => {
            const z = i === selected ? 50 : 10 + i;
            const isSelected = i === selected;
            return (
              <div
                key={`${group.key}-${i}`}
                className="absolute top-0 snap-start transition-transform duration-300 cursor-pointer"
                style={{ left: `${i * OFFSET}px`, zIndex: z }}
                onClick={() => onSelect(i)}
                title={t.competitionTitle}
              >
                <div className={`${isSelected && showExpanded ? 'scale-105 ring-2 ring-cyan-300/70' : 'scale-100'} rounded-2xl`}>
                  <TicketCard ticket={t} theme={theme} compact />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quantity chip for the whole deck */}
      <div
        className="inline-block -mt-1 mb-2 rounded-full bg-cyan-400 text-black text-xs font-bold px-2 py-1 shadow"
        title={`${group.totalQuantity} total tickets across ${items.length} purchase${items.length>1?'s':''}`}
      >
        ×{group.totalQuantity}
      </div>

      {/* Expanded details (click outside to collapse) */}
      {showExpanded && (
        <div className="mt-2 space-y-2">
          <TicketCard ticket={items[selected]} theme={theme} compact={false} />

          {/* ALL IDs across this competition */}
          {group.allTicketNumbers.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-semibold text-white/80 mb-1">
                All Ticket IDs in this Competition
                <span className="ml-2 text-[10px] text-white/60">({group.allTicketNumbers.length})</span>
              </div>
              <div className="text-[11px] text-white/70 max-h-36 overflow-y-auto break-words">
                {group.allTicketNumbers.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** ----------------------- Group row (collapsible) ----------------------- */
function GroupRow({ theme, items, defaultOpen=false }) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = THEME_META[theme] || THEME_META.tech;

  const totals = useMemo(() => {
    let qty = 0, active = 0;
    for (const t of items) {
      qty += Number(t.quantity)||0;
      if (isActiveTicket(t)) active++;
    }
    return { qty, active, count: items.length };
  }, [items]);

  const groups = useMemo(() => groupByCompetition(items), [items]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f172a]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`h-2 w-2 rounded-full ${meta.border.replace('border-','bg-')}`} />
          <div className="font-semibold text-white truncate">{meta.label}</div>
          <div className="text-[11px] text-white/60">
            {totals.count} comps • {totals.qty} tickets • {totals.active} live
          </div>
        </div>
        <svg className={`h-5 w-5 text-white/70 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="px-3 pb-3">
          <div className="flex overflow-x-auto gap-6 pb-2 -mx-1 px-1 snap-x snap-mandatory
                          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {groups.map((g) => (
              <div key={g.key} className="snap-start">
                <CompetitionDeck theme={theme} group={g} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** ----------------------- Main Tickets Panel ---------------------------- */
export default function AccountTicketsPanel({
  tickets = [],
  initialTab = 'active',        // 'all' | 'active' | 'completed' | 'gifted' | 'earned'
}) {
  const [tab, setTab] = useState(initialTab);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('endSoon'); // 'endSoon' | 'newest' | 'a2z'
  const [themeFilter, setThemeFilter] = useState('all'); // theme or 'all'

  // Derived + normalize
  const normalized = useMemo(() => {
    return tickets.map(t => ({
      ...t,
      __theme: categorizeTicket(t),
      __draw: resolveDrawDateLike(t) || FAR_FUTURE,
      __active: isActiveTicket(t),
      __title: (t.competitionTitle || '').toLowerCase(),
      __slug: (t.competitionSlug || '').toLowerCase(),
    }));
  }, [tickets]);

  // Search / tab / theme / sort pipeline
  const filtered = useMemo(() => {
    let arr = normalized;

    if (tab === 'active') arr = arr.filter(t => t.__active);
    if (tab === 'completed') arr = arr.filter(t => !t.__active);
    if (tab === 'gifted') arr = arr.filter(t => !!t.gifted);
    if (tab === 'earned') arr = arr.filter(t => !!t.earned);

    if (themeFilter !== 'all') arr = arr.filter(t => t.__theme === themeFilter);

    const qq = q.trim().toLowerCase();
    if (qq) {
      arr = arr.filter(t =>
        t.__title.includes(qq) || t.__slug.includes(qq) ||
        String(t.prize || '').toLowerCase().includes(qq)
      );
    }

    if (sort === 'endSoon') arr = [...arr].sort((a,b) => a.__draw - b.__draw);
    if (sort === 'newest')  arr = [...arr].sort((a,b) => b.__draw - a.__draw);
    if (sort === 'a2z')     arr = [...arr].sort((a,b) => a.__title.localeCompare(b.__title));

    return arr;
  }, [normalized, tab, themeFilter, q, sort]);

  // Group by theme in fixed order
  const grouped = useMemo(() => {
    const m = new Map();
    for (const th of THEME_ORDER) m.set(th, []);
    for (const t of filtered) {
      if (!m.has(t.__theme)) m.set(t.__theme, []);
      m.get(t.__theme).push(t);
    }
    return Array.from(m.entries()).filter(([,list]) => list.length > 0);
  }, [filtered]);

  // Quick stats
  const stats = useMemo(() => {
    const total = filtered.length;
    const live = filtered.filter(t => t.__active).length;
    const gifted = filtered.filter(t => t.gifted).length;
    const earned = filtered.filter(t => t.earned).length;
    return { total, live, gifted, earned };
  }, [filtered]);

  return (
    <div className="rounded-2xl border border-cyan-600 bg-[#0b1022] text-white">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-[#0b1022]/95 backdrop-blur border-b border-white/10 p-3 space-y-3">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Ticket filters">
          {[
            ['active','Active'],
            ['completed','Completed'],
            ['gifted','Gifted'],
            ['earned','Earned'],
            ['all','All'],
          ].map(([k,label]) => (
            <Pill key={k} active={tab===k} onClick={() => setTab(k)}>{label}</Pill>
          ))}
        </div>

        {/* Search + sort + theme */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Search by title, slug, prize…"
            className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400"
          />
          <div className="flex gap-2 flex-wrap">
            <select
              value={sort}
              onChange={e=>setSort(e.target.value)}
              className="bg-[#0f172a] border border-white/10 rounded-lg px-2 py-2 text-xs outline-none focus:border-cyan-400"
            >
              <option value="endSoon">Ending Soon</option>
              <option value="newest">Newest</option>
              <option value="a2z">A → Z</option>
            </select>
            <select
              value={themeFilter}
              onChange={e=>setThemeFilter(e.target.value)}
              className="bg-[#0f172a] border border-white/10 rounded-lg px-2 py-2 text-xs outline-none focus:border-cyan-400"
            >
              <option value="all">All themes</option>
              {THEME_ORDER.map(th => (
                <option key={th} value={th}>{THEME_META[th].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2">
          <Stat label="Total" value={stats.total} />
          <Stat label="Live" value={stats.live} />
          <Stat label="Gifted" value={stats.gifted} />
          <Stat label="Earned" value={stats.earned} />
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center text-white/70 py-12">
            No tickets match your filters.
          </div>
        ) : (
          grouped.map(([theme, list]) => (
            <GroupRow key={theme} theme={theme} items={list} defaultOpen />
          ))
        )}
      </div>
    </div>
  );
}

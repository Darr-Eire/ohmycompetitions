'use client'

import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw, Search, Sparkles } from 'lucide-react'

/* Lazy cards */
const DailyCompetitionCard   = dynamic(() => import('components/DailyCompetitionCard').catch(() => null), { ssr:false })
const LaunchCompetitionCard  = dynamic(() => import('components/LaunchCompetitionCard').catch(() => null), { ssr:false })
const PiCompetitionCard      = dynamic(() => import('components/PiCompetitionCard').catch(() => null), { ssr:false })
const FreeCompetitionCard    = dynamic(() => import('components/FreeCompetitionCard').catch(() => null), { ssr:false })
const TechCompetitionCard    = dynamic(() => import('components/CompetitionCard').catch(() => null), { ssr:false })

/* Config */
const REFRESH_MS = 20000
const CATS = [
  { id: 'tech',       label: 'Tech',          emoji: '📱' },
  { id: 'launch',     label: 'Launch',        emoji: '🚀' },
  { id: 'dailyweekly',label: 'Weekly/Daily',  emoji: '🔥' },
  { id: 'pi',         label: 'Pi',            emoji: '🎁' },
  { id: 'stages',     label: 'Pi Stages',     emoji: '🏆' },
  { id: 'free',       label: 'Free',          emoji: '✨' },
]
const CATEGORY_ORDER = CATS.map(c => c.id)

/* Utils */
const now = () => new Date().getTime()
const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
const toNum = (v, d = 0) => {
  if (v == null) return d
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const s = v.replace(/[^\d.,-]/g, '').replace(',', '.')
    const n = Number(s)
    return Number.isFinite(n) ? n : d
  }
  return d
}
const timeTo = (date) => (date ? new Date(date).getTime() - now() : 0)
function msParts(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return { days, hours, minutes, seconds }
}
function pad(n) { return n < 10 ? `0${n}` : `${n}` }
function getStatus(cLike) {
  const c = cLike.comp ?? cLike
  const start = c?.startsAt || c?.startAt || c?.drawOpensAt
  const end   = c?.endsAt   || c?.endAt   || c?.drawAt      || c?.closingAt
  const ts = now()
  const startMs = start ? new Date(start).getTime() : null
  const endMs   = end   ? new Date(end).getTime()   : null
  if (startMs && ts < startMs) return 'upcoming'
  if (endMs && ts > endMs) return 'ended'
  return 'live'
}

/* Image fallbacks (tech) */
const TECH_KEYWORDS = [
  { re:/iphone|ios|apple/i,               img:'/images/iphone.jpg' },
  { re:/samsung|galaxy/i,                 img:'/images/galaxy.jpg' },
  { re:/ipad|tablet/i,                    img:'/images/tablet.jpg' },
  { re:/ps5|playstation/i,                img:'/images/playstation.jpeg' },
  { re:/xbox/i,                           img:'/images/xbox.jpg' },
  { re:/nintendo|switch/i,                img:'/images/switch.jpg' },
  { re:/laptop|macbook|notebook/i,        img:'/images/laptop.jpg' },
  { re:/drone|dji/i,                      img:'/images/drone.jpg' },
  { re:/smartwatch|watch|fitbit|garmin/i, img:'/images/watch.jpg' },
]
const PLACEHOLDER_IMG = '/images/placeholder.jpg'
function isAbs(url='') { return /^https?:\/\//i.test(url) || url?.startsWith('/') }
function normalizePath(url='') { if (!url) return ''; return isAbs(url) ? url : `/${url.replace(/^\.?\//,'')}` }
function techFallbackImage({title='', tags=[]}) {
  const text = `${title} ${(Array.isArray(tags)?tags.join(' '):'')}`.toLowerCase()
  for (const {re, img} of TECH_KEYWORDS) if (re.test(text)) return img
  return PLACEHOLDER_IMG
}

/* Normalizer */
function normalizeComp(raw) {
  const c0 = raw?.comp ?? raw ?? {};

  // 🔹 Normalize fee and price fields from multiple schema variations
  const pricePi =
    c0.pricePi ??
    c0.entryFeePi ??
    c0.ticketPricePi ??
    c0.piAmount ??
    toNum(c0.entryFee ?? c0.price ?? c0.ticketPrice ?? c0.feePi ?? 0);

  const totalTickets = toNum(
    c0.totalTickets ?? c0.ticketsTotal ?? c0.capacity ?? c0.capacityTotal ?? 0
  );
  const ticketsSold = toNum(
    c0.ticketsSold ?? c0.sold ?? c0.entries ?? c0.entriesCount ?? 0
  );
  const maxPerUser = toNum(
    c0.maxPerUser ?? c0.limitPerUser ?? c0.maxEntriesPerUser ?? 0
  );

  const startsAt = c0.startsAt || c0.startAt || c0.drawOpensAt || null;
  const endsAt = c0.endsAt || c0.endAt || c0.drawAt || c0.closingAt || null;

  const prizePi = c0.prizePi ?? null;
  const prizeText =
    raw.prize ?? c0.prize ?? c0.prizeText ?? (prizePi ? `${prizePi} π` : '');
  const prize = prizeText;

  const title = raw.title ?? c0.title ?? 'Competition';
  const slug = c0.slug || raw.slug || title;
  const tags = Array.isArray(c0.tags) ? c0.tags : [];
  const theme = (c0.theme ?? raw.theme ?? '') || '';

  let imageUrl =
    c0.imageUrl || c0.bannerUrl || c0.cover || c0.thumbnail || '';
  if (!imageUrl && Array.isArray(c0.images) && c0.images.length) {
    imageUrl = c0.images[0]?.url || c0.images[0];
  }
  if (!imageUrl) imageUrl = techFallbackImage({ title, tags });
  imageUrl = normalizePath(imageUrl);

  const freeEntryUrl = c0.freeEntryUrl || c0.freeMethodUrl || null;

  const comp = {
    ...c0,
    _id: c0._id || raw?._id || slug,
    slug,
    title,
    prize,
    prizePi: prizePi ?? undefined,
    pricePi: toNum(pricePi, 0),
    feePi: toNum(pricePi, 0), // 🔹 ensure feePi always set
    totalTickets,
    ticketsSold,
    maxPerUser,
    startsAt,
    endsAt,
    imageUrl,
    tags,
    theme,
    freeEntryUrl,
  };

  return {
    _id: comp._id,
    slug,
    title,
    prize,
    prizePi: comp.prizePi,
    pricePi: comp.pricePi,
    feePi: comp.feePi,
    totalTickets,
    ticketsSold,
    maxPerUser,
    startsAt,
    endsAt,
    imageUrl,
    tags,
    theme,
    freeEntryUrl,
    comp,
  };
}


/* Category classifier */
const kw = (s = '', re) => re.test(String(s).toLowerCase())
function getThemeId(c) {
  const raw = String(c.theme ?? c.comp?.theme ?? '').toLowerCase().trim()
  if (!raw) return null
  if (raw === 'launch' || raw === 'launch-week' || raw === 'launchweek') return 'launch'
  if (raw === 'daily' || raw === 'weekly' || raw === 'dailyweekly')      return 'dailyweekly'
  if (raw === 'pi' || raw === 'giveaways' || raw === 'pi-giveaways')     return 'pi'
  if (raw === 'stages' || raw === 'pi-stages')                            return 'stages'
  if (raw === 'free' || raw === 'no-fee')                                 return 'free'
  if (raw === 'tech' || raw === 'gadgets' || raw === 'technology')        return 'tech'
  return null
}
function classifyCategory(c) {
  const themed = getThemeId(c)
  if (themed) return themed
  const tags = (c.tags || []).map(x => String(x).toLowerCase())
  const title = (c.title || '').toLowerCase()
  const isLaunch      = tags.includes('launch') || kw(title, /(launch|welcome)/)
  const isDailyWeekly = tags.includes('daily') || tags.includes('weekly') || kw(title, /\b(daily|weekly|micro)\b/)
  const isPi          = tags.includes('pi') || kw(title, /\bpi\b/)
  const isStages      = tags.includes('stages') || kw(title, /\b(stage|stages|qualify)\b/)
  const isFree        = tags.includes('free') || c.pricePi === 0 || kw(title, /\bfree\b/)
  const isTech        = tags.includes('tech') || kw(title, /(tech|gadget|iphone|ps5|xbox|nintendo|ipad|tablet|laptop|drone|watch|samsung|galaxy|macbook)/)
  if (isLaunch)      return 'launch'
  if (isDailyWeekly) return 'dailyweekly'
  if (isPi)          return 'pi'
  if (isStages)      return 'stages'
  if (isFree)        return 'free'
  if (isTech)        return 'tech'
  return 'tech'
}

/* ────────────── Next-draw countdown (OMC gradient) ────────────── */
function NextDrawBar({ items }) {
  const target = useMemo(() => {
    const list = Array.isArray(items) ? items : []
    const live = []
    const upcoming = []
    const ts = now()
    for (const it of list) {
      const start = it.startsAt || it.comp?.startsAt
      const end   = it.endsAt   || it.comp?.endsAt
      const startMs = start ? new Date(start).getTime() : null
      const endMs   = end   ? new Date(end).getTime()   : null
      if (endMs && endMs > ts && (!startMs || ts >= startMs)) {
        live.push({ when:endMs, slug: it.slug, title: it.title })
      } else if (startMs && startMs > ts) {
        upcoming.push({ when:startMs, slug: it.slug, title: it.title })
      }
    }
    const pick = (arr) => arr.sort((a,b) => a.when - b.when)[0]
    return pick(live) || pick(upcoming) || null
  }, [items])

  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1e6), 1000)
    return () => clearInterval(id)
  }, [])

  if (!target) return null

  const left = Math.max(0, target.when - now())
  const { days, hours, minutes, seconds } = msParts(left)
  const GRAD_FROM = '#00ffd5'
  const GRAD_TO   = '#0077ff'

  return (
    <Link
      href={`/competitions/${encodeURIComponent(target.slug)}`}
      aria-label={`Next draw: ${target.title}`}
      className="block rounded-xl p-[1px] bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow-[0_0_20px_rgba(34,211,238,0.25)] active:translate-y-px transition-transform"
    >
      <div className="rounded-[11px] bg-slate-950/85 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] sm:text-[12px] font-extrabold text-cyan-200 tracking-wide uppercase">
            Next Draw
          </div>
          <div className="max-w-[56%] truncate text-[12px] sm:text-[13px] font-semibold bg-gradient-to-r from-[var(--from)] to-[var(--to)] bg-clip-text text-transparent"
            style={{ ['--from']: GRAD_FROM, ['--to']: GRAD_TO }}
          >
            {target.title}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-1.5">
          {[{lbl:'D',val:days},{lbl:'H',val:hours},{lbl:'M',val:minutes},{lbl:'S',val:seconds}].map(({ lbl, val }) => (
            <div key={lbl} className="flex-1 min-w-0 rounded-lg p-[1px] bg-gradient-to-b from-[rgba(0,255,213,0.65)] to-[rgba(0,119,255,0.65)]">
              <div className="rounded-[7px] bg-slate-900/90 px-2 py-1.5 text-center">
                <div className="font-extrabold text-[14px] text-white tabular-nums">{pad(val)}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-cyan-200/80">{lbl}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 h-[6px] w-full rounded-full" style={{
          background: `linear-gradient(90deg, ${GRAD_FROM}, ${GRAD_TO})`,
          boxShadow: '0 0 12px rgba(34,211,238,0.35)',
        }} />
      </div>
    </Link>
  )
}

/* Card renderer */
function renderByCategory(id, common, fallback) {
  if (id === 'tech'        && TechCompetitionCard)   return <TechCompetitionCard {...common} />
  if (id === 'launch'      && LaunchCompetitionCard) return <LaunchCompetitionCard {...common} />
  if (id === 'dailyweekly' && DailyCompetitionCard)  return <DailyCompetitionCard {...common} />
  if (id === 'pi'          && PiCompetitionCard)     return <PiCompetitionCard {...common} />
  if (id === 'stages'      && StagesCompetitionCard) return <StagesCompetitionCard {...common} />
  if (id === 'free'        && FreeCompetitionCard)   return <FreeCompetitionCard {...common} />
  return fallback ?? null
}

function CardPicker({ tab, item }) {
  const common = { comp: item.comp ?? item, data: item.comp ?? item, competition: item.comp ?? item, item: item.comp ?? item }
  return renderByCategory(tab, common, <GenericCard data={item} />) || <GenericCard data={item} />
}

/* Minimal fallback card */
function GenericCard({ data }) {
  const status = getStatus(data)
  const total = toNum(data.totalTickets)
  const sold  = toNum(data.ticketsSold)
  const pct   = total > 0 ? clamp((sold / total) * 100, 0, 100) : 0
  const endsMs = data.endsAt ? timeTo(data.endsAt) : 0
  const startsMs = data.startsAt ? timeTo(data.startsAt) : 0
  const href = `/competitions/${data.slug}`

  return (
    <div className="rounded-xl border border-cyan-400/15 bg-slate-900/60 p-3 shadow-[0_0_12px_rgba(34,211,238,0.10)]">
      <div className="text-[13px] font-extrabold line-clamp-2">{data.title}</div>
      {!!data.prize && <div className="text-[12px] text-slate-300 mt-0.5">{data.prize}</div>}
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px]">
        <div className="rounded bg-slate-900/70 px-2 py-1"><div className="text-slate-400">Tickets</div><div className="font-bold">{sold} / {total || '∞'}</div></div>
        <div className="rounded bg-slate-900/70 px-2 py-1"><div className="text-slate-400">Fee</div><div className="font-bold">{toNum(data.pricePi, 0)} π</div></div>
        <div className="rounded bg-slate-900/70 px-2 py-1"><div className="text-slate-400">{status === 'upcoming' ? 'Starts In' : 'Ends In'}</div><div className="font-bold">{msParts(status === 'upcoming' ? startsMs : endsMs).minutes}m</div></div>
      </div>
      {total > 0 && (<div className="mt-2"><div className="h-1.5 rounded-full bg-slate-800/70 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${pct}%` }} /></div></div>)}
      <div className="mt-2">
        <Link href={href} className="inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-[12px] font-extrabold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110 active:translate-y-px transition">
          {status === 'upcoming' ? 'View Details' : 'Enter Now'}
        </Link>
      </div>
    </div>
  )
}

/* Page */
export default function AllCompetitionsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('tech')

  const fetchAll = useCallback(async () => {
    try {
      setError('')
      const res = await fetch('/api/competitions/all', { cache: 'no-store', headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const arr = Array.isArray(json) ? json : (json.items || json.data || json.competitions || json.results || [])
      setItems(arr.map(normalizeComp))
    } catch (e) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, REFRESH_MS)
    return () => clearInterval(t)
  }, [fetchAll])

  // refresh every second for countdowns
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1_000_000), 1000)
    return () => clearInterval(id)
  }, [])

  // Filter
  const filtered = useMemo(() => {
    if (!q.trim()) return items
    const s = q.trim().toLowerCase()
    return items.filter(x => {
      const title = (x.title || '').toLowerCase()
      const prize = (x.prize || '').toLowerCase()
      const slug  = (x.slug  || '').toLowerCase()
      return title.includes(s) || prize.includes(s) || slug.includes(s)
    })
  }, [items, q])

  const buckets = useMemo(() => {
    const acc = { tech: [], launch: [], dailyweekly: [], pi: [], stages: [], free: [] }
    for (const c of filtered) acc[classifyCategory(c)].push(c)
    return acc
  }, [filtered])

  // If tab empty, jump to first with data
  useEffect(() => {
    if (buckets[tab]?.length) return
    const first = CATEGORY_ORDER.find(k => buckets[k].length > 0) || 'tech'
    setTab(first)
  }, [buckets, tab])

  // swipe navigation
  const touchStartX = useRef(0)
  const onTouchStart = (e) => { touchStartX.current = e.changedTouches[0].clientX }
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) < 50) return
    const idx = CATEGORY_ORDER.indexOf(tab)
    if (dx < 0) for (let i = idx + 1; i < CATEGORY_ORDER.length; i++) if (buckets[CATEGORY_ORDER[i]].length) { setTab(CATEGORY_ORDER[i]); break }
    else for (let i = idx - 1; i >= 0; i--) if (buckets[CATEGORY_ORDER[i]].length) { setTab(CATEGORY_ORDER[i]); break }
  }

  const counts = Object.fromEntries(CATEGORY_ORDER.map(k => [k, buckets[k].length]))

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Head><title>All Competitions • OMC</title></Head>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-white/5">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="py-2 flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold">All Competitions</h1>
            <button onClick={fetchAll} className="ml-auto inline-flex items-center gap-1 rounded-md border border-cyan-400/20 px-2.5 py-1.5 text-[12px] bg-slate-900/60 active:translate-y-px">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
          <div className="pb-2"><NextDrawBar items={items} /></div>

          {/* Search + Tabs */}
          <div className="pb-2">
            <div className="flex items-center gap-2 rounded-md border border-cyan-400/20 bg-slate-900/70 px-2.5 py-1.5 focus-within:border-cyan-400/40">
              <Search className="h-4 w-4 opacity-80" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full bg-transparent text-[12px] sm:text-[13px] outline-none placeholder:text-slate-400" />
              {q && <button onClick={() => setQ('')} className="text-[11px] opacity-80">Clear</button>}
            </div>

            <div className="mt-2 flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 snap-x snap-mandatory scrollbar-thin [scrollbar-width:thin] scrollbar-thumb-cyan-500/30">
              {CATS.map(c => {
                const active = tab === c.id
                const disabled = counts[c.id] === 0
                return (
                  <button
                    key={c.id}
                    disabled={disabled}
                    onClick={() => setTab(c.id)}
                    className={[
                      'snap-start shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold min-w-max border transition',
                      disabled ? 'opacity-40 cursor-not-allowed border-slate-600/30'
                        : active ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_12px_#22d3ee33] text-cyan-200'
                        : 'border-cyan-400/20 bg-slate-900/70 text-slate-200'
                    ].join(' ')}
                  >
                    <span className="mr-1">{c.emoji}</span>{c.label}
                    <span className="ml-1 opacity-70">({counts[c.id] || 0})</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-3 sm:py-5" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {error && (<div className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-rose-200 text-[12px]">{error}</div>)}
        {loading ? <ListSkeleton /> : counts[tab] === 0 ? <EmptyState /> : (
          <>
            <div className="mb-2 text-[12px] text-cyan-300 font-extrabold">{CATS.find(c => c.id === tab)?.label}</div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
              {buckets[tab].map((item) => (
                <li key={item._id} className="list-none">
                  <CardPicker tab={tab} item={item} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  )
}

/* Skeleton */
function ListSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="rounded-xl border border-cyan-400/10 bg-slate-900/50 p-3 animate-pulse h-44" />
      ))}
    </ul>
  )
}

/* Empty State */
function EmptyState() {
  return (
    <div className="rounded-xl border border-cyan-400/10 bg-slate-900/60 p-4 text-center">
      <Sparkles className="mx-auto h-5 w-5 text-cyan-300" />
      <p className="mt-1 text-xs text-cyan-200/80 font-semibold">No competitions available.</p>
    </div>
  )
}

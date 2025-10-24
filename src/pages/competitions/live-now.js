// file: src/pages/competitions/all.js
'use client'

import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

/* ─────────────────────────────── Lazy cards ─────────────────────────────── */
const DailyCompetitionCard   = dynamic(() => import('components/DailyCompetitionCard').catch(() => null), { ssr:false })
const LaunchCompetitionCard  = dynamic(() => import('components/LaunchCompetitionCard').catch(() => null), { ssr:false })
const PiCompetitionCard      = dynamic(() => import('components/PiCompetitionCard').catch(() => null), { ssr:false })
const FreeCompetitionCard    = dynamic(() => import('components/FreeCompetitionCard').catch(() => null), { ssr:false })
const TechCompetitionCard    = dynamic(() => import('components/CompetitionCard').catch(() => null), { ssr:false })

/* ─────────────────────────────── Config ─────────────────────────────── */
const REFRESH_MS = 20000
const CATS = [
  { id: 'tech',       label: 'Tech' },
  { id: 'launch',     label: 'Launch' },
  { id: 'dailyweekly',label: 'Weekly' },
  { id: 'pi',         label: 'Pi' },
  { id: 'stages',     label: 'Pi Stages' },
  { id: 'free',       label: 'Free' },
]
const CATEGORY_ORDER = CATS.map(c => c.id)

/* ---------------------- background FX (app theme) ---------------------- */
function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* aurora swirl */}
      <div className="absolute -inset-32 blur-3xl opacity-35 [background:conic-gradient(from_180deg_at_50%_50%,#00ffd5,rgba(0,255,213,.2),#0077ff,#00ffd5)] animate-[spin_35s_linear_infinite]" />
      {/* star grid */}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
      {/* drifting glows */}
      <div className="absolute -top-20 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-25 bg-cyan-400 animate-[float_14s_ease-in-out_infinite]" />
      <div className="absolute -bottom-20 -right-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-blue-500 animate-[float2_18s_ease-in-out_infinite]" />
      <style jsx global>{`
        @keyframes float {0%{transform:translate(0,0)}50%{transform:translate(12px,18px)}100%{transform:translate(0,0)}}
        @keyframes float2{0%{transform:translate(0,0)}50%{transform:translate(-16px,-14px)}100%{transform:translate(0,0)}}
      `}</style>
    </div>
  )
}
const PageWrapper = ({ children }) => (
  <div className="app-background relative min-h-screen w-full text-white">
    <BackgroundFX />
    {children}
  </div>
)

/* ─────────────────────────────── Utils ─────────────────────────────── */
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
const TECH_KEYWORDS = [
  { re:/tv/i,                             img:'/images/tv.jpg' },
  { re:/iphone|ios|apple/i,               img:'/images/iphone.jpeg' },
  { re:/samsung|galaxy/i,                 img:'/images/galaxy.jpg' },
  { re:/ipad|tablet/i,                    img:'/images/tablet.jpg' },
  { re:/ps5|playstation/i,                img:'/images/playstation.jpeg' },
  { re:/xbox/i,                           img:'/images/xbox.jpg' },
  { re:/nintendo|switch/i,                img:'/images/switch.jpg' },
  { re:/laptop|mac book|notebook/i,       img:'/images/macbook.jpeg' },
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

/* ─────────────────────────────── Normalizer ─────────────────────────────── */
function normalizeComp(raw) {
  const c0 = raw?.comp ?? raw ?? {}

  const pricePi =
    c0.pricePi ??
    c0.entryFeePi ??
    c0.ticketPricePi ??
    c0.piAmount ??
    toNum(c0.entryFee ?? c0.price ?? c0.ticketPrice ?? c0.feePi ?? 0)

  const totalTickets = toNum(
    c0.totalTickets ?? c0.ticketsTotal ?? c0.capacity ?? c0.capacityTotal ?? 0
  )
  const ticketsSold = toNum(
    c0.ticketsSold ?? c0.sold ?? c0.entries ?? c0.entriesCount ?? 0
  )
  const maxPerUser = toNum(
    c0.maxPerUser ?? c0.limitPerUser ?? c0.maxEntriesPerUser ?? 0
  )

  const startsAt = c0.startsAt || c0.startAt || c0.drawOpensAt || null
  const endsAt = c0.endsAt || c0.endAt || c0.drawAt || c0.closingAt || null

  const prizePi = c0.prizePi ?? null
  const prizeText =
    raw.prize ?? c0.prize ?? c0.prizeText ?? (prizePi ? `${prizePi} π` : '')
  const prize = prizeText

  const title = raw.title ?? c0.title ?? 'Competition'
  const slug = c0.slug || raw.slug || title
  const tags = Array.isArray(c0.tags) ? c0.tags : []
  const theme = (c0.theme ?? raw.theme ?? '') || ''

  let imageUrl = c0.imageUrl || c0.bannerUrl || c0.cover || c0.thumbnail || ''
  if (!imageUrl && Array.isArray(c0.images) && c0.images.length) {
    imageUrl = c0.images[0]?.url || c0.images[0]
  }
  if (!imageUrl) imageUrl = techFallbackImage({ title, tags })
  imageUrl = normalizePath(imageUrl)

  const freeEntryUrl = c0.freeEntryUrl || c0.freeMethodUrl || null

  const comp = {
    ...c0,
    _id: c0._id || raw?._id || slug,
    slug,
    title,
    prize,
    prizePi: prizePi ?? undefined,
    pricePi: toNum(pricePi, 0),
    feePi: toNum(pricePi, 0),
    entryFee: toNum(pricePi, 0),
    totalTickets,
    ticketsSold,
    maxPerUser,
    startsAt,
    endsAt,
    imageUrl,
    tags,
    theme,
    freeEntryUrl,
  }

  if (raw.comp) {
    comp.comp = { ...raw.comp, ...comp }
  }

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
  }
}

/* ─────────────────────────────── Category classifier ─────────────────────────────── */
const kw = (s = '', re) => re.test(String(s).toLowerCase())
function getThemeId(c) {
  const raw = String(c.theme ?? c.comp?.theme ?? '').toLowerCase().trim()
  if (!raw) return null
  if (raw === 'launch' || raw === 'launch-week' || raw === 'launchweek') return 'launch'
  if (raw === 'daily' || raw === 'weekly' || raw === 'dailyweekly') return 'dailyweekly'
  if (raw === 'pi' || raw === 'giveaways' || raw === 'pi-giveaways') return 'pi'
  if (raw === 'stages' || raw === 'pi-stages') return 'stages'
  if (raw === 'free' || raw === 'no-fee') return 'free'
  if (raw === 'tech' || raw === 'gadgets' || raw === 'technology') return 'tech'
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
  const isTech        = tags.includes('tech') || kw(title, /(tech|gadget|iphone|ps5|xbox|nintendo|ipad|tablet|laptop|drone|watch|samsung|galaxy|macbook|tv)/)
  if (isLaunch)      return 'launch'
  if (isDailyWeekly) return 'dailyweekly'
  if (isPi)          return 'pi'
  if (isStages)      return 'stages'
  if (isFree)        return 'free'
  if (isTech)        return 'tech'
  return themed || 'launch'
}

/* ─────────────────────────────── Next draw bar ─────────────────────────────── */
function NextDrawBar({ items }) {
  const target = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const ts = now();

    const shape = (it, when, meta={}) => {
      const slug  = it.slug || it.comp?.slug;
      const title = it.title || it.comp?.title || 'Competition';
      return slug ? { when, slug, title, ...meta } : null;
    };

    const live = [];
    const upcoming = [];

    for (const it of list) {
      const start = it.startsAt || it.comp?.startsAt;
      const end   = it.endsAt   || it.comp?.endsAt;
      const startMs = start ? new Date(start).getTime() : null;
      const endMs   = end   ? new Date(end).getTime()   : null;

      if (endMs && endMs > ts && (!startMs || ts >= startMs)) {
        const row = shape(it, endMs, { startMs, endMs, state: 'live' });
        if (row) live.push(row);
      } else if (startMs && startMs > ts) {
        const row = shape(it, startMs, { startMs, endMs, state: 'upcoming' });
        if (row) upcoming.push(row);
      }
    }

    const pick = (arr) => arr.sort((a, b) => a.when - b.when)[0]
    return pick(live) || pick(upcoming) || null
  }, [items])

  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1e6), 1000)
    return () => clearInterval(id)
  }, [])

  if (!target) return null

  const left = Math.max(0, target.when - now())
  const days = Math.floor(left / 86400000)
  const hours = Math.floor((left % 86400000) / 3600000)
  const minutes = Math.floor((left % 3600000) / 60000)
  const seconds = Math.floor((left % 60000) / 1000)

  let progressPct = null
  if (target.startMs && target.endMs && target.endMs > target.startMs) {
    const span = target.endMs - target.startMs
    const elapsed = clamp(now() - target.startMs, 0, span)
    progressPct = (elapsed / span) * 100
  }

  const isLive = target.state === 'live'
  const badgeText = isLive ? 'LIVE' : 'UPCOMING'
  const badgeClass = isLive
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'

  return (
    <Link href={`/ticket-purchase/${encodeURIComponent(target.slug)}`} aria-label={`Go to ${target.title}`} className="group block">
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[#00ffd5] via-[#27b7ff] to-[#0077ff] shadow-[0_0_28px_#22d3ee33]">
        <div className="rounded-[1rem] bg-[#0f172a]/90 backdrop-blur-sm px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3">
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide border ${badgeClass}`}>{badgeText}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <p className="truncate text-xs sm:text-sm font-semibold text-cyan-200/90">
                Next Draw: <span className="text-cyan-200">{target.title}</span>
              </p>
              <p className="text-[10px] sm:text-xs text-cyan-300/70">tap to enter →</p>
            </div>
            <div className="mt-1.5 text-center sm:text-left">
              <span className="inline-block rounded-md px-2 py-1 bg-slate-900/70 border border-cyan-400/20 shadow-[0_0_20px_#06b6d433]">
                <span className="font-mono tabular-nums text-sm sm:text-base font-extrabold text-cyan-200 tracking-wide">
                  {days}<span className="opacity-70">D</span>{' '}
                  {String(hours).padStart(2,'0')}<span className="opacity-70">H</span>{' '}
                  {String(minutes).padStart(2,'0')}<span className="opacity-70">M</span>{' '}
                  {String(seconds).padStart(2,'0')}<span className="opacity-70">S</span>
                </span>
              </span>
            </div>
            {progressPct != null && (
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-0 transition-[width] duration-500 ease-linear bg-gradient-to-r from-[#00ffd5] to-[#0077ff] shadow-[0_0_12px_#22d3ee77]" style={{width:`${progressPct}%`}} />
              </div>
            )}
          </div>
          <div className="hidden sm:block shrink-0">
            <div className={`h-3 w-3 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'} shadow-[0_0_16px_currentColor] animate-pulse`} />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─────────────────────────────── Card Renderer ─────────────────────────────── */
function renderByCategory(id, common, fallback) {
  if (id === 'tech'        && TechCompetitionCard)   return <TechCompetitionCard {...common} />
  if (id === 'launch'      && LaunchCompetitionCard) return <LaunchCompetitionCard {...common} />
  if (id === 'dailyweekly' && DailyCompetitionCard)  return <DailyCompetitionCard {...common} />
  if (id === 'pi'          && PiCompetitionCard)     return <PiCompetitionCard {...common} />
  if (id === 'free'        && FreeCompetitionCard)   return <FreeCompetitionCard {...common} />
  return fallback ?? null
}

function CardPicker({ tab, item }) {
  if (tab === 'launch' && LaunchCompetitionCard) {
    return (
      <LaunchCompetitionCard
        comp={item.comp ?? item}
        title={item.title}
        prize={item.prize}
        className=""
      />
    )
  }

  const common = {
    comp: item.comp ?? item,
    data: item,
    competition: item.comp ?? item,
    item: item.comp ?? item
  }

  return renderByCategory(tab, common, <GenericCard data={item} />) || <GenericCard data={item} />
}

/* ─────────────────────────────── Fallback Card (color-matched) ─────────────────────────────── */
function GenericCard({ data }) {
  const total = toNum(data.totalTickets)
  const sold = toNum(data.ticketsSold)
  const pct = total > 0 ? clamp((sold / total) * 100, 0, 100) : 0
  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-[#0b1022]/60 p-4 shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
      <div className="font-bold text-sm mb-1 text-cyan-100">{data.title}</div>
      <div className="text-xs text-cyan-300">{data.prize}</div>
      <div className="text-xs mt-2 text-cyan-200/80">🎟 {sold}/{total || '∞'} sold</div>
      <div className="h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#00ffd5] to-[#0077ff]" style={{width:`${pct}%`}} />
      </div>
    </div>
  )
}

/* ─────────────────────────────── Page ─────────────────────────────── */
export default function AllCompetitionsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('tech')
  const [q, setQ] = useState('')

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch('/api/competitions/all', { cache: 'no-store' })
      const json = await res.json()
      const arr = json?.data || []
      setItems(arr.map(normalizeComp))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, REFRESH_MS)
    return () => clearInterval(t)
  }, [fetchAll])

  const filtered = useMemo(() => {
    if (!q.trim()) return items
    const s = q.toLowerCase()
    return items.filter(x =>
      (x.title || '').toLowerCase().includes(s) ||
      (x.prize || '').toLowerCase().includes(s)
    )
  }, [q, items])

  const buckets = useMemo(() => {
    const acc = { tech: [], launch: [], dailyweekly: [], pi: [], stages: [], free: [] }
    for (const c of filtered) acc[classifyCategory(c)].push(c)
    return acc
  }, [filtered])

  const counts = Object.fromEntries(CATEGORY_ORDER.map(k => [k, buckets[k].length]))

  return (
    <PageWrapper>
      <Head><title>All Competitions • OMC</title></Head>

      {/* Sticky header (theme-matched) */}
   {/* Sticky header (theme-matched) */}
<div className="sticky top-0 z-40 bg-[#0b1220]/80 backdrop-blur border-b border-white/10">
  <div className="mx-auto max-w-6xl px-4">
    <div className="py-3 text-center">
      <h1 className="font-orbitron font-extrabold text-base text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-cyan-300">
        All Competitions
      </h1>
      {/* NEW: Subtitle (matches Scheduled style) */}
      <p className="mt-1 text-[12px] sm:text-sm text-cyan-100/80">
        All categories in one place use the tabs to filter and search to find your next win.
        We’re adding and rotating competitions <span className="font-semibold text-cyan-300">every day</span>.
      </p>
    </div>
  </div>
</div>


      {/* Content container */}
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10">
        {/* Next draw */}
        <div className="mb-6">
          <NextDrawBar items={items}/>
        </div>

        {/* Search (glassy cyan frame) */}
        <div className="mb-5 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-xl p-[1px] bg-gradient-to-r from-cyan-500/40 via-blue-500/35 to-cyan-500/40 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
              <input
                value={q}
                onChange={(e)=>setQ(e.target.value)}
                placeholder="Search competitions…"
                className="w-full rounded-[11px] bg-[#0f172a]/90 border border-white/10 px-4 py-2.5 text-sm text-cyan-100 placeholder:text-cyan-200/40 outline-none focus:border-cyan-400/60"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-cyan-200/80 text-center">Loading…</p>
        ) : error ? (
          <p className="text-rose-300/90 text-center">{error}</p>
        ) : (
          <div className="space-y-6 sm:space-y-7">
            {/* Tabs – cyan active state */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-1 px-1
                            snap-x snap-mandatory [--pad:0.375rem] sm:[--pad:0.5rem]">
              {CATS.map(c => {
                const active = tab === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setTab(c.id)}
                    disabled={!counts[c.id]}
                    className={[
                      'shrink-0 whitespace-nowrap snap-center md:snap-start',
                      'px-3 py-[var(--pad)] text-[12px] sm:px-4 sm:py-[var(--pad)] sm:text-sm',
                      'rounded-full border font-semibold transition-colors',
                      active
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_18px_#00fff055]'
                        : 'border-cyan-400/20 text-cyan-100 hover:border-cyan-400/40',
                      'disabled:opacity-40 disabled:cursor-not-allowed'
                    ].join(' ')}
                  >
                    <span>{c.label}</span>
                    <span className="ml-2 inline-flex items-center justify-center
                                     text-[10px] leading-none px-1.5 py-0.5 rounded-full
                                     bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                      {counts[c.id]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Grid (cards themed already) */}
            <ul className="grid grid-cols-1 gap-y-9 gap-x-4 sm:grid-cols-2 sm:gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-y-12 lg:gap-x-8">
              {buckets[tab].map((item) => (
                <li key={item._id} className="h-full">
                  <CardPicker tab={tab} item={item} />
                  <div className="mt-5 h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
                </li>
              ))}
            </ul>

            {/* Bottom spacer with safe-area awareness */}
            <div className="pt-6 pb-[max(6rem,env(safe-area-inset-bottom))]" />
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

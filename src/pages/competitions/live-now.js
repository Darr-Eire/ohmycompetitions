// file: src/pages/competitions/all.js
'use client'

import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search, Sparkles } from 'lucide-react'

/* ───────────────────── import your ACTUAL cards (lazy, SSR-safe) ───────────────────── */
const DailyCompetitionCard   = dynamic(() => import('components/DailyCompetitionCard').catch(() => null), { ssr:false })
const LaunchCompetitionCard  = dynamic(() => import('components/LaunchCompetitionCard').catch(() => null), { ssr:false })
const PiCompetitionCard      = dynamic(() => import('components/PiCompetitionCard').catch(() => null), { ssr:false }) // Pi / Giveaways
const FreeCompetitionCard    = dynamic(() => import('components/FreeCompetitionCard').catch(() => null), { ssr:false })
const TechCompetitionCard    = dynamic(() => import('components/CompetitionCard').catch(() => null), { ssr:false })   // Tech & Gadgets

/* ───────────────────────── Config ───────────────────────── */
const REFRESH_MS = 20000 // 20s refresh

/* ───────────────────────── Tiny Utils ───────────────────────── */
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
function msShort(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '0m'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d) return `${d}d ${h}h`
  if (h) return `${h}h ${m}m`
  return `${m}m`
}
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

/* ───────────────────────── Image fallbacks (tech) ───────────────────────── */
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

/* ───────────────────────── Normalizer ───────────────────────── */
function normalizeComp(raw) {
  // Support both {comp: {...}} and flat
  const c0 = raw?.comp ?? raw ?? {}

  // Price/fee in Pi (various possible keys)
  const pricePi = c0.pricePi ?? c0.entryFeePi ?? c0.ticketPricePi ??
                  toNum(c0.price ?? c0.entryFee ?? c0.ticketPrice ?? c0.feePi, 0)

  // Tickets
  const totalTickets = toNum(c0.totalTickets ?? c0.ticketsTotal ?? c0.capacity ?? c0.capacityTotal ?? 0)
  const ticketsSold  = toNum(c0.ticketsSold  ?? c0.sold         ?? c0.entries ?? c0.entriesCount ?? 0)
  const maxPerUser   = toNum(c0.maxPerUser   ?? c0.limitPerUser ?? c0.maxEntriesPerUser ?? 0)

  // Timing
  const startsAt     = c0.startsAt || c0.startAt || c0.drawOpensAt || null
  const endsAt       = c0.endsAt   || c0.endAt   || c0.drawAt      || c0.closingAt || null

  // Prize
  const prizePi      = c0.prizePi ?? null
  const prizeText    = raw.prize ?? c0.prize ?? c0.prizeText ?? (prizePi ? `${prizePi} π` : '')
  const prize        = prizeText

  // Identity / tags
  const title        = raw.title ?? c0.title ?? 'Competition'
  const slug         = c0.slug || raw.slug || title
  const tags         = Array.isArray(c0.tags) ? c0.tags : []

  // Images: try many keys & arrays
  let imageUrl = c0.imageUrl || c0.bannerUrl || c0.cover || c0.thumbnail || ''
  if (!imageUrl && Array.isArray(c0.images) && c0.images.length) {
    imageUrl = c0.images[0]?.url || c0.images[0]
  }
  if (!imageUrl) imageUrl = techFallbackImage({ title, tags })
  imageUrl = normalizePath(imageUrl)

  // Misc
  const freeEntryUrl = c0.freeEntryUrl || c0.freeMethodUrl || null

  const comp = {
    ...c0,
    _id: c0._id || raw?._id || slug,
    slug,
    title,
    prize,
    prizePi: prizePi ?? undefined,
    pricePi: toNum(pricePi, 0),
    feePi: toNum(pricePi, 0), // alias some cards expect
    totalTickets,
    ticketsSold,
    maxPerUser,
    startsAt,
    endsAt,
    imageUrl,
    tags,
    freeEntryUrl,
  }

  return {
    _id: comp._id,
    slug, title, prize, prizePi: comp.prizePi,
    pricePi: comp.pricePi, feePi: comp.feePi,
    totalTickets, ticketsSold, maxPerUser,
    startsAt, endsAt, imageUrl, tags,
    freeEntryUrl,
    comp, // pass the rich object
  }
}

/* ───────────────────────── Tabs (Live/Coming/All removed) ───────────────────────── */
const CATS = [
  { id: 'tech',       label: 'Tech & Gadgets',  emoji: '📱' },
  { id: 'launch',     label: 'Launch Week',     emoji: '🚀' },
  { id: 'dailyweekly',label: 'Weekly',          emoji: '🔥' },
  { id: 'giveaways',  label: 'Pi',              emoji: '🎁' },
  { id: 'stages',     label: 'Pi Stages',       emoji: '🏆' },
  { id: 'free',       label: 'Free',            emoji: '✨' },
]

/* ───────────────────────── Category routing (tags + keywords) ───────────────────────── */
const kw = (s = '', re) => re.test(String(s).toLowerCase())
function inCat(c, id) {
  const t = (c.tags || []).map(x => String(x).toLowerCase())
  const title = (c.title || '').toLowerCase()
  switch (id) {
    case 'dailyweekly': return t.includes('daily') || t.includes('weekly') || kw(title, /(daily|weekly|micro)/)
    case 'launch':      return t.includes('launch') || t.includes('launch-week') || t.includes('launchweek') || kw(title, /(launch|welcome)/)
    case 'giveaways': {
      const piish = ['pi', 'pi-only', 'pi only', 'pi-network', 'pinetwork', 'pi giveaway', 'pi-giveaway']
      const hitTag = piish.some(k => t.includes(k)) || t.includes('giveaway') || t.includes('giveaways')
      const hitTitle = kw(title, /\bpi\b|\bpi\s*giveaway\b|giveaway|prize pool|exclusive/)
      return hitTag || hitTitle
    }
    case 'stages':      return t.includes('stages') || t.includes('pi stages') || t.includes('pi-stages') || kw(title, /(stage|stages|qualify)/)
    case 'free':        return t.includes('free') || t.includes('no-fee') || c.pricePi === 0 || kw(title, /\bfree\b/)
    case 'tech':        return t.includes('tech') || t.includes('gadgets') || t.includes('technology') ||
                               kw(title, /(tech|gadget|iphone|ps5|xbox|nintendo|ipad|tablet|laptop|drone|watch|samsung|galaxy|macbook)/)
    default:            return false
  }
}

/* ───────────────────────── Generic fallback card ───────────────────────── */
function GenericCard({ data }) {
  const status = getStatus(data)
  const total = toNum(data.totalTickets)
  const sold  = toNum(data.ticketsSold)
  const pct   = total > 0 ? clamp((sold / total) * 100, 0, 100) : 0
  const endsMs = data.endsAt ? timeTo(data.endsAt) : 0
  const startsMs = data.startsAt ? timeTo(data.startsAt) : 0
  const href = `/competitions/${data.slug}`

  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-slate-900/60 p-3">
      <div className="text-sm font-extrabold line-clamp-2">{data.title}</div>
      {!!data.prize && <div className="text-xs text-slate-300 mt-1">{data.prize}</div>}
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded bg-slate-900/70 px-2 py-1">
          <div className="text-slate-400">Tickets</div>
          <div className="font-bold">{sold} / {total || '∞'}</div>
        </div>
        <div className="rounded bg-slate-900/70 px-2 py-1">
          <div className="text-slate-400">Fee</div>
          <div className="font-bold">{toNum(data.pricePi, 0)} π</div>
        </div>
        <div className="rounded bg-slate-900/70 px-2 py-1">
          <div className="text-slate-400">{status === 'upcoming' ? 'Starts In' : 'Ends In'}</div>
          <div className="font-bold">{msShort(status === 'upcoming' ? startsMs : endsMs)}</div>
        </div>
      </div>
      {total > 0 && (
        <div className="mt-2">
          <div className="h-2 rounded-full bg-slate-800/70 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-slate-400">{Math.round(pct)}% sold</div>
        </div>
      )}
      <div className="mt-2.5">
        <Link
          href={href}
          className="inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-[13px] font-extrabold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110 active:translate-y-px transition"
        >
          {status === 'upcoming' ? 'View Details' : 'Enter Now'}
        </Link>
      </div>
    </div>
  )
}

/* ───────────────────────── Category → Card renderer ───────────────────────── */
function renderByCategory(id, common, fallback) {
  if (id === 'tech'        && TechCompetitionCard)   return <TechCompetitionCard {...common} />
  if (id === 'launch'      && LaunchCompetitionCard) return <LaunchCompetitionCard {...common} />
  if (id === 'dailyweekly' && DailyCompetitionCard)  return <DailyCompetitionCard {...common} />
  if (id === 'giveaways'   && PiCompetitionCard)     return <PiCompetitionCard {...common} />
  if (id === 'stages'      && StagesCompetitionCard) return <StagesCompetitionCard {...common} />
  if (id === 'free'        && FreeCompetitionCard)   return <FreeCompetitionCard {...common} />
  return fallback ?? null
}

/* ───────────────────────── Card Picker (tab-only) ───────────────────────── */
function CardPicker({ tab, item }) {
  // Give your cards multiple prop aliases so they can consume what they expect
  const common = {
    comp: item.comp ?? item,
    data: item.comp ?? item,
    competition: item.comp ?? item,
    item: item.comp ?? item,
  }
  return renderByCategory(tab, common, <GenericCard data={item} />) || <GenericCard data={item} />
}

/* ───────────────────────── Page ───────────────────────── */
export default function AllCompetitionsPage() {
  const [tab, setTab] = useState('tech') // default to first visible tab
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

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

  // ticker to keep countdowns fresh
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1_000_000), 1000)
    return () => clearInterval(id)
  }, [])

  // search
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

  // buckets (only category tabs)
  const buckets = useMemo(() => {
    const list = filtered
    return {
      tech:        list.filter(c => inCat(c, 'tech')),
      launch:      list.filter(c => inCat(c, 'launch')),
      dailyweekly: list.filter(c => inCat(c, 'dailyweekly')),
      giveaways:   list.filter(c => inCat(c, 'giveaways')),
      stages:      list.filter(c => inCat(c, 'stages')),
      free:        list.filter(c => inCat(c, 'free')),
    }
  }, [filtered])

  const counts = Object.fromEntries(CATS.map(c => [c.id, (buckets[c.id] || []).length]))
  const dataByTab = buckets[tab] || []

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Head><title>All Competitions • OMC</title></Head>

      {/* sticky header (mobile-first) */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-cyan-400/10">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="py-3 flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight">All Competitions</h1>
            <button
              onClick={fetchAll}
              className="ml-auto inline-flex items-center gap-1 rounded-lg border border-cyan-400/20 px-3 py-2 text-[13px] bg-slate-900/50 active:translate-y-px"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          {/* search */}
          <div className="pb-3">
            <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-slate-900/70 px-3 py-2 focus-within:border-cyan-400/40">
              <Search className="h-4 w-4 opacity-80" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search competitions, prizes, slugs…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {q && <button onClick={() => setQ('')} className="text-xs opacity-80">Clear</button>}
            </div>
          </div>

          {/* tabs (mobile: 2 cols, sm:3, lg:6) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pb-3">
            {CATS.map(c => (
              <button
                key={c.id}
                onClick={() => setTab(c.id)}
                className={[
                  'flex items-center justify-center gap-1.5 rounded-2xl border px-2 py-2 text-[13px] font-bold transition select-none',
                  tab === c.id
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_22px_#22d3ee33] text-cyan-200'
                    : 'border-cyan-400/20 bg-slate-900/70 text-slate-200',
                ].join(' ')}
              >
                {c.emoji && <span className="text-base">{c.emoji}</span>}
                {c.label} <span className="opacity-70">({counts[c.id] || 0})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* content */}
      <div className="mx-auto max-w-6xl px-2 sm:px-4 py-3 sm:py-4">
        {/* section header */}
        <div className="mb-3">
          <div className="w-full text-center text-[13px] sm:text-sm font-extrabold text-cyan-300 px-4 py-2 rounded-xl shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 backdrop-blur border border-cyan-400">
            {{
              tech: 'Tech & Gadgets',
              launch: 'Launch Week',
              dailyweekly: 'Daily/Weekly',
              giveaways: 'Pi Giveaways',
              stages: 'OMC Pi Stages Competitions',
              free: 'OMC Free Competitions',
            }[tab]}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200 text-sm">{error}</div>
        )}

        {loading ? (
          <ListSkeleton />
        ) : dataByTab.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {dataByTab.map((item) => (
              <li key={item._id} className="list-none">
                <CardPicker tab={tab} item={item} />
              </li>
            ))}
          </ul>
        )}

        {/* view more */}
        {dataByTab.length > 6 && (
          <div className="mt-4 flex justify-center">
            <button
              className="rounded-xl px-3 py-2 text-[13px] font-bold text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110 active:translate-y-px transition"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              View More
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

/* ───────────────────────── Minor UI helpers ───────────────────────── */
function ListSkeleton() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="rounded-2xl border border-cyan-400/10 bg-slate-900/50 p-3 animate-pulse h-48" />
      ))}
    </ul>
  )
}

function EmptyState({ tab }) {
  const map = {
    tech: 'No Tech & Gadgets competitions yet.',
    launch: 'No Launch Week competitions yet.',
    dailyweekly: 'No Daily/Weekly competitions yet.',
    giveaways: 'No Pi Giveaways yet.',
    stages: 'No Stages competitions yet.',
    free: 'No Free competitions yet.',
  }
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-slate-900/60 p-5 text-center">
      <Sparkles className="mx-auto mb-2" />
      <p className="text-slate-300">{map[tab] || 'Nothing here right now.'}</p>
    </div>
  )
}

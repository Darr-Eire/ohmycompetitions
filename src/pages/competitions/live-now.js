// file: src/pages/competitions/all.js
'use client'

import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search, Sparkles } from 'lucide-react'

/* Lazy cards */
const DailyCompetitionCard   = dynamic(() => import('components/DailyCompetitionCard').catch(() => null), { ssr:false })
const LaunchCompetitionCard  = dynamic(() => import('components/LaunchCompetitionCard').catch(() => null), { ssr:false })
const PiCompetitionCard      = dynamic(() => import('components/PiCompetitionCard').catch(() => null), { ssr:false })
const FreeCompetitionCard    = dynamic(() => import('components/FreeCompetitionCard').catch(() => null), { ssr:false })
const TechCompetitionCard    = dynamic(() => import('components/CompetitionCard').catch(() => null), { ssr:false })

/* Config */
const REFRESH_MS = 20000

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

/* Image fallbacks */
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
  const c0 = raw?.comp ?? raw ?? {}

  const pricePi = c0.pricePi ?? c0.entryFeePi ?? c0.ticketPricePi ??
                  toNum(c0.price ?? c0.entryFee ?? c0.ticketPrice ?? c0.feePi, 0)

  const totalTickets = toNum(c0.totalTickets ?? c0.ticketsTotal ?? c0.capacity ?? c0.capacityTotal ?? 0)
  const ticketsSold  = toNum(c0.ticketsSold  ?? c0.sold         ?? c0.entries ?? c0.entriesCount ?? 0)
  const maxPerUser   = toNum(c0.maxPerUser   ?? c0.limitPerUser ?? c0.maxEntriesPerUser ?? 0)

  const startsAt     = c0.startsAt || c0.startAt || c0.drawOpensAt || null
  const endsAt       = c0.endsAt   || c0.endAt   || c0.drawAt      || c0.closingAt || null

  const prizePi      = c0.prizePi ?? null
  const prizeText    = raw.prize ?? c0.prize ?? c0.prizeText ?? (prizePi ? `${prizePi} π` : '')
  const prize        = prizeText

  const title        = raw.title ?? c0.title ?? 'Competition'
  const slug         = c0.slug || raw.slug || title
  const tags         = Array.isArray(c0.tags) ? c0.tags : []
  const theme        = (c0.theme ?? raw.theme ?? '') || ''

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

  return {
    _id: comp._id,
    slug, title, prize, prizePi: comp.prizePi,
    pricePi: comp.pricePi, feePi: comp.feePi,
    totalTickets, ticketsSold, maxPerUser,
    startsAt, endsAt, imageUrl, tags,
    theme,
    freeEntryUrl,
    comp,
  }
}

/* Category order & labels */
const CATEGORY_ORDER = ['tech','launch','dailyweekly','pi','stages','free']
const LABELS = {
  tech: 'Tech & Gadgets',
  launch: 'Launch Week',
  dailyweekly: 'Weekly/Daily',
  pi: 'Pi',
  stages: 'Pi Stages',
  free: 'Free',
}

/* Classifier (prefer explicit theme) */
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

  const isLaunch      = tags.includes('launch') || tags.includes('launch-week') || tags.includes('launchweek') || kw(title, /(launch|welcome)/)
  const isDailyWeekly = tags.includes('daily') || tags.includes('weekly') || kw(title, /\b(daily|weekly|micro)\b/)
  const isPi          = tags.includes('pi') || tags.includes('pi-only') || tags.includes('pi network') || tags.includes('pinetwork') || kw(title, /\bpi\b/)
  const isStages      = tags.includes('stages') || tags.includes('pi-stages') || tags.includes('pi stages') || kw(title, /\b(stage|stages|qualify)\b/)
  const isFree        = tags.includes('free') || tags.includes('no-fee') || c.pricePi === 0 || c.feePi === 0 || kw(title, /\bfree\b/)
  const isTech        = tags.includes('tech') || tags.includes('gadgets') || tags.includes('technology') ||
                        kw(title, /(tech|gadget|iphone|ps5|xbox|nintendo|ipad|tablet|laptop|drone|watch|samsung|galaxy|macbook)/)

  if (isLaunch)      return 'launch'
  if (isDailyWeekly) return 'dailyweekly'
  if (isPi)          return 'pi'
  if (isStages)      return 'stages'
  if (isFree)        return 'free'
  if (isTech)        return 'tech'
  return 'tech'
}

/* Compact fallback card (mobile-friendly) */
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
          <div className="h-1.5 rounded-full bg-slate-800/70 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="mt-2">
        <Link
          href={href}
          className="inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-[12px] font-extrabold
                     text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110 active:translate-y-px transition"
        >
          {status === 'upcoming' ? 'View Details' : 'Enter Now'}
        </Link>
      </div>
    </div>
  )
}

/* Category → Card renderer */
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
  const common = {
    comp: item.comp ?? item,
    data: item.comp ?? item,
    competition: item.comp ?? item,
    item: item.comp ?? item,
  }
  return renderByCategory(tab, common, <GenericCard data={item} />) || <GenericCard data={item} />
}

/* Page */
export default function AllCompetitionsPage() {
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

  // 1s ticker for countdowns
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1_000_000), 1000)
    return () => clearInterval(id)
  }, [])

  // Search filter
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

  // Buckets in fixed order
  const { buckets, sortedCategories } = useMemo(() => {
    const acc = { tech: [], launch: [], dailyweekly: [], pi: [], stages: [], free: [] }
    for (const c of filtered) {
      const cat = classifyCategory(c)
      acc[cat].push(c)
    }
    return {
      buckets: acc,
      sortedCategories: CATEGORY_ORDER.filter(k => acc[k].length > 0),
    }
  }, [filtered])

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Head><title>All Competitions • OMC</title></Head>

      {/* Super-compact sticky header: ~48px tall on mobile */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-white/5">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="py-2 flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight">All Competitions</h1>
            <button
              onClick={fetchAll}
              className="ml-auto inline-flex items-center gap-1 rounded-lg border border-cyan-400/20 px-2.5 py-1.5 text-[12px] bg-slate-900/60 active:translate-y-px"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          {/* Compact search (single line, small padding) */}
          <div className="pb-2">
            <div className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-slate-900/70 px-2.5 py-1.5 focus-within:border-cyan-400/40">
              <Search className="h-4 w-4 opacity-80" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search competitions…"
                className="w-full bg-transparent text-[12px] sm:text-[13px] outline-none placeholder:text-slate-400"
              />
              {q && <button onClick={() => setQ('')} className="text-[11px] opacity-80">Clear</button>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-3 sm:py-5">
        {error && (
          <div className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-rose-200 text-[12px]">{error}</div>
        )}

        {loading ? (
          <ListSkeleton />
        ) : sortedCategories.length === 0 ? (
          <EmptyState />
        ) : (
          sortedCategories.map((catKey) => (
            <section key={catKey} className="mb-5 sm:mb-7">
              {/* Compact section header */}
              <div className="mb-2">
                <div className="w-full text-center text-[12px] sm:text-[13px] font-extrabold text-cyan-300 px-3 py-1.5 rounded-lg
                                shadow-[0_0_18px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70
                                backdrop-blur border border-cyan-400">
                  {LABELS[catKey]}
                </div>
              </div>

              {/* 1-col on mobile, bumps to 2/3 on larger screens with small gaps */}
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
                {buckets[catKey].map((item) => (
                  <li key={item._id} className="list-none">
                    <CardPicker tab={catKey} item={item} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {/* Small global styles to ensure compact feel */}
      <style jsx global>{`
        @media (pointer: coarse) {
          html, body { overscroll-behavior-y: contain; }
        }
      `}</style>
    </main>
  )
}

/* Compact skeletons */
function ListSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="rounded-xl border border-cyan-400/10 bg-slate-900/50 p-3 animate-pulse h-44" />
      ))}
    </ul>
  )
}

/* Minimal empty state */
function EmptyState() {
  return (
    <div className="rounded-xl border border-cyan-400/10 bg-slate-900/60 p-4 text-center">
      <Sparkles className="mx-auto h-5 w-5" />
    </div>
  )
}

// file: src/pages/competitions/scheduled.jsx
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

/* ─────────────────────────────── Background FX (app theme) ─────────────────────────────── */
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

/* ─────────────────────────────── Utils / normalizer ─────────────────────────────── */
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
const PLACEHOLDER_IMG = '/images/placeholder.jpg'
function isAbs(url='') { return /^https?:\/\//i.test(url) || url?.startsWith('/') }
function normalizePath(url='') { if (!url) return ''; return isAbs(url) ? url : `/${url.replace(/^\.?\//,'')}` }

function normalizeComp(raw) {
  const c0 = raw?.comp ?? raw ?? {}
  const pricePi =
    c0.pricePi ?? c0.entryFeePi ?? c0.ticketPricePi ?? c0.piAmount ??
    toNum(c0.entryFee ?? c0.price ?? c0.ticketPrice ?? c0.feePi ?? 0)

  const totalTickets = toNum(c0.totalTickets ?? c0.ticketsTotal ?? c0.capacity ?? c0.capacityTotal ?? 0)
  const ticketsSold  = toNum(c0.ticketsSold  ?? c0.sold         ?? c0.entries  ?? c0.entriesCount      ?? 0)
  const startsAt = c0.startsAt || c0.startAt || c0.drawOpensAt || raw?.startsAt || null
  const endsAt   = c0.endsAt   || c0.endAt   || c0.drawAt      || raw?.endsAt   || null

  const prizePi  = c0.prizePi ?? null
  const prizeTxt = raw.prize ?? c0.prize ?? c0.prizeText ?? (prizePi ? `${prizePi} π` : '')
  const title = raw.title ?? c0.title ?? 'Competition'
  const slug  = c0.slug || raw?.slug || title
  const tags  = Array.isArray(c0.tags) ? c0.tags : []
  const theme = (c0.theme ?? raw.theme ?? '') || ''

  let imageUrl = c0.imageUrl || c0.bannerUrl || c0.cover || c0.thumbnail || ''
  if (!imageUrl && Array.isArray(c0.images) && c0.images.length) {
    imageUrl = c0.images[0]?.url || c0.images[0]
  }
  imageUrl = normalizePath(imageUrl || PLACEHOLDER_IMG)

  const comp = {
    ...c0,
    _id: c0._id || raw?._id || slug,
    slug, title,
    prize: prizeTxt,
    prizePi: prizePi ?? undefined,
    pricePi: toNum(pricePi, 0),
    feePi: toNum(pricePi, 0),
    entryFee: toNum(pricePi, 0),
    totalTickets,
    ticketsSold,
    startsAt,
    endsAt,
    imageUrl,
    tags,
    theme,
    comingSoon: Boolean(c0.comingSoon ?? raw?.comingSoon),
    status: c0.status || raw?.status || '',
  }

  return { ...comp, comp }
}

function getThemeId(c) {
  const raw = String(c.theme ?? c.comp?.theme ?? '').toLowerCase().trim()
  if (!raw) return null
  if (raw === 'launch' || raw === 'launch-week' || raw === 'launchweek') return 'launch'
  if (raw === 'daily'  || raw === 'weekly' || raw === 'dailyweekly') return 'dailyweekly'
  if (raw === 'pi'     || raw === 'giveaways' || raw === 'pi-giveaways') return 'pi'
  if (raw === 'stages' || raw === 'pi-stages') return 'stages'
  if (raw === 'free'   || raw === 'no-fee') return 'free'
  if (raw === 'tech'   || raw === 'gadgets' || raw === 'technology') return 'tech'
  return null
}
function classifyCategory(c) {
  return getThemeId(c) || 'launch'
}

/* ─────────────────────────────── Next to Start banner ─────────────────────────────── */
function NextStartBar({ items }) {
  const target = useMemo(() => {
    const list = Array.isArray(items) ? items : []
    const ts = now()
    const candidates = []
    for (const it of list) {
      const startMs = it.startsAt ? new Date(it.startsAt).getTime() : null
      if (startMs && startMs > ts) candidates.push({ when: startMs, slug: it.slug, title: it.title })
    }
    candidates.sort((a,b) => a.when - b.when)
    return candidates[0] || null
  }, [items])

  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1e6), 1000)
    return () => clearInterval(id)
  }, [])

  if (!target) return null
  const left = Math.max(0, target.when - now())
  const days = Math.floor(left / 86400000)
  const hours = Math.floor((left % 86400000) / 3600000)
  const minutes = Math.floor((left % 3600000) / 60000)
  const seconds = Math.floor((left % 60000) / 1000)

  return (
    <Link href={`/ticket-purchase/${encodeURIComponent(target.slug)}`} aria-label={`Go to ${target.title}`} className="group block">
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[#00ffd5] via-[#27b7ff] to-[#0077ff] shadow-[0_0_28px_#22d3ee33]">
        <div className="rounded-[1rem] bg-[#0f172a]/90 backdrop-blur-sm px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3">
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide border bg-amber-500/20 text-amber-300 border-amber-400/30">UPCOMING</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <p className="truncate text-xs sm:text-sm font-semibold text-cyan-200/90">
                Next Start: <span className="text-cyan-200">{target.title}</span>
              </p>
              <p className="text-[10px] sm:text-xs text-cyan-300/70">tap to view →</p>
            </div>
            <div className="mt-1.5">
              <span className="inline-block rounded-md px-2 py-1 bg-slate-900/70 border border-cyan-400/20 shadow-[0_0_20px_#06b6d433]">
                <span className="font-mono tabular-nums text-sm sm:text-base font-extrabold text-cyan-200 tracking-wide">
                  {days}<span className="opacity-70">D</span>{' '}
                  {String(hours).padStart(2,'0')}<span className="opacity-70">H</span>{' '}
                  {String(minutes).padStart(2,'0')}<span className="opacity-70">M</span>{' '}
                  {String(seconds).padStart(2,'0')}<span className="opacity-70">S</span>
                </span>
              </span>
            </div>
          </div>
          <div className="hidden sm:block shrink-0">
            <div className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_16px_currentColor] animate-pulse" />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─────────────────────────────── Card renderer ─────────────────────────────── */
function renderByCategory(id, common, fallback) {
  if (id === 'tech'        && TechCompetitionCard)   return <TechCompetitionCard {...common} />
  if (id === 'launch'      && LaunchCompetitionCard) return <LaunchCompetitionCard {...common} />
  if (id === 'dailyweekly' && DailyCompetitionCard)  return <DailyCompetitionCard {...common} />
  if (id === 'pi'          && PiCompetitionCard)     return <PiCompetitionCard {...common} />
  if (id === 'free'        && FreeCompetitionCard)   return <FreeCompetitionCard {...common} />
  return fallback ?? null
}
function GenericCard({ data }) {
  const total = toNum(data.totalTickets)
  const sold  = toNum(data.ticketsSold)
  const pct   = total > 0 ? clamp((sold / total) * 100, 0, 100) : 0
  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-[#0b1022]/60 p-4 shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
      <div className="font-bold text-sm mb-1">{data.title}</div>
      <div className="text-xs text-cyan-300">{data.prize}</div>
      <div className="text-xs mt-2">🎟 {sold}/{total || '∞'} sold</div>
      <div className="h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#00ffd5] to-[#0077ff]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
function CardPicker({ item }) {
  const tab = classifyCategory(item)
  const common = {
    comp: item.comp ?? item,
    data: item,
    competition: item.comp ?? item,
    item: item.comp ?? item
  }
  return renderByCategory(tab, common, <GenericCard data={item} />) || <GenericCard data={item} />
}

/* ─────────────────────────────── Page ─────────────────────────────── */
export default function ScheduledCompetitionsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('tech') // will auto-sync to first non-empty

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch('/api/competitions/all', { cache: 'no-store' })
      const json = await res.json()
      const arr  = (json?.data || []).map(normalizeComp)

      const ts = now()
      const upcoming = arr.filter((c) => {
        const startMs = c.startsAt ? new Date(c.startsAt).getTime() : null
        const status  = String(c.status || '').toLowerCase()
        const coming  = Boolean(c.comingSoon)

        if (startMs && startMs > ts) return true
        if (coming) return true
        if (status === 'scheduled' || status === 'upcoming') return true

        const endMs = c.endsAt ? new Date(c.endsAt).getTime() : null
        if (endMs && endMs > ts && status !== 'active') return true

        return false
      })

      // Sort by nearest start first; undated coming soon afterwards
      upcoming.sort((a, b) => {
        const aS = a.startsAt ? new Date(a.startsAt).getTime() : Infinity
        const bS = b.startsAt ? new Date(b.startsAt).getTime() : Infinity
        if (aS !== bS) return aS - bS
        if (aS === Infinity && bS === Infinity) {
          if (a.comingSoon && !b.comingSoon) return -1
          if (!a.comingSoon && b.comingSoon) return  1
          return String(a.title).localeCompare(String(b.title))
        }
        return 0
      })

      setItems(upcoming)
    } catch (e) {
      setError(e?.message || 'Failed to load competitions')
    } finally {
      setLoading(false)
    }
  }, [])
// Refresh when tickets are purchased elsewhere
useEffect(() => {
  const onTicketsUpdated = () => {
    // simple + safe: refetch from server
    fetchAll();
  };
  window.addEventListener('omc:tickets:updated', onTicketsUpdated);
  return () => window.removeEventListener('omc:tickets:updated', onTicketsUpdated);
}, [fetchAll]);

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, REFRESH_MS)
    return () => clearInterval(t)
  }, [fetchAll])

  /* Tabs/buckets/counts */
  const buckets = useMemo(() => {
    const acc = { tech: [], launch: [], dailyweekly: [], pi: [], stages: [], free: [] }
    for (const c of items) acc[classifyCategory(c)].push(c)
    return acc
  }, [items])

  const counts = useMemo(
    () => Object.fromEntries(CATEGORY_ORDER.map(k => [k, buckets[k].length])),
    [buckets]
  )

  // Only show tabs that have upcoming items
  const visibleCats = useMemo(
    () => CATS.filter(c => (counts[c.id] ?? 0) > 0),
    [counts]
  )

  // If current tab is empty, pick first non-empty; keeps UI non-blank
  const activeTab = useMemo(
    () => (counts[tab] > 0 ? tab : (visibleCats[0]?.id ?? tab)),
    [tab, counts, visibleCats]
  )

  // Sync state so highlight + grid align
  useEffect(() => {
    if (activeTab && activeTab !== tab) setTab(activeTab)
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="relative min-h-screen text-white">
      <Head><title>Scheduled Competitions | Oh My Competitions</title></Head>
      <BackgroundFX />

      {/* Sticky header that matches app colors */}
      <div className="sticky top-0 z-40 bg-[#0b1220]/80 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="py-3 text-center">
            <h1 className="font-orbitron font-extrabold text-base">
              <span className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
                Scheduled Competitions
              </span>
            </h1>
            {/* friendly subtitle */}
            <p className="mt-1 text-[12px] sm:text-sm text-cyan-100/80">
              Upcoming & coming soon we’re lining up fresh draws <span className="font-semibold text-cyan-300">every day</span>.
              Check back often and get ready to enter the moment they open.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10">
        {/* Next to start (same spacing) */}
        <div className="mb-5">
          <NextStartBar items={items} />
        </div>

        {loading ? (
          <p className="text-cyan-200/80">Loading…</p>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_0_24px_rgba(34,211,238,0.12)]">
            <p className="text-white/85">No scheduled competitions yet. Check back soon!</p>
            <div className="mt-3">
              <Link href="/competitions/live-now" className="underline text-cyan-300">See what’s live right now →</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-7">
            {/* Tabs – show only non-empty categories */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-1 px-1
                            snap-x snap-mandatory [--pad:0.375rem] sm:[--pad:0.5rem]">
              {visibleCats.map(c => {
                const isActive = activeTab === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setTab(c.id)}
                    className={[
                      'shrink-0 whitespace-nowrap snap-center md:snap-start',
                      'px-3 py-[var(--pad)] text-[12px] sm:px-4 sm:py-[var(--pad)] sm:text-sm',
                      'rounded-full border font-semibold transition-colors',
                      isActive
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200'
                        : 'border-cyan-400/20 text-slate-200 hover:border-cyan-400/30'
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

            {/* Grid (same gaps & divider underline) */}
            <ul className="grid grid-cols-1 gap-y-9 gap-x-4 sm:grid-cols-2 sm:gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-y-12 lg:gap-x-8">
              {buckets[activeTab]?.map((item) => (
                <li key={item._id || item.slug} className="h-full">
                  <CardPicker item={item} />
                  <div className="mt-5 h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
                </li>
              ))}
            </ul>

            {/* Bottom spacer with safe-area awareness */}
            <div className="pt-6 pb-[max(6rem,env(safe-area-inset-bottom))]" />
          </div>
        )}
      </div>
    </main>
  )
}

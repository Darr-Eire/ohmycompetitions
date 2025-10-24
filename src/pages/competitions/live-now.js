'use client'

import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw, Search, Sparkles } from 'lucide-react'

/* ─────────────────────────────── Lazy cards ─────────────────────────────── */
const DailyCompetitionCard   = dynamic(() => import('components/DailyCompetitionCard').catch(() => null), { ssr:false })
const LaunchCompetitionCard  = dynamic(() => import('components/LaunchCompetitionCard').catch(() => null), { ssr:false })
const PiCompetitionCard      = dynamic(() => import('components/PiCompetitionCard').catch(() => null), { ssr:false })
const FreeCompetitionCard    = dynamic(() => import('components/FreeCompetitionCard').catch(() => null), { ssr:false })
const TechCompetitionCard    = dynamic(() => import('components/CompetitionCard').catch(() => null), { ssr:false })

/* ─────────────────────────────── Config ─────────────────────────────── */
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

/* ─────────────────────────────── Image fallbacks ─────────────────────────────── */
const TECH_KEYWORDS = [
  { re:/tv/i,                             img:'/images/tv.jpg' },
  { re:/iphone|ios|apple/i,               img:'/images/iphone.jpg' },
  { re:/samsung|galaxy/i,                 img:'/images/galaxy.jpg' },
  { re:/ipad|tablet/i,                    img:'/images/tablet.jpg' },
  { re:/ps5|playstation/i,                img:'/images/playstation.jpeg' },
  { re:/xbox/i,                           img:'/images/xbox.jpg' },
  { re:/nintendo|switch/i,                img:'/images/switch.jpg' },
  { re:/laptop|mac book|notebook/i,        img:'/images/macbook.jpeg' },
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

  // ✅ Preserve nested shape for Launch competitions
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

/* ─────────────────────────────── Next draw countdown ─────────────────────────────── */
function NextDrawBar({ items }) {
  const target = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const ts = now();

    const shape = (it, when) => {
      const slug  = it.slug || it.comp?.slug;
      const title = it.title || it.comp?.title || 'Competition';
      return slug ? { when, slug, title } : null; // ignore if no slug
    };

    const live = [];
    const upcoming = [];

    for (const it of list) {
      const start = it.startsAt || it.comp?.startsAt;
      const end   = it.endsAt   || it.comp?.endsAt;
      const startMs = start ? new Date(start).getTime() : null;
      const endMs   = end   ? new Date(end).getTime()   : null;

      if (endMs && endMs > ts && (!startMs || ts >= startMs)) {
        const row = shape(it, endMs);
        if (row) live.push(row);
      } else if (startMs && startMs > ts) {
        const row = shape(it, startMs);
        if (row) upcoming.push(row);
      }
    }

    const pick = (arr) => arr.sort((a, b) => a.when - b.when)[0];
    return pick(live) || pick(upcoming) || null;
  }, [items]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1e6), 1000);
    return () => clearInterval(id);
  }, []);

  if (!target) return null;

  const left = Math.max(0, target.when - now());
  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  const seconds = Math.floor((left % 60000) / 1000);

  return (
    <Link
      href={`/competitions/${encodeURIComponent(target.slug)}`} // ✅ always links to the next competition’s slug
      className="block rounded-xl p-[1px] bg-gradient-to-r from-[#00ffd5] to-[#0077ff]"
    >
      <div className="rounded-[11px] bg-slate-950/85 px-3 py-2.5 text-cyan-200 font-bold text-[12px] text-center">
        🚀 Next Draw: {target.title} — {days}D {hours}H {minutes}M {seconds}S
      </div>
    </Link>
  );
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
        title={item.title}     // ✅ pass top-level title
        prize={item.prize}     
        className=""
      />
    );
  }

  const common = {
    comp: item.comp ?? item,
    data: item,               
    competition: item.comp ?? item,
    item: item.comp ?? item
  };

  return renderByCategory(tab, common, <GenericCard data={item} />) || <GenericCard data={item} />;
}


/* ─────────────────────────────── Fallback Card ─────────────────────────────── */
function GenericCard({ data }) {
  const total = toNum(data.totalTickets)
  const sold = toNum(data.ticketsSold)
  const pct = total > 0 ? clamp((sold / total) * 100, 0, 100) : 0
  return (
    <div className="rounded-xl border border-cyan-400/15 bg-slate-900/60 p-3">
      <div className="font-bold text-sm mb-1">{data.title}</div>
      <div className="text-xs text-cyan-300">{data.prize}</div>
      <div className="text-xs mt-2">🎟 {sold}/{total || '∞'} sold</div>
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
    <main className="min-h-screen bg-slate-950 text-white">
      <Head><title>All Competitions • OMC</title></Head>
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-white/5">
        <div className="mx-auto max-w-6xl px-3">
          <div className="py-2 flex items-center gap-2">
            <h1 className="font-extrabold text-base">All Competitions</h1>
            <button onClick={fetchAll} className="ml-auto flex items-center gap-1 border border-cyan-400/20 px-2 py-1 rounded text-xs bg-slate-900"> <RefreshCw className="h-4 w-4"/>Refresh </button>
          </div>
          <NextDrawBar items={items}/>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-3 py-4">
        {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CATS.map(c => (
                <button key={c.id} onClick={() => setTab(c.id)} disabled={!counts[c.id]} className={`px-3 py-1.5 rounded-full border text-xs font-bold ${tab===c.id?'bg-cyan-500/15 border-cyan-400 text-cyan-200':'border-cyan-400/20 text-slate-200'}`}>
                  {c.emoji} {c.label} ({counts[c.id]})
                </button>
              ))}
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {buckets[tab].map((item) => (
                <li key={item._id}><CardPicker tab={tab} item={item} /></li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  )
}

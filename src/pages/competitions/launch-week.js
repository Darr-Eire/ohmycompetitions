// src/pages/competitions/launch-week.js
'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import LaunchCompetitionCard from '@components/LaunchCompetitionCard'

/* -------------------------------- Utilities ------------------------------- */
const bySoonestEnd = (a, b) =>
  new Date((a.comp || a).endsAt || Infinity) - new Date((b.comp || b).endsAt || Infinity)

/* ------------------------------ Small UI bits ------------------------------ */
function SkeletonSlide() {
  return (
    <div className="snap-start min-w-full px-4">
      <div className="max-w-5xl mx-auto animate-pulse rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="h-48 sm:h-72 bg-white/10" />
        <div className="p-4 sm:p-6 space-y-3">
          <div className="h-6 w-2/3 bg-white/10 rounded" />
          <div className="h-4 w-1/2 bg-white/10 rounded" />
          <div className="h-10 w-full bg-white/10 rounded" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onRefresh }) {
  return (
    <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5">
      <Sparkles className="mx-auto mb-4" />
      <h3 className="text-xl font-semibold">No launch-week competitions yet</h3>
      <p className="text-white/70 mt-2">Check back soon — we’re gearing up more prizes.</p>
      <button
        onClick={onRefresh}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 text-black font-semibold px-4 py-2 hover:brightness-110 active:translate-y-px"
      >
        <RefreshCw size={16} /> Refresh
      </button>
    </div>
  )
}

/* ------------------------------- Carousel ---------------------------------- */
function Carousel({ items, renderItem }) {
  const scrollerRef = useRef(null)
  const [index, setIndex] = useState(0)

  const clamp = useCallback(
    (i) => Math.max(0, Math.min(i, (items?.length || 1) - 1)),
    [items?.length]
  )

  // slower controlled animation
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

  const scrollToIndex = useCallback(
    (i, duration = 900) => {
      const el = scrollerRef.current
      if (!el) return

      const target = clamp(i)
      const start = el.scrollLeft
      const end = target * el.clientWidth
      const change = end - start
      const startTime = performance.now()

      function step(now) {
        const t = Math.min(1, (now - startTime) / duration)
        const eased = easeInOut(t)
        el.scrollLeft = start + change * eased
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    },
    [clamp]
  )

  const onScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index) setIndex(i)
  }, [index])

  // keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') scrollToIndex(index + 1, 900)
      if (e.key === 'ArrowLeft') scrollToIndex(index - 1, 900)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, scrollToIndex])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  if (!items?.length) return null

  return (
    <div className="relative">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0a0f1a] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a0f1a] to-transparent z-10" />

      {/* Scroller */}
      <div
        ref={scrollerRef}
        className="
          snap-x snap-mandatory overflow-x-auto overflow-y-visible
          w-full h-full
          [touch-action:pan-y_pan-x]
          [scrollbar-width:none] [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <div className="flex">
          {items.map((item, i) => (
            <div key={item.key || i} className="snap-start snap-always min-w-full px-4">
              {/* wrap with .carousel-slide so we can neutralize press-scale inside */}
              <div className="carousel-slide max-w-5xl mx-auto">{renderItem(item, i)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next */}
      <div className="absolute inset-y-0 left-2 sm:left-4 flex items-center z-20">
        <button
          onClick={() => scrollToIndex(index - 1, 900)}
          disabled={index === 0}
          className={`rounded-full p-2 border bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 active:scale-95 transition ${
            index === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>
      </div>
      <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center z-20">
        <button
          onClick={() => scrollToIndex(index + 1, 900)}
          disabled={index === items.length - 1}
          className={`rounded-full p-2 border bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 active:scale-95 transition ${
            index === items.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Next"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i, 900)}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-cyan-400' : 'w-2.5 bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Neutralize any hover/tap scale on cards inside the carousel */}
      <style jsx global>{`
        .carousel-slide {
          -webkit-tap-highlight-color: transparent;
        }
        .carousel-slide a,
        .carousel-slide button {
          transform: none !important;
        }
        .carousel-slide a:hover,
        .carousel-slide button:hover,
        .carousel-slide a:active,
        .carousel-slide button:active,
        .carousel-slide a:focus,
        .carousel-slide button:focus {
          transform: none !important;
        }
        .carousel-slide a:focus-visible,
        .carousel-slide button:focus-visible {
          outline: 2px solid rgba(34, 211, 238, 0.6);
          outline-offset: 2px;
        }
        /* Last resort: kill any transform on descendants during interactions */
        .carousel-slide *:hover,
        .carousel-slide *:active {
          transform: none !important;
        }
      `}</style>
    </div>
  )
}

/* ---------------------------------- Page ---------------------------------- */
export default function LaunchWeekCompetitionsPage() {
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchCompetitions() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/competitions/all')
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status} – ${text}`)
      }
      const payload = await res.json()
      let arr = []
      if (Array.isArray(payload)) arr = payload
      else if (Array.isArray(payload.data)) arr = payload.data
      else if (Array.isArray(payload.competitions)) arr = payload.competitions

      const launchOnly = arr.filter((c) => (c.theme || '').toLowerCase() === 'launch')
      setCompetitions(launchOnly)
    } catch (err) {
      console.error('❌ fetch error:', err)
      setError(`Failed to load competitions: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const slides = useMemo(() => {
    const sorted = [...competitions].sort(bySoonestEnd)
    return sorted.map((raw) => {
      const comp = raw.comp ?? raw
      return {
        key: comp.slug || comp._id || comp.title || Math.random().toString(36).slice(2),
        comp,
        title: raw.title || comp.title,
        prize: raw.prize || comp.prize,
        fee: `${(comp.entryFee ?? 0).toFixed(2)} \u03C0`,
        imageUrl: raw.imageUrl || comp.imageUrl,
        endsAt: comp.endsAt,
      }
    })
  }, [competitions])

  // Hero stats
  const heroStats = useMemo(() => {
    if (!slides.length) return { count: 0, minFee: 0, soonest: null }
    const fees = slides
      .map((s) => Number(s.comp?.entryFee ?? 0))
      .filter((n) => Number.isFinite(n))
    const minFee = fees.length ? Math.min(...fees) : 0
    const soonest =
      slides
        .map((s) => new Date(s.endsAt))
        .filter((d) => Number.isFinite(d.getTime()))
        .sort((a, b) => a - b)[0] || null
    return { count: slides.length, minFee, soonest }
  }, [slides])

  const fmtDate = (d) =>
    !d ? 'TBA' : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d)

  return (
    <main className="relative min-h-screen text-white overflow-hidden bg-[#0a0f1a]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(transparent_0,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Hero */}
      <section className="px-4 py-10 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-5xl mx-auto text-center"
        >
          <h1 className="text-2xl font-bold mt-0 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Launch Week Competitions
          </h1>

          <p className="text-white/80 mt-3 max-w-2xl mx-auto">
            Swipe or use arrows.{' '}
            <span className="text-cyan-300 font-semibold">{heroStats.count}</span> live · from{' '}
            <span className="text-cyan-300 font-semibold">{heroStats.minFee.toFixed(2)} π</span>.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/80">
              ⏳ Soonest draw: <b className="text-white">{fmtDate(heroStats.soonest)}</b>
            </span>
            <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/80">
              🎟 Easy entry
            </span>
            <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/80">
              🏆 New prizes this week
            </span>
          </div>
        </motion.div>
      </section>

      {/* Content: full-width carousel (one slide per screen) */}
      <section className="pb-14">
        <div className="w-screen">
          {error && (
            <div className="mx-4 sm:mx-auto sm:max-w-3xl mb-6 p-4 bg-red-600/15 border border-red-600/40 rounded-2xl text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="relative">
              <div className="flex">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonSlide key={i} />
                ))}
              </div>
            </div>
          ) : slides.length > 0 ? (
            <Carousel
              items={slides}
              renderItem={(s) => (
                <LaunchCompetitionCard
                  comp={s.comp}
                  title={s.title}
                  prize={s.prize}
                  fee={s.fee}
                  imageUrl={s.imageUrl}
                  endsAt={s.endsAt}
                />
              )}
            />
          ) : (
            <div className="px-4 sm:px-6 lg:px-10 max-w-6xl mx-auto">
              <EmptyState onRefresh={fetchCompetitions} />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

// src/pages/competitions/featured.js
'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Head from 'next/head'
import { ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react'
import CompetitionCard from '@components/CompetitionCard'
import { techItems } from '@data/competitions'

/* ------------------------------ Skeleton / Empty ------------------------------ */
function SkeletonSlide() {
  return (
    <div className="snap-start min-w-[100vw] px-3 sm:px-4">
      <div className="mx-auto w-full max-w-[min(92vw,820px)] animate-pulse rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="h-48 sm:h-64 bg-white/10" />
        <div className="p-4 space-y-3">
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
    <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5 mx-4">
      <Sparkles className="mx-auto mb-4" />
      <h3 className="text-xl font-semibold">No featured competitions yet</h3>
      <p className="text-white/70 mt-2">Check back soon — we’re lining up more prizes.</p>
      <button
        onClick={onRefresh}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 text-black font-semibold px-4 py-2 hover:brightness-110 active:translate-y-px"
      >
        <RefreshCw size={16} /> Refresh
      </button>
    </div>
  )
}

/* ------------------------------- Full-width Carousel ------------------------------- */
function FullWidthCarousel({ items, renderItem }) {
  const scrollerRef = useRef(null)
  const [index, setIndex] = useState(0)

  const clamp = useCallback((i) => Math.max(0, Math.min(i, items.length - 1)), [items.length])

  // Slower, eased scroll
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

  // scroll listener
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  if (!items?.length) return null

  return (
    <div className="relative">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0a0f1a] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a0f1a] to-transparent z-10" />

      {/* scroller */}
      <div
        ref={scrollerRef}
        className="
          w-screen
          snap-x snap-mandatory
          overflow-x-auto overflow-y-visible
          [touch-action:pan-y_pan-x]
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        "
      >
        <div className="flex">
          {items.map((item, i) => (
            <div key={item.key || i} className="snap-start snap-always min-w-[100vw] px-3 sm:px-4">
              {/* wrapper to neutralize any hover/active/focus transforms */}
              <div
                className="mx-auto w-full max-w-[min(92vw,820px)] carousel-card"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {renderItem(item, i)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next */}
      <div className="absolute inset-y-0 left-2 sm:left-4 flex items-center z-20">
        <button
          onClick={() => scrollToIndex(index - 1, 900)}
          disabled={index === 0}
          className={`rounded-full p-2 border bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 active:scale-95 transition
            ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>
      </div>
      <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center z-20">
        <button
          onClick={() => scrollToIndex(index + 1, 900)}
          disabled={index === items.length - 1}
          className={`rounded-full p-2 border bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 active:scale-95 transition
            ${index === items.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Next"
        >
          <ChevronRight />
        </button>
      </div>

      {/* dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i, 900)}
            className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-cyan-400' : 'w-2.5 bg-white/40'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------- Page ---------------------------------- */
export default function FeaturedCompetitionsPage() {
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchCompetitions() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/competitions/all')
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const json = await res.json()
      const raw = Array.isArray(json) ? json : json.data || []

      const now = new Date()
      const techLive = raw.filter(
        (c) =>
          c.theme === 'tech' &&
          c.comp?.status === 'active' &&
          !(c.comp.endsAt && new Date(c.comp.endsAt) < now)
      )

      setCompetitions(techLive.length > 0 ? techLive : techItems)
    } catch (err) {
      console.error('❌ Featured fetch error:', err)
      setError('Couldn’t load live featured competitions.')
      setCompetitions(techItems)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const slides = useMemo(() => {
    return (competitions || []).map((item) => {
      const comp = item.comp ?? item
      const fee = typeof comp.entryFee === 'number' ? `${comp.entryFee.toFixed(2)} π` : '0.00 π'
      return {
        key: comp.slug || comp._id || item.title,
        comp,
        title: item.title,
        prize: item.prize,
        fee,
        imageUrl: item.imageUrl,
        endsAt: comp.endsAt,
        href: item.href,
      }
    })
  }, [competitions])

  // Smart hero stats
  const liveCount = slides.length
  const minFee = useMemo(() => {
    const fees = slides
      .map(s => Number(s.comp?.entryFee ?? 0))
      .filter(Number.isFinite)
    return fees.length ? Math.min(...fees) : 0
  }, [slides])

  const soonestStr = useMemo(() => {
    const soonest =
      slides
        .map(s => new Date(s.endsAt))
        .filter(d => Number.isFinite(d.getTime()))
        .sort((a, b) => a - b)[0] || null
    return soonest
      ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(soonest)
      : 'TBA'
  }, [slides])

  return (
    <>
  <Head>
  <title>Tech/Gadgets Competitions | OhMyCompetitions</title>
</Head>

<main className="app-background min-h-screen text-white bg-[#0a0f1a] pt-10 md:pt-20">
  <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          <h1
            className="
              text-2xl font-bold text-center mb-4
              bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
              bg-clip-text text-transparent
            "
          >
            Tech/Gadgets Competitions
          </h1>

          <div className="text-center max-w-md mx-auto mb-6">
            {loading ? (
              <p className="text-white/80">Loading featured competitions…</p>
            ) : error ? (
              <p className="text-red-300">{error}</p>
            ) : (
              <>
                <p className="text-white/90">
                  Explore hand-picked tech prizes. Swipe or use arrows to browse.&nbsp;
                  <span className="text-cyan-300 font-semibold">{liveCount}</span> live · from{' '}
                  <span className="text-cyan-300 font-semibold">{minFee.toFixed(2)} π</span>.
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/80">
                    ⏳ Soonest draw: <b className="text-white">{soonestStr}</b>
                  </span>
                  <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/80">
                    🎟 Easy entry
                  </span>
                  <span className="text-[11px] sm:text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/80">
                    ⚡ New drops weekly
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* content: full-width, mobile-first carousel */}
        <section className="pb-14">
          {loading ? (
            <div className="flex">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonSlide key={i} />
              ))}
            </div>
          ) : slides.length > 0 ? (
            <FullWidthCarousel
              items={slides}
              renderItem={(s) => (
                <CompetitionCard
                  key={s.key}
                  comp={{ ...s.comp, comingSoon: s.comp.comingSoon ?? false }}
                  title={s.title}
                  prize={s.prize}
                  fee={s.fee}
                  imageUrl={s.imageUrl}
                  endsAt={s.endsAt}
                  href={s.href}
                />
              )}
            />
          ) : (
            <EmptyState onRefresh={fetchCompetitions} />
          )}
        </section>
      </main>

      {/* Hard overrides to STOP any click/tap scaling/highlighting in the carousel */}
      <style jsx global>{`
        /* kill tap highlight */
        .carousel-card,
        .carousel-card a,
        .carousel-card button {
          -webkit-tap-highlight-color: transparent;
        }

        /* remove outlines/rings (as requested to avoid highlight) */
        .carousel-card *:focus,
        .carousel-card *:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }

        /* neutralize ALL hover/active/focus transforms (including group-hover etc.) */
        .carousel-card,
        .carousel-card *,
        .carousel-card:hover,
        .carousel-card:active,
        .carousel-card *:hover,
        .carousel-card *:active,
        .carousel-card:focus-within {
          transform: none !important;
        }

        /* also disable transform transitions so nothing "animates" bigger on press */
        .carousel-card * ,
        .carousel-card *:hover,
        .carousel-card *:active {
          transition-property: transform !important;
          transition-duration: 0s !important;
        }
      `}</style>
    </>
  )
}

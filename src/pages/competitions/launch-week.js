// src/pages/competitions/launch-week.js
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Filter, Clock3, Sparkles, ArrowUpDown, RefreshCw } from 'lucide-react'
import LaunchCompetitionCard from '@components/LaunchCompetitionCard'

/* -------------------------------- Utilities ------------------------------- */
const toNum = v => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''))) || 0
const byPrizeDesc = (a, b) => toNum((b.comp || b).prize) - toNum((a.comp || a).prize)
const bySoonestEnd = (a, b) => new Date((a.comp||a).endsAt||Infinity) - new Date((b.comp||b).endsAt||Infinity)

/* ------------------------------ Small UI bits ------------------------------ */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="h-40 bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-2/3 bg-white/10 rounded" />
        <div className="h-4 w-1/2 bg-white/10 rounded" />
        <div className="h-10 w-full bg-white/10 rounded" />
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

/* ---------------------------------- Page ---------------------------------- */
export default function LaunchWeekCompetitionsPage() {
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('soonest') // soonest | prize

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

      const launchOnly = arr.filter(c => (c.theme || '').toLowerCase() === 'launch')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = competitions
    if (q) {
      list = competitions.filter(item => {
        const comp = item.comp ?? item
        const text = `${item.title || comp.title || ''} ${comp?.prize || ''}`.toLowerCase()
        return text.includes(q)
      })
    }
    const sorted = [...list].sort(sort === 'prize' ? byPrizeDesc : bySoonestEnd)
    return sorted
  }, [competitions, query, sort])

  return (
    <main className="relative min-h-screen text-white overflow-hidden">
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
   
          <h1 className="text-2xl sm:text-2xl font-bold mt-0 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Launch Week Competitions
          </h1>
          <p className="text-white/80 mt-3 max-w-2xl mx-auto">
            Join our exciting launch week competitions starting from <span className="font-semibold text-white">0.25 π</span>
          </p>

          {/* Controls */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            <div className="col-span-2">
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
                <Filter size={18} className="shrink-0 text-white/70" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by title or prize"
                  className="bg-transparent outline-none w-full placeholder:text-white/50"
                />
              </div>
            </div>
            <div>
              <button
                onClick={() => setSort(s => (s === 'prize' ? 'soonest' : 'prize'))}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 hover:bg-white/10"
                title="Toggle sort"
              >
                <ArrowUpDown size={16} />
                <span className="text-sm">Sort: {sort === 'prize' ? 'Top Prize' : 'Ending Soon'}</span>
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-white/60">
            <div className="inline-flex items-center gap-2"><Clock3 size={14} /> Updated live</div>
            <div>
              {loading ? 'Loading…' : `${filteredSorted.length} competition${filteredSorted.length===1?'':'s'}`}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section className="px-4 pb-14 sm:px-6 lg:px-10 max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-600/15 border border-red-600/40 rounded-2xl text-red-200">
            {error}
          </div>
        )}

{loading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
) : filteredSorted.length > 0 ? (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 1 },
      show: { opacity: 1, transition: { staggerChildren: 0.06 } },
    }}
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20 sm:gap-16"

  >
    {filteredSorted.map((item) => {
      const comp = item.comp ?? item
      return (
        <motion.div
          key={comp.slug || comp._id || item.title}
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          className="px-2 sm:px-4" // gives extra side breathing room for each card
        >
          <LaunchCompetitionCard
            comp={comp}
            title={item.title || comp.title}
            prize={item.prize || comp.prize}
            fee={`${(comp.entryFee ?? 0).toFixed(2)} \u03C0`}
            imageUrl={item.imageUrl}
            endsAt={comp.endsAt}
          />
        </motion.div>
      )
    })}
  </motion.div>
) : (
  <EmptyState onRefresh={fetchCompetitions} />
)}

      </section>
    </main>
  )
}

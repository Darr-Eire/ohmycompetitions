'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import {
  FaComments, FaThumbsUp, FaLightbulb, FaTrophy,
  FaFire, FaClock
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

/* ------------------------------ Aurora + Stars BG ------------------------------ */
function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* soft aurora beams */}
      <div className="absolute -inset-32 blur-3xl opacity-35 [background:conic-gradient(from_180deg_at_50%_50%,#00ffd5,rgba(0,255,213,.2),#0077ff,#00ffd5)] animate-[spin_35s_linear_infinite]" />
      {/* star grid */}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
      {/* drifting glow orbs */}
      <div className="absolute -top-20 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-25 bg-cyan-400 animate-[float_14s_ease-in-out_infinite]" />
      <div className="absolute -bottom-20 -right-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-blue-500 animate-[float2_18s_ease-in-out_infinite]" />
      <style jsx global>{`
        @keyframes float   {0%{transform:translate(0,0)}50%{transform:translate(12px,18px)}100%{transform:translate(0,0)}}
        @keyframes float2  {0%{transform:translate(0,0)}50%{transform:translate(-16px,-14px)}100%{transform:translate(0,0)}}
      `}</style>
    </div>
  )
}

/* ------------------------------ Tiny helpers ------------------------------ */
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })

const categoryColor = {
  general: 'text-blue-400',
  ideas: 'text-yellow-400',
  vote: 'text-green-400',
  winners: 'text-purple-400'
}

/* ------------------------------ Shimmer skeleton ------------------------------ */
function ShimmerLine({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <style jsx global>{`
        @keyframes shimmer {100%{transform:translateX(100%)}}
      `}</style>
    </div>
  )
}

export default function ForumsPage() {
  const [nominee, setNominee] = useState('')
  const [reason, setReason] = useState('')
  const [forumStats, setForumStats] = useState({})
  const [recentThreads, setRecentThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [topPioneer, setTopPioneer] = useState(null)
  const [onlineNow, setOnlineNow] = useState(128)

  // tasteful, alive number
  useEffect(() => {
    const t = setInterval(() => {
      setOnlineNow(v => Math.max(80, Math.min(999, v + (Math.random() > .5 ? 1 : -1) * Math.floor(Math.random()*4))))
    }, 1500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const categories = ['general','ideas','vote','winners']
        const statsPromises = categories.map(async (category) => {
          const res = await fetch(`/api/forums/threads?category=${category}&limit=5`)
          const data = await res.json()
          return { category, count: data.pagination?.count || 0, threads: data.threads || [] }
        })
        const results = await Promise.all(statsPromises)
        const stats = {}
        let allRecent = []
        results.forEach(({ category, count, threads }) => {
          stats[category] = count
          allRecent = [...allRecent, ...threads.slice(0, 2)]
        })
        allRecent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setForumStats(stats)
        setRecentThreads(allRecent.slice(0, 8))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()

    ;(async () => {
      try {
        const res = await fetch('/api/pioneer-nomination')
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) setTopPioneer(data[0])
      } catch (e) {
        console.error('Failed to load Pioneer of the Week:', e)
      }
    })()
  }, [])

  const handleSubmitNomination = async () => {
    if (!nominee || !reason) return alert('Please fill in both fields.')
    const res = await fetch('/api/submit/nomination', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ nominee, reason })
    })
    const result = await res.json()
    if (res.ok) { alert('✅ Nomination submitted!'); setNominee(''); setReason('') }
    else alert('❌ Error: ' + result.error)
  }

  const forumSections = useMemo(() => ([
    {
      slug:'general',
      title:'General Discussions',
      icon:<FaComments />,
      description:'Chat about competitions, prizes, Pi & more.',
      href:'/forums/general',
      buttonText:'Enter',
      color:'from-blue-500 to-sky-500',
      count: forumStats.general || 0
    },
    {
      slug:'vote',
      title:'Vote for Next Big Pi Prize',
      icon:<FaThumbsUp />,
      description:'Help decide the next big pi giveaway.',
      href:'/forums/vote',
      buttonText:'Vote',
      color:'from-emerald-500 to-green-600',
      count: forumStats.vote || 0
    },
    {
      slug:'ideas',
      title:'Competitions/Mini Games Ideas',
      icon:<FaLightbulb />,
      description:'Got a feature or prize idea? Share it.',
      href:'/forums/ideas',
      buttonText:'Post Idea',
      color:'from-amber-500 to-yellow-600',
      count: forumStats.ideas || 0
    },
    {
      slug:'winners',
      title:'Winner Celebrations',
      icon:<FaTrophy />,
      description:'Celebrate wins & share stories.',
      href:'/forums/winners',
      buttonText:'Celebrate',
      color:'from-violet-500 to-fuchsia-600',
      count: forumStats.winners || 0
    },
  ]), [forumStats])

  const totalThreads = Object.values(forumStats).reduce((a, b) => a + b, 0)

  return (
    <>
      <Head><title>Forums | Oh My Competitions</title></Head>
      <BackgroundFX />

      <main className="min-h-screen px-4 py-6 text-white">
        <div className="mx-auto w-full max-w-6xl">

          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4 }}
            className="mb-8 text-center"
          >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight -mt-16 leading-tight">
  <span className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
    Community Forums
  </span>
</h1>

            <p className="mt-2 text-white/80 text-sm sm:text-base">
              Connect, vote, share ideas & celebrate wins with pioneers worldwide.
            </p>

            {/* live stats pill */}
            <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-cyan-500/40 bg-white/5 px-4 py-1.5 backdrop-blur">
              <span className="text-white/30"></span>
              <span className="text-xs sm:text-sm">💬 <b className="text-cyan-300">{totalThreads}</b> live threads</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* MAIN */}
            <div className="lg:col-span-2 space-y-8">

              {/* Nomination Card */}
              <motion.div
                initial={{ opacity:0, scale:.98 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ duration:.35 }}
                className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0b1022]/70 shadow-[0_0_30px_#00fff033] p-6 sm:p-8 backdrop-blur-md"
              >
                <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="text-center relative">
                  <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300">Pioneer of the Week</div>
                  <p className="mt-1 text-white/75 text-sm">
                    Nominate yourself or a fellow pioneer. Community votes decide the spotlight.
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={nominee}
                      onChange={(e) => setNominee(e.target.value)}
                      placeholder="Your Name or Pi Username"
                      className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Why you deserve the spotlight"
                      className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button onClick={handleSubmitNomination} className="btn-neon">Submit Nomination</button>
                    <Link href="/forums/pioneer-of-the-week"><button className="btn-neon">Vote Now</button></Link>
                    <Link href="/forums/pioneer-of-the-week/celebrate"><button className="btn-neon">This Week’s Pioneer</button></Link>
                  </div>
                </div>
              </motion.div>

              {/* Sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {forumSections.map((s, idx) => (
                  <motion.div
                    key={s.slug}
                    initial={{ opacity:0, y: 8 }}
                    animate={{ opacity:1, y: 0 }}
                    transition={{ duration:.35, delay: idx * 0.05 }}
                    whileHover={{ y:-4, scale:1.01 }}
                    className="group relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-[#0b1022]/60 p-6 shadow-[0_0_20px_#00fff022] backdrop-blur"
                  >
                    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl transition group-hover:opacity-80" />
                    <div className="text-2xl mb-2 text-white">{s.icon}</div>
                    <h2 className="text-lg font-bold">
                      <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{s.title}</span>
                    </h2>
                    <p className="text-white/75 text-sm mt-1">{s.description}</p>
                    <div className="mt-4 text-xs text-gray-400">
                      {loading ? 'Loading…' : `${s.count} discussions`}
                    </div>
                    <Link href={s.href}>
                      <button className={`mt-4 w-full rounded-full px-5 py-2 font-bold text-white bg-gradient-to-r ${s.color} hover:brightness-110 transition`}>
                        {s.buttonText}
                      </button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity:0, x: 8 }}
                animate={{ opacity:1, x: 0 }}
                transition={{ duration:.35 }}
                className="sticky top-4 rounded-2xl border border-cyan-500/25 bg-[#0b1022]/60 p-6 shadow-[0_0_20px_#00fff022] backdrop-blur"
              >
                <h2 className="text-xl font-bold text-cyan-300 mb-5 flex items-center gap-2">
                  <FaFire /> Recent Forums
                </h2>

                {loading ? (
                  <div className="space-y-3">
                    <ShimmerLine className="h-14 bg-white/5" />
                    <ShimmerLine className="h-14 bg-white/5" />
                    <ShimmerLine className="h-14 bg-white/5" />
                  </div>
                ) : recentThreads.length === 0 ? (
                  <div className="text-center py-8">
                    <FaComments className="text-3xl text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {recentThreads.map((t) => (
                        <motion.div
                          key={t._id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <Link href={`/forums/thread/${t.slug}`}>
                            <div className="cursor-pointer rounded-lg border border-cyan-600/40 bg-[#0f172a]/40 p-3 hover:bg-[#0f172a]/60 transition">
                              <h4 className="text-sm font-semibold mb-1 line-clamp-2">{t.title}</h4>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span className={categoryColor[t.category] || 'text-cyan-400'}>{t.category}</span>
                                <div className="flex items-center gap-1"><FaClock />{formatDate(t.createdAt)}</div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-cyan-700/40">
                  <h3 className="text-sm font-bold text-cyan-300 mb-3">Forum Stats</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-white font-bold">{totalThreads}</div>
                      <div className="text-gray-400">Total Threads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{recentThreads.length}</div>
                      <div className="text-gray-400">Recent Posts</div>
                    </div>
                  </div>
                </div>

                {/* Pioneer of the Week */}
                <div className="mt-6 pt-6 border-t border-cyan-700/40 text-center">
                  <h3 className="text-sm font-bold text-cyan-300 mb-3">🌟 Pioneer of the Week</h3>
                  {topPioneer && topPioneer.votes > 0 ? (
                    <div className="text-white text-sm mb-4">
                      <div className="font-bold text-cyan-400">{topPioneer.name}</div>
                      <div className="italic text-xs text-gray-300 mt-1">"{topPioneer.reason}"</div>
                      <div className="text-xs text-cyan-200 mt-2">🗳 {topPioneer.votes} votes</div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mb-4">No nominations yet.</p>
                  )}
                  <Link href="/forums/pioneer-of-the-week"><button className="btn-neon w-full mb-2">Nominate / Vote</button></Link>
                  <Link href="/forums/pioneer-of-the-week/celebrate"><button className="btn-neon w-full">View Winner</button></Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Neon buttons + accessibility tweaks */}
      <style jsx global>{`
        .btn-neon {
          position: relative;
          border-radius: 9999px;
          padding: .6rem 1rem;
          font-weight: 700;
          background: radial-gradient(120% 120% at 50% 0%, #00ffd5 0%, #0077ff 60%, #004aff 100%);
          box-shadow: 0 0 18px rgba(0,255,213,.25), 0 0 26px rgba(0,119,255,.18);
          transition: transform .15s ease, filter .15s ease;
        }
        .btn-neon:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .btn-neon:active { transform: translateY(0); }
        .btn-neon:focus-visible { outline: 2px solid #22d3ee; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </>
  )
}

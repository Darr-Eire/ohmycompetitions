'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRef } from 'react'

/* ------------------------------- Partners data ------------------------------ */
const partnerItems = [
  { slug: 'example-dapp', name: 'Example DApp', logoUrl: '/images/your.png', website: 'https://example-dapp.com' },
]

/* --------------------------------- Page ------------------------------------ */
export default function PartnersPage() {
  return (
    <main className="pages-partners app-background relative min-h-screen p-4 text-white font-orbitron overflow-hidden">
      <BackgroundFX />

      <div className="relative max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <header className="text-center">
          <div className="competition-top-banner title-gradient mb-4">Partners & Sponsors</div>
          <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base">
            Collaborating with visionary pioneers, developers, and brands to grow the Pi ecosystem together.
          </p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-xl mx-auto">
            <StatPill label="Active Partners" value="12+" />
            <StatPill label="Campaigns Run" value="40+" />
            <StatPill label="Pioneers Reached" value="50k+" />
          </div>
        </header>

        {/* Host Your Giveaway (hero) */}
        <GlassCard>
          <SectionTitle>Got a Giveaway? Let Us Host It.</SectionTitle>
          <p className="text-center text-white/90 text-sm mb-4">
            Whether you’re launching a Pi-powered game, a community milestone or a product drop we’ll run your giveaway
            end-to-end. 100% secure. 100% transparent. 100% Pi-native.
          </p>
          <ul className="space-y-2 text-white/90 text-sm">
            <li>✅ Transparent prize draws powered by real Pi transactions</li>
            <li>✅ Verified winner announcements & built-in fraud protection</li>
            <li>✅ Reach thousands of active Pi users instantly</li>
            <li>✅ Optional live draws, auto-payments, and branded banners</li>
          </ul>
          <div className="text-center mt-6">
            <GlowButton href="/contact">Let’s Talk →</GlowButton>
          </div>
        </GlassCard>

        {/* Partners Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {partnerItems.map((partner) => (
            <TiltCard key={partner.slug}>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 mb-4">
                  <Image
                    src={partner.logoUrl}
                    alt={partner.name}
                    fill
                    className="object-contain drop-shadow-[0_0_22px_rgba(34,211,238,0.35)]"
                    sizes="80px"
                  />
                </div>
                <h2 className="text-lg font-semibold gradient-text mb-4">{partner.name}</h2>
                <GlowButton href={partner.website} external className="w-full">
                  Visit Site →
                </GlowButton>
              </div>
            </TiltCard>
          ))}

          {/* Become Partner CTA */}
          <TiltCard>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 gradient-text animate-pulse">Your Logo Here</div>
              <p className="mb-6 text-white/90 text-sm">Want your DApp featured? Contact us!</p>
              <GlowButton href="/contact" className="w-full">
                Become a Partner
              </GlowButton>
            </div>
          </TiltCard>
        </motion.div>

        {/* Why Partner */}
        <GlassCard>
          <SectionTitle>Why Partner With OhMyCompetitions?</SectionTitle>
          <ul className="space-y-3 text-white/90 text-sm">
            <li>
              <strong className="gradient-text">Developer Support:</strong> Direct access to technical assistance and
              integration guidance.
            </li>
            <li>
              <strong className="gradient-text">Performance Insights:</strong> Real-time analytics to track engagement.
            </li>
            <li>
              <strong className="gradient-text">Ecosystem Credibility:</strong> Be featured alongside other verified Pi
              projects.
            </li>
            <li>
              <strong className="gradient-text">Security & Compliance:</strong> Leverage our audited infrastructure.
            </li>
            <li>
              <strong className="gradient-text">Partner Competition:</strong> Feature your competitions across our
              channels.
            </li>
            <li>
              <strong className="gradient-text">We Pi Family:</strong> Join a trusted alliance of pioneers building real
              utility.
            </li>
          </ul>
        </GlassCard>
      </div>
    </main>
  )
}

/* =============================== Background FX ============================== */
function BackgroundFX() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-25 bg-cyan-400 animate-float-slow" />
      <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 bg-blue-500 animate-float-slower" />
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:18px_18px] opacity-20" />
      <style jsx global>{`
        @keyframes float-slow {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(18px) translateX(6px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        @keyframes float-slower {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-14px) translateX(-8px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 16s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

/* =================== Small reusable components & polish ===================== */
function GlassCard({ children, className = '' }) {
  return (
    <motion.div
      className={`competition-card relative flex flex-col bg-white/[0.05] border border-cyan-500/20 backdrop-blur-md rounded-2xl p-6 shadow-[0_0_40px_rgba(34,211,238,0.15)] ${className}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.35 }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
      {children}
    </motion.div>
  )
}

function SectionTitle({ children }) {
  return (
    <div className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] rounded px-4 py-2 mb-4 text-center text-black font-bold text-base sm:text-lg shadow-[0_0_22px_rgba(0,255,213,0.25)]">
      {children}
    </div>
  )
}

function StatPill({ label, value }) {
  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-center text-cyan-300 font-bold text-sm">{value}</div>
      <div className="text-center text-[11px] text-white/70">{label}</div>
    </motion.div>
  )
}

function GlowButton({ href, children, className = '', external = false }) {
  const content = (
    <span className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold px-5 py-2.5 rounded-lg shadow-[0_0_24px_rgba(0,255,213,0.35)] hover:brightness-110 active:scale-[0.99] transition text-sm sm:text-base">
      {children}
    </span>
  )
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}

function TiltCard({ children }) {
  const ref = useRef(null)
  function handleMouseMove(e) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const midX = rect.width / 2
    const midY = rect.height / 2
    const rotateX = ((y - midY) / midY) * -4
    const rotateY = ((x - midX) / midX) * 4
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`
  }
  function handleLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      className="relative group rounded-2xl bg-white/[0.05] border border-white/10 p-5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.35 }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -inset-[1px] rounded-2xl bg-[conic-gradient(from_180deg_at_50%_50%,#00ffd566,transparent_50%,#0077ff66)] opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-[6px]" />
      </div>
      {children}
    </motion.div>
  )
}

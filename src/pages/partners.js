'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRef } from 'react'

/* --------------------------- Partners (unchanged) --------------------------- */
const partnerItems = [
  { slug: 'example-dapp', name: 'Example DApp', logoUrl: '/images/your.png', website: 'https://example-dapp.com' },
  { slug: 'another-dapp', name: 'Another DApp', logoUrl: '/images/your.png', website: 'https://another-dapp.io' },
  { slug: 'third-dapp', name: 'Third DApp', logoUrl: '/images/your.png', website: 'https://third.app' },
]

/* ------------------------- Trust Hub datasets (edit) ------------------------ */
const trustedSources = [
  {
    handle: 'PiBuildersHub',
    name: 'Pi Builders Hub',
    avatar: '/images/x.png',
    bio: 'Clear docs, SDK tips, and verified dev updates.',
    topics: ['Development','SDK','Guides'],
    followers: '18.9k',
    links: { x: 'https://x.com/PiBuildersHub', site: 'https://pibuildershub.xyz' },
    score: 96,
  },
  {
    handle: 'PiPulseDaily',
    name: 'Pi Pulse Daily',
    avatar: '/images/x.png',
    bio: 'Curated, fact-checked Pi news with sources.',
    topics: ['News','Education'],
    followers: '21.1k',
    links: { x: 'https://x.com/PiPulseDaily' },
    score: 93,
  },
  {
    handle: 'OMCUpdates',
    name: 'OMC Updates',
    avatar: '/images/x.png',
    bio: 'Roadmap, releases, and dev logs.',
    topics: ['Project','Transparency'],
    followers: '—',
    links: { x: 'https://x.com/OmcUpdates', site: 'https://ohmycompetitions.com' },
    score: 88,
  },
]

const trustedSpaces = [
  {
    title: 'NotoriousJ',
    host: 'NotoriousJ',
    avatar: '/images/x.png',
    schedule: 'Weekdays • 20:00 UTC',
    focus: ['Spaces', 'Community', 'Education', 'Real Pioneers'],
    avgListeners: '1.2k',
    links: { x: 'https://x.com/NotoriousPi' },
    score: 91,
  },
]

/* ------------------------------- Page export -------------------------------- */
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

          {/* Animated stats strip */}
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
            Whether you’re launching a Pi-powered game, a community milestone or a product drop we’ll run your giveaway end-to-end. 100% secure. 100% transparent. 100% Pi-native.
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
                  <Image src={partner.logoUrl} alt={partner.name} fill className="object-contain drop-shadow-[0_0_22px_rgba(34,211,238,0.35)]" sizes="80px" />
                </div>
                <h2 className="text-lg font-semibold gradient-text mb-4">{partner.name}</h2>
                <GlowButton href={partner.website} external className="w-full">Visit Site →</GlowButton>
              </div>
            </TiltCard>
          ))}

          {/* Become Partner CTA */}
          <TiltCard>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 gradient-text animate-pulse">Your Logo Here</div>
              <p className="mb-6 text-white/90 text-sm">Want your DApp featured? Contact us!</p>
              <GlowButton href="/contact" className="w-full">Become a Partner</GlowButton>
            </div>
          </TiltCard>
        </motion.div>

        {/* ----------------------------- PI TRUST HUB ----------------------------- */}
        <GlassCard className="overflow-hidden">
          {/* Brand shimmer backdrop */}
          <div className="pointer-events-none absolute -inset-2 -z-10 opacity-25 blur-2xl bg-[conic-gradient(from_90deg_at_50%_50%,#00ffd5,transparent_20%,#0077ff,transparent_60%,#00ffd5)]" />

          <TrustHeader />
          <TrustTabs />

          {/* Tabs content */}
          <TrustPanel id="sources" defaultOpen>
            <TrustControls />
            <div className="mt-4">
              <CardCarousel
                items={filterTrusted(trustedSources)}
                keyExtractor={(p) => p.handle}
                renderItem={(p) => <TrustCard item={p} />}
              />
            </div>
          </TrustPanel>

          <TrustPanel id="spaces">
            <TrustControls forSpaces />
            <div className="mt-4">
              <CardCarousel
                items={filterTrusted(trustedSpaces)}
                keyExtractor={(s, i) => `${s.host}-${i}`}
                renderItem={(s) => <SpaceCard space={s} />}
              />
            </div>
          </TrustPanel>

          <TrustPanel id="report">
            <ReportBox />
          </TrustPanel>

          {/* Criteria / disclaimer */}
          <div className="mt-8 mx-auto max-w-2xl rounded-2xl border border-cyan-500/20 bg-white/[0.04] p-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]" />
              <div className="font-semibold text-cyan-200">How we verify</div>
            </div>
            <ul className="mt-3 flex flex-col items-center gap-2 text-sm text-white/85">
              <li className="flex max-w-prose items-center justify-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /><span>Consistent accuracy &amp; sourcing; no unverifiable claims.</span></li>
              <li className="flex max-w-prose items-center justify-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /><span>Clear separation of opinion vs. fact.</span></li>
              <li className="flex max-w-prose items-center justify-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /><span>Community reputation and healthy moderation in Spaces.</span></li>
              <li className="flex max-w-prose items-center justify-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /><span>Zero tolerance for scams, fake giveaways, or shill content.</span></li>
            </ul>
          </div>
        </GlassCard>

        {/* Why Partner */}
        <GlassCard>
          <SectionTitle>Why Partner With OhMyCompetitions?</SectionTitle>
          <ul className="space-y-3 text-white/90 text-sm">
            <li><strong className="gradient-text">Developer Support:</strong> Direct access to technical assistance and integration guidance.</li>
            <li><strong className="gradient-text">Performance Insights:</strong> Real-time analytics to track engagement.</li>
            <li><strong className="gradient-text">Ecosystem Credibility:</strong> Be featured alongside other verified Pi projects.</li>
            <li><strong className="gradient-text">Security & Compliance:</strong> Leverage our audited infrastructure.</li>
            <li><strong className="gradient-text">Partner Competition:</strong> Feature your competitions across our channels.</li>
            <li><strong className="gradient-text">We Pi Family:</strong> Join a trusted alliance of pioneers building real utility.</li>
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
        @keyframes float-slow { 0% { transform: translateY(0) translateX(0); } 50% { transform: translateY(18px) translateX(6px); } 100% { transform: translateY(0) translateX(0); } }
        @keyframes float-slower { 0% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-14px) translateX(-8px); } 100% { transform: translateY(0) translateX(0); } }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 16s ease-in-out infinite; }
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

function PartnerLink({ href, children }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline transition">{children}</a>
}

function StatPill({ label, value }) {
  return (
    <motion.div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
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
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
  }
  return <Link href={href} className={className}>{content}</Link>
}

function TiltCard({ children }) {
  const ref = useRef(null)
  function handleMouseMove(e) {
    const el = ref.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left; const y = e.clientY - rect.top
    const midX = rect.width / 2; const midY = rect.height / 2
    const rotateX = ((y - midY) / midY) * -4; const rotateY = ((x - midX) / midX) * 4
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`
  }
  function handleLeave() { const el = ref.current; if (!el) return; el.style.transform = '' }
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      className="relative group rounded-2xl bg-white/[0.05] border border-white/10 p-5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.35 }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -inset-[1px] rounded-2xl bg-[conic-gradient(from_180deg_at_50%_50%,#00ffd566,transparent_50%,#0077ff66)] opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-[6px]" />
      </div>
      {children}
    </motion.div>
  )
}

function Marquee({ children }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 py-2">
      <div className="animate-marquee whitespace-nowrap text-xs sm:text-sm text-white/80 px-4">
        {Array(2).fill(0).map((_, i) => (
          <span key={i} className="mr-10 space-x-10">
            {Array.isArray(children) ? children.map((c, idx) => <span key={`${i}-${idx}`}>{c}</span>) : children}
          </span>
        ))}
      </div>
      <style jsx>{`
        .animate-marquee { animation: marquee 18s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  )
}

/* =============================== TRUST HUB UI =============================== */
let _trustState = { topics: new Set(), activeTab: 'sources' }
function setTrustState(patch = {}) { _trustState = { ..._trustState, ...patch }; document.dispatchEvent(new CustomEvent('trust:change')) }
function getTrustState() { return _trustState }

const trustTopics = [...new Set([
  ...trustedSources.flatMap(s => s.topics ?? []),
  ...trustedSpaces.flatMap(sp => sp.focus ?? []),
])]

function filterTrusted(items) {
  const { topics } = getTrustState()
  return items
    .filter((it) => {
      const tags = (it.topics || it.focus || [])
      return topics.size === 0 || tags.some(t => topics.has(t))
    })
    .sort((a,b) => (b.score||0) - (a.score||0))
}

function TrustTabs() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
      <TabButton id="sources" label="Trusted Sources" />
      <TabButton id="spaces" label="Best X Spaces" />
      <TabButton id="report" label="Submit a Trusted Source" />
    </div>
  )
}

function TabButton({ id, label }) {
  const onClick = () => setTrustState({ activeTab: id })
  const isActive = getTrustState().activeTab === id
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm transition
        ${isActive ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-white/5 text-white/80 hover:text-white'}`}
    >
      {label}
    </button>
  )
}

function TrustPanel({ id, children, defaultOpen = false }) {
  const panelRef = useRef(null)
  if (defaultOpen && getTrustState().activeTab === 'sources') { /* noop */ }
  if (typeof window !== 'undefined') {
    document.removeEventListener('trust:change', panelRef.current?._trustHandler)
    const handler = () => {
      const active = getTrustState().activeTab === id
      if (panelRef.current) panelRef.current.style.display = active ? '' : 'none'
    }
    if (panelRef.current) panelRef.current._trustHandler = handler
    document.addEventListener('trust:change', handler)
    setTimeout(handler, 0)
  }
  return <div ref={panelRef}>{children}</div>
}

function TrustControls() {
  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {trustTopics.map((t) => <TopicChip key={t} topic={t} />)}
      </div>
    </div>
  )
}

function TopicChip({ topic }) {
  const toggle = () => {
    const next = new Set(getTrustState().topics)
    next.has(topic) ? next.delete(topic) : next.add(topic)
    setTrustState({ topics: next })
  }
  const active = getTrustState().topics.has(topic)
  return (
    <button
      onClick={toggle}
      className={`rounded-full px-3 py-1 text-[11px] border transition
        ${active ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-white/5 text-white/70 hover:text-white'}`}
    >
      {topic}
    </button>
  )
}

/* -------- Banner placed ABOVE username/title -------- */
function TrustedBanner({ label = 'TRUSTED' }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-2.5 py-0.5 text-[10px] font-bold text-black ring-1 ring-cyan-400/30 shadow-[0_0_12px_rgba(0,255,213,0.35)]">
      {label}
    </span>
  )
}

/* cards */
function TrustCard({ item }) {
  return (
    <motion.div
      className="relative rounded-2xl p-6 sm:p-8 border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden group"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.3 }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-40 transition duration-500 bg-[radial-gradient(800px_160px_at_var(--x,50%)_-10%,rgba(34,211,238,.16),transparent_60%)]" />
      <div className="flex items-center gap-5 sm:gap-6">
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl ring-1 ring-white/15 overflow-hidden shrink-0">
          <Image src={item.avatar} alt={item.name} fill className="object-cover" sizes="96px" />
        </div>
        <div className="min-w-0">
          <div className="mb-1"><TrustedBanner label="TRUSTED SOURCE" /></div>
          <h4 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">{item.name}</h4>
          <p className="text-sm sm:text-base text-white/70 truncate">@{item.handle} • {item.followers}</p>
        </div>
      </div>

      <p className="mt-4 text-[15px] sm:text-lg leading-relaxed text-white/90">{item.bio}</p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {(item.topics || []).slice(0,6).map((r) => (
          <span key={r} className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[12px] sm:text-sm text-cyan-200">
            {r}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="scale-[1.1] sm:scale-[1.15] origin-left"><GlowButton href={item.links.x} external>Open on X</GlowButton></div>
        {item.links.site && <div className="scale-[1.1] sm:scale-[1.15] origin-left"><GlowButton href={item.links.site} external className="bg-white/10">Pi Dapp</GlowButton></div>}
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        (function(card){
          if(!card) return;
          card.addEventListener('mousemove', function(e){
            const r = card.getBoundingClientRect();
            card.style.setProperty('--x', (e.clientX - r.left) + 'px');
          });
        })(document.currentScript.parentElement);
      `}} />
    </motion.div>
  )
}

function SpaceCard({ space }) {
  return (
    <motion.div
      className="relative rounded-2xl p-2 sm:p-6 border border-cyan-500/25 bg-white/5 backdrop-blur-md overflow-hidden group"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-5 sm:gap-6">
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl ring-1 ring-white/15 overflow-hidden shrink-0">
          <Image src={space.avatar} alt={space.host} fill className="object-cover" sizes="96px" />
        </div>
        <div className="min-w-0">
          <div className="mb-1"><TrustedBanner label="TRUSTED SPACE" /></div>
          <h4 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">{space.title}</h4>
          <p className="text-sm sm:text-base text-white/70 truncate">Host: {space.host}</p>
          <p className="mt-0.5 text-[12px] sm:text-sm text-white/60">{space.avgListeners} avg listeners</p>
        </div>
      </div>

      <div className="mt-4 text-[15px] sm:text-lg text-white/85"><div className="opacity-80">Schedule: {space.schedule}</div></div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {(space.focus || []).slice(0,6).map((r) => (
          <span key={r} className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[12px] sm:text-sm text-cyan-200">
            {r}
          </span>
        ))}
      </div>

      <div className="mt-6">
        <div className="inline-block scale-[1.1] sm:scale-[1.15] origin-left">
          <GlowButton href={space.links.x} external>Open Host on X</GlowButton>
        </div>
      </div>
    </motion.div>
  )
}

function TrustHeader() {
  return (
    <div className="mb-4 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/[0.08] px-3 py-1 text-[11px] tracking-wide text-cyan-200">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
        Trusted by the Pi Community
      </div>
      <h2 className="mt-3 text-balance text-xl sm:text-2xl font-extrabold">
        <span className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">OMC Trust Hub</span>
      </h2>
      <p className="mt-2 text-white/80 text-sm">A living directory of trusted X accounts and Spaces. Signal over noise. No scams, no clickbait.</p>
      <div className="mx-auto mt-4 h-px w-40 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
    </div>
  )
}

/* Mobile-first, full-width hero carousel — no edge fades */
function CardCarousel({ items = [], renderItem, keyExtractor = (_, i) => i }) {
  const scrollerRef = useRef(null)

  const scrollByAmount = (dir = 1) => {
    const el = scrollerRef.current
    if (!el) return
    const amt = Math.max(el.clientWidth * 0.9, 320)
    el.scrollBy({ left: dir * amt, behavior: 'smooth' })
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center text-white/60 text-sm">
        Nothing matches your filters (yet).
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Scroller */}
      <div
        ref={scrollerRef}
        className="flex overflow-x-auto py-3 px-0 sm:px-3 gap-3 sm:gap-5
                   snap-x snap-mandatory
                   [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden"
      >
        {/* Mobile spacer minimal, larger on sm+ */}
        <div className="shrink-0 w-1 sm:w-[5%]" />

        {items.map((it, i) => (
          <div
            key={keyExtractor(it, i)}
            className="snap-center shrink-0 w-[100%] sm:w-[88%] md:w-[84%] lg:w-[78%] mx-auto"
          >
            {renderItem(it, i)}
          </div>
        ))}

        <div className="shrink-0 w-1 sm:w-[5%]" />
      </div>

      {/* Arrows */}
      <ArrowButton side="left" onClick={() => scrollByAmount(-1)} />
      <ArrowButton side="right" onClick={() => scrollByAmount(1)} />
    </div>
  )
}


function ArrowButton({ side = 'left', onClick }) {
  const isLeft = side === 'left'
  return (
    <button
      type="button" aria-label={isLeft ? 'Previous' : 'Next'} onClick={onClick}
      className={`hidden sm:flex items-center justify-center absolute top-1/2 -translate-y-1/2 ${isLeft ? 'left-2 sm:left-4' : 'right-2 sm:right-4'} h-10 w-10 rounded-full border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 transition backdrop-blur`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
        {isLeft ? (<path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>) : (<path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>)}
      </svg>
    </button>
  )
}

/* Pulls the highest score source to promo at the top (unused here, safe to keep/remove) */
function TrustHero() {
  const featured = (trustedSources.slice().sort((a,b)=>(b.score||0)-(a.score||0))[0]) || trustedSources[0]
  if (!featured) return null
  return (
    <motion.div className="relative mb-6 overflow-hidden rounded-2xl border border-cyan-500/25 bg-white/[0.06] p-5 sm:p-6 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.35 }}>
      <div className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-50 blur-[10px] bg-[conic-gradient(from_180deg_at_50%_50%,#00ffd555,transparent_40%,#0077ff55)]" />
      <div className="relative flex items-center gap-4 sm:gap-5">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl ring-1 ring-white/15 overflow-hidden">
          <Image src={featured.avatar} alt={featured.name} fill className="object-cover" sizes="80px" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">{featured.name}</h3>
            <span className="inline-flex items-center rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 ring-1 ring-cyan-400/30">TRUSTED</span>
          </div>
          <p className="text-white/70 text-xs sm:text-sm truncate">@{featured.handle} • {featured.followers}</p>
          <p className="mt-1 text-sm text-white/90">{featured.bio}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(featured.topics||[]).slice(0,4).map(t => (
              <span key={t} className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-200">{t}</span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <GlowButton href={featured.links.x} external>Follow on X</GlowButton>
            {featured.links.site && <GlowButton href={featured.links.site} external className="bg-white/10">Open Pi DApp</GlowButton>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* submit/report */
function ReportBox() {
  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold gradient-text">Submit a Trusted Source / Report Misinformation</h3>
      <p className="text-sm text-white/80 mt-2">Share an account/Space you trust, or flag misinformation for review.</p>
      <form className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={(e)=>e.preventDefault()}>
        <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" placeholder="X profile or Space link" />
        <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" placeholder="Why is this trusted / what’s wrong?" />
        <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm sm:col-span-2" placeholder="Optional: sources / proof" />
        <div className="sm:col-span-2 flex gap-2">
          <GlowButton href="/contact">Send</GlowButton>
          <span className="text-xs text-white/50 self-center">We review quickly and update rankings.</span>
        </div>
      </form>
    </div>
  )
}

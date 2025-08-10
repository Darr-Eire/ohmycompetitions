'use client'

import Image from 'next/image'
import Link from 'next/link'

const partnerItems = [
  {
    slug: 'example-dapp',
    name: 'Example DApp',
    logoUrl: '/images/your.png',
    website: 'https://example-dapp.com'
  },
  {
    slug: 'another-dapp',
    name: 'Another DApp',
    logoUrl: '/images/your.png',
    website: 'https://another-dapp.io'
  },
  {
    slug: 'third-dapp',
    name: 'Third DApp',
    logoUrl: '/images/your.png',
    website: 'https://third.app'
  },
]

export default function PartnersPage() {
  return (
    <main className="pages-partners app-background min-h-screen p-4 text-white font-orbitron">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <header className="text-center">
          <div className="competition-top-banner title-gradient mb-3">
            Partners & Sponsors
          </div>
          <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base">
            Collaborating with visionary pioneers, developers, and brands to grow the Pi ecosystem together.
          </p>
        </header>

        {/* Host Your Giveaway */}
        <GlassCard>
          <SectionTitle>Got a Giveaway? Let Us Host It.</SectionTitle>
          <p className="text-center text-white/90 text-sm mb-4">
            Whether you’re launching a Pi-powered game, a community milestone, or a product drop — we’ll run your giveaway end-to-end. 100% secure. 100% transparent. 100% Pi-native.
          </p>
          <ul className="space-y-2 text-white/90 text-sm">
            <li>✅ Transparent prize draws powered by real Pi transactions</li>
            <li>✅ Verified winner announcements & built-in fraud protection</li>
            <li>✅ Reach thousands of active Pi users instantly</li>
            <li>✅ Optional live draws, auto-payments, and branded banners</li>
          </ul>
          <div className="text-center mt-6">
            <Link href="/contact" className="btn-gradient px-6 py-2 inline-block rounded-lg">
              Let’s Talk →
            </Link>
          </div>
        </GlassCard>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {partnerItems.map(partner => (
            <GlassCard key={partner.slug} className="items-center text-center">
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                width={80}
                height={80}
                className="object-contain mb-4"
              />
              <h2 className="text-lg font-semibold gradient-text mb-4">{partner.name}</h2>
              <Link
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gradient w-full py-2 rounded-lg inline-block"
              >
                Visit Site →
              </Link>
            </GlassCard>
          ))}

          {/* Become Partner CTA */}
          <GlassCard className="items-center text-center">
            <div className="mb-4 gradient-text">Your Logo Here</div>
            <p className="mb-6 text-white/90">Want your DApp featured? Contact us!</p>
            <Link href="/contact" className="btn-gradient w-full py-2 rounded-lg inline-block">
              Become a Partner
            </Link>
          </GlassCard>
        </div>

        {/* X Pages That Helped Us Grow */}
        <GlassCard>
          <SectionTitle>X Pages That Helped Us Grow</SectionTitle>
          <ul className="space-y-3 text-white/90 text-sm text-center">
            <li><PartnerLink href="https://x.com/CryptoPioneer">Crypto Pioneer</PartnerLink> — Gave us our first boost.</li>
            <li><PartnerLink href="https://x.com/PiBuildersHub">Pi Builders Hub</PartnerLink> — Shared our early prototype.</li>
            <li><PartnerLink href="https://x.com/PiPulseDaily">Pi Pulse Daily</PartnerLink> — Highlighted our launch week.</li>
            <li><PartnerLink href="https://x.com/OmcUpdates">OMC Updates</PartnerLink> — Kept the community informed.</li>
            <li><PartnerLink href="https://x.com/PioneersGlobal">Pioneers Global</PartnerLink> — Connected us with global Pi fans.</li>
          </ul>
          <p className="text-sm text-center text-white mt-6">
            Huge thanks to these pages and the entire Pi community for believing in Pi Network and what we're building.
          </p>
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

/* ===== Small components for reusability & polish ===== */
function GlassCard({ children, className = '' }) {
  return (
    <div className={`competition-card flex flex-col bg-white/[0.05] border border-cyan-500/20 backdrop-blur-md rounded-2xl p-6 shadow-[0_0_40px_rgba(34,211,238,0.15)] ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] rounded px-4 py-2 mb-4 text-center text-black font-bold text-base sm:text-lg">
      {children}
    </div>
  )
}

function PartnerLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline transition">
      {children}
    </a>
  )
}

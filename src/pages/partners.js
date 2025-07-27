// pages/partners.js
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
    <main className="pages-partners app-background min-h-screen p-4 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <div className="competition-top-banner title-gradient mb-2">
             Partners & Sponsors
          </div>
        
         
        </header>
{/* Host Your Giveaway CTA */}
<section className="competition-card p-6 bg-white bg-opacity-10 rounded-2xl shadow-lg">
  <div className="bg-gradient-to-r from-[#0ff] to-[#0af] rounded px-4 py-2 mb-4">
    <h2 className="text-1xl text-center text-black">
      Got a Giveaway? Let Us Host It.
    </h2>
  </div>

  <p className="text-white text-sm mb-4 text-center">
    Whether you’re launching a Pi-powered game, a community milestone, or a product drop — we’ll run your giveaway end-to-end. 100% secure. 100% transparent. 100% Pi-native.
  </p>

  <ul className="space-y-2 text-white text-sm">
    <li>✅ Transparent prize draws powered by real Pi transactions</li>
    <li>✅ Verified winner announcements & built-in fraud protection</li>
    <li>✅ Reach thousands of active Pi users instantly</li>
    <li>✅ Optional live draws, auto-payments and branded banners</li>
  </ul>

  <div className="text-center mt-6">
    <Link href="/contact">
      <button className="btn-gradient px-6 py-2">Let’s Talk </button>
    </Link>
  </div>
</section>

        {/* Partners grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {partnerItems.map(partner => (
            <div
              key={partner.slug}
              className="competition-card flex flex-col items-center p-6 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center"
            >
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                width={80}
                height={80}
                sizes="80px"
                className="object-contain mb-4"
              />
              <h2 className="text-xl font-semibold gradient-text mb-4 text-black">
                {partner.name}
              </h2>
              <Link
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn-gradient w-full">
                  Visit Site →
                </button>
              </Link>
            </div>
          ))}

          {/* Become a Partner CTA */}
          <div className="competition-card flex flex-col items-center p-6 bg-white bg-opacity-10 rounded-2xl shadow-lg text-center">
            <div className="mb-4 gradient-text text-black">Your Logo Here</div>
            <p className="mb-6 text-white">
              Want your DApp featured? Contact us!
            </p>
            <Link href="/contact">
              <button className="btn-gradient w-full">
                Become a Partner
              </button>
            </Link>
          </div>
        </div>

        {/* Why Partner section */}
        <section className="competition-card p-6 bg-white bg-opacity-10 rounded-2xl shadow-lg">
          <div className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] rounded px-4 py-2 mb-4">
            <h2 className="text-1xl text-center text-black">
              Why Partner With OhMyCompetitions?
            </h2>
          </div>

          <ul className="space-y-3 text-white text-sm">
            <li>
              <strong className="gradient-text">Developer Support:</strong> Direct access to technical assistance and integration guidance.
            </li>
            <li>
              <strong className="gradient-text">Performance Insights:</strong> Get real-time analytics to track user engagement and optimize performance.
            </li>
            <li>
              <strong className="gradient-text">Ecosystem Credibility:</strong> Be featured alongside other verified projects building on the Pi Network.
            </li>
            <li>
              <strong className="gradient-text">Security & Compliance:</strong> Leverage our audited infrastructure for peace of mind.
            </li>
            <li>
              <strong className="gradient-text">Partner Competition:</strong> Feature your competitions across our Pi App and community channels for maximum traction.
            </li>
            <li>
              <strong className="gradient-text">We Pi Family:</strong> Join a trusted alliance of pioneers building real utility in the Pi ecosystem — together we grow.
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}

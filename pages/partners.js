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
    <main className="app-background min-h-screen p-4 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <div className="competition-top-banner title-gradient mb-2">
            🤝 Partners &amp; Sponsors
          </div>
          <p className="text-white">
            Community DApps
          </p>
        </header>

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
                className="object-contain mb-4"
              />
              <h2 className="text-xl font-semibold gradient-text mb-4">
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
            <div className="mb-4 gradient-text">Your Logo Here</div>
            <p className="mb-6 text-white">
              Want your DApp featured? Contact us!
            </p>
            <Link href="/contact">
              <button className="btn-gradient w-full">
                Become a Partner →
              </button>
            </Link>
          </div>
        </div>

        {/* Why Partner section */}
        <section className="competition-card p-6 bg-white bg-opacity-10 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold title-gradient mb-4 text-center">
            Why Partner With OhMyCompetitions?
          </h2>
          <ul className="list-disc list-inside space-y-2 text-white">
            <li>
              <strong className="gradient-text">Instant Trust &amp; Credibility:</strong> Align with a top-ranked platform to build confidence in your DApp.
            </li>
            <li>
              <strong className="gradient-text">Massive Visibility:</strong> Get in front of thousands of crypto-curious users every day.
            </li>
            <li>
              <strong className="gradient-text">Easy Integration:</strong> A single API call and you’re live.
            </li>
            <li>
              <strong className="gradient-text">Shared Marketing:</strong> Cross-promote in our socials and newsletter.
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
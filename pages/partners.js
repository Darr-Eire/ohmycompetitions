// pages/partners.js
'use client'

import Image from 'next/image'
import Link from 'next/link'

// Your real partner data here
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
  // …
]

export default function PartnersPage() {
  return (
    <main
      className="min-h-screen p-4"
      style={{
        backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #60A5FA)',
      }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            🤝 Partners &amp; Sponsors
          </h1>
          <p className="text-white">
            Community DApps
          </p>
        </header>

        {/* Partners grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {partnerItems.map(partner => (
            <div
              key={partner.slug}
              className="competition-card flex flex-col items-center p-6 text-center"
            >
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                width={80}
                height={80}
                className="object-contain mb-4"
              />
              <h2 className="text-xl font-semibold mb-4">{partner.name}</h2>
              <Link
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="comp-button w-full">
                  Visit Site →
                </button>
              </Link>
            </div>
          ))}

          {/* Become a Partner CTA */}
          <div className="competition-card flex flex-col items-center p-6 text-center">
            <div className="mb-4 text-gray-500">Your Logo Here</div>
            <p className="mb-6 text-gray-700">
              Want your DApp featured? Contact us!
            </p>
            <Link href="/contact">
              <button className="comp-button w-full">
                Become a Partner →
              </button>
            </Link>
          </div>
        </div>

        {/* Why Partner section */}
        <section className="competition-card p-6 text-left">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Why Partner With OhMyCompetitions?
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-800">
            <li>
              <strong>Instant Trust &amp; Credibility:</strong> Align with a top-ranked platform to build confidence in your DApp.
            </li>
            <li>
              <strong>Massive Visibility:</strong> Get in front of thousands of crypto-curious users every day.
            </li>
            <li>
              <strong>Easy Integration:</strong> A single API call and you’re live.
            </li>
            <li>
              <strong>Shared Marketing:</strong> Cross-promote in our socials and newsletter.
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}

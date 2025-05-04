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
    <main className="bg-white min-h-screen py-8">
      {/* Centered container with side padding */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="inline-flex items-center justify-center text-2xl sm:text-3xl font-bold">
            <span className="mr-2 text-2xl">🤝</span>
          Partners/Sponsors
          </h1>
          <p className="mt-2 text-white text-1xl">
            We Promote Community DApps
          </p>
        </header>

        {/* Grid: 1col ↔ 2col@sm ↔ 3col@md ↔ 4col@lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {partnerItems.map(partner => (
            <div
              key={partner.slug}
              className="w-full flex flex-col items-center bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm text-center"
            >
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                width={80}
                height={80}
                className="object-contain mb-4"
              />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                {partner.name}
              </h2>
              <Link
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto text-blue-600 text-sm hover:underline"
              >
                Visit Site →
              </Link>
            </div>
          ))}

          {/* Become a Partner CTA */}
          <div className="w-full flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="mb-4 text-gray-500 text-sm">Your Logo Here</div>
            <p className="text-gray-600 text-sm mb-4">
              Want your DApp featured? Contact us!
            </p>
            <Link
              href="/contact"
              className="inline-block bg-blue-600 text-white text-sm py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Become a Partner →
            </Link>
          </div>
        </div>

        {/* Why Partner section */}
        <section className="mt-12 max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">
            Why Partner With OhMyCompetitions?
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base">
            <li>
              <strong>Instant Trust &amp; Credibility:</strong> Align with a
              top-ranked platform to build confidence in your DApp.
            </li>
            <li>
              <strong>Massive Visibility:</strong> Get in front of thousands of
              crypto-curious users every day.
            </li>
            <li>
              <strong>Easy Integration:</strong> A single API call and you’re live.
            </li>
            <li>
              <strong>Shared Marketing:</strong> Cross-promote in our socials
              and newsletter.
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}

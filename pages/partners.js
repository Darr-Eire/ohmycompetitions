// pages/partners.js
'use client'
import Image from 'next/image'
import Link from 'next/link'
export default function PartnersPage() {
  const integrations = [
   
    {
        name: 'Your Logo Here',
        logo: '/images/your.png',
        description: 'Want to see your DApp here? Contact us to get featured!',
        link: '/partners/form',
        isPlaceholder: true,
      },
  ]

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="competition-card max-w-4xl mx-auto overflow-hidden">
        {/* Top Banner */}
        <div className="competition-top-banner text-3xl">
          🤝 Featured Integrations
        </div>

        <div className="bg-white p-6 space-y-8">
          {/* Integrations Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b-2 pb-2">
              We Promote Community DApps
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {integrations.map(intg => (
                <div
                  key={intg.name}
                  className={`
                    flex flex-col items-center space-y-3
                    border rounded-lg p-6 shadow
                    ${intg.isPlaceholder ? 'opacity-60' : ''}
                  `}
                >
                  <Image
                    src={intg.logo}
                    alt={intg.name}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                  <h3 className="font-semibold">{intg.name}</h3>
                  <p className="text-sm text-center">{intg.description}</p>
                  <Link
                    href={intg.link}
                    className="mt-2 inline-block text-blue-600 hover:underline text-sm"
                  >
                    Become a Partner →
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Partner Benefits */}
          <section className="space-y-6 bg-gray-50 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-center text-blue-600">
              Why Partner With OhMyCompetitions?
            </h2>
            <ul className="space-y-4 list-disc list-inside text-gray-800">
              <li>
                <strong>Instant Trust &amp; Credibility:</strong>{' '}
                Aligning with a trusted platform like ours instantly boosts your DApp’s reputation. Users know they’re entering a fair, secure giveaway.
              </li>
              <li>
                <strong>Zero Integration Headaches:</strong>{' '}
                We handle ticketing, random draws, and reward distribution—so you can focus on building features, not back‑end logistics.
              </li>
              <li>
                <strong>Community Growth Engine:</strong>{' '}
                Giveaways are proven to increase daily active users and retention. Tap into our established audience, then watch them stick around for your core features.
              </li>
              <li>
                <strong>Official Pi App Giveaway Hub:</strong>{' '}
                We’re building the Pi ecosystem’s go‑to giveaway destination. We want to be the first DApp featured when Pi users think “giveaway.”
              </li>
            </ul>
            <div className="text-center mt-6">
            <Link href="/partners/form" className="view-more-button">
  Become a Partner →
</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
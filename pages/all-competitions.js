'use client'

import Link from 'next/link'

export default function AllCompetitions() {
  const competitions = [
    {
      title: 'Everyday Pioneer',
      slug: 'everyday-pioneer',
      prize: '1,000 PI Giveaway',
      entryFee: '0.314 π',
      totalTickets: 1000,
      soldTickets: 300,
      endsIn: '13h 58m',
    },
    // Later you can add more competitions here!
  ]

  return (
    <main className="page p-6">
      <h1 className="text-2xl font-bold text-center mb-8">All Competitions 🎉</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {competitions.map((comp) => (
          <div
            key={comp.slug}
            className="competition-card"
          >
            <div className="competition-top-banner">{comp.title}</div>

            <div className="competition-info">
              <p><strong>Prize:</strong> {comp.prize}</p>
              <p><strong>Entry Fee:</strong> {comp.entryFee}</p>
              <p><strong>Total Tickets:</strong> {comp.totalTickets}</p>
              <p><strong>Sold:</strong> {comp.soldTickets}</p>
              <p><strong>Draw ends in:</strong> {comp.endsIn}</p>
            </div>

            <Link href={`/competitions/${comp.slug}`}>
              <button className="comp-button">Enter Now</button>
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}

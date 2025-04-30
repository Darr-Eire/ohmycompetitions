// pages/competitions/index.js
import clientPromise from '../../src/lib/mongodb'
import CompetitionCard from '@/components/CompetitionCard'
import Link from 'next/link'

export async function getStaticProps() {
  const client = await clientPromise
  const db = client.db('ohmycompetitions')

  // Fetch all competitions, projecting only the fields we need
  const docs = await db
    .collection('competitions')
    .find({}, { projection: { _id: 1, title: 1, prize: 1, entryFee: 1, slug: 1 } })
    .toArray()

  // Serialize for JSON
  const competitions = docs.map((c) => ({
    _id: c._id.toString(),
    title: c.title,
    prize: c.prize,
    entryFee: c.entryFee,
    slug: c.slug,
  }))

  return {
    props: { competitions },
    revalidate: 60, // ISR: rebuild at most once per minute
  }
}

export default function CompetitionsIndex({ competitions }) {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold">All Competitions</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {competitions.map((competition) => (
          <Link
            key={competition._id}
            href={`/competitions/${competition.slug}`}
            passHref
          >
            <a>
              <CompetitionCard
                title={competition.title}
                prize={competition.prize}
                fee={
                  competition.entryFee != null
                    ? `${competition.entryFee} π`
                    : 'Free'
                }
              />
            </a>
          </Link>
        ))}
      </div>
    </main>
  )
}

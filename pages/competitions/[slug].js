// pages/competitions/[slug].js
import clientPromise from '../../src/lib/mongodb'
import CompetitionCard from '@/components/CompetitionCard'

export async function getStaticPaths() {
  const client = await clientPromise
  const db = client.db('ohmycompetitions')
  const all = await db
    .collection('competitions')
    .find({}, { projection: { slug: 1 } })
    .toArray()

  return {
    paths: all.map(c => ({ params: { slug: c.slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const client = await clientPromise
  const db = client.db('ohmycompetitions')
  const competition = await db
    .collection('competitions')
    .findOne({ slug: params.slug })

  if (!competition) {
    return { notFound: true }
  }

  competition._id = competition._id.toString()
  competition.createdAt = competition.createdAt.toISOString()

  return {
    props: { competition },
    revalidate: 60,
  }
}

export default function CompetitionDetail({ competition }) {
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{competition.title}</h1>
      <p className="text-gray-600">Prize: {competition.prize}</p>
      <p className="text-gray-600">
        Entry Fee: {competition.entryFee ?? 'Free'} π
      </p>

      <CompetitionCard
        title={competition.title}
        prize={competition.prize}
        fee={competition.entryFee != null ? `${competition.entryFee} π` : 'Free'}
        href="#"
      >
        <button className="mt-4 btn btn-primary">
          Enter Now
        </button>
      </CompetitionCard>
    </main>
  )
}


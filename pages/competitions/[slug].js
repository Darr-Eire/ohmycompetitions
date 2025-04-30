// pages/competitions/[slug].js
import clientPromise from '../../src/lib/mongodb'
import CompetitionCard from '@/components/CompetitionCard'

export async function getStaticPaths() {
  const client = await clientPromise
  const all = await client.db('ohmycompetitions')
    .collection('competitions')
    .find({}, { projection: { slug: 1 } })
    .toArray()

  const paths = all.map(c => ({ params: { slug: c.slug } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const client = await clientPromise
  const comp = await client.db('ohmycompetitions')
    .collection('competitions')
    .findOne({ slug: params.slug })

  if (!comp) return { notFound: true }

  comp._id = comp._id.toString()
  comp.createdAt = comp.createdAt.toISOString()

  return {
    props: { comp },
    revalidate: 60,
  }
}

export default function CompetitionDetail({ comp }) {
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{comp.title}</h1>
      <p className="text-gray-600">Prize: {comp.prize}</p>
      <p className="text-gray-600">
        Entry Fee: {comp.entryFee ?? 'Free'} π
      </p>
      <CompetitionCard
        title={comp.title}
        prize={comp.prize}
        fee={comp.entryFee != null ? `${comp.entryFee} π` : 'Free'}
        href="#"
      >
        <button className="mt-4 btn btn-primary">
          Enter Now
        </button>
      </CompetitionCard>
    </main>
  )
}

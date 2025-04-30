// pages/ticket-purchase/[slug].js
import { getSession } from 'next-auth/react'
import clientPromise from '../../src/lib/mongodb'
import { createPiPaymentSession } from '../../src/lib/pi'

export default function PurchasePage({ comp, sessionUrl, error }) {
  if (error) {
    return <p className="p-8 text-red-500">Error: {error}</p>
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{comp.title}</h1>
      <p>Prize: {comp.prize}</p>
      <p>Entry fee: {comp.entryFee ?? 0} π</p>
      <a
        href={sessionUrl}
        className="btn btn-primary w-full text-center block"
      >
        Enter Competition
      </a>
    </main>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params

  // 1) Protect the page
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }

  try {
    // 2) Load competition by slug
    const client = await clientPromise
    const db = client.db('ohmycompetitions')
    const comp = await db.collection('competitions').findOne({ slug })
    if (!comp) return { notFound: true }

    // 3) Create a Pi payment session
    const paymentUrl = await createPiPaymentSession({
      competitionId: comp._id.toString(),
      amount: comp.entryFee || 0,
      memo: `Entry fee for ${comp.title}`,
    })

    return {
      props: {
        comp: {
          _id: comp._id.toString(),
          title: comp.title,
          prize: comp.prize,
          entryFee: comp.entryFee,
          slug: comp.slug,
        },
        sessionUrl: paymentUrl,
      },
    }
  } catch (err) {
    return {
      props: {
        error: err.message,
      },
    }
  }
}

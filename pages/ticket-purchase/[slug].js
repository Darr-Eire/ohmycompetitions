// pages/ticket-purchase/[slug].js
import { getSession } from 'next-auth/react'
import { fetchCompetitionBySlug } from '@/lib/db'          // your helper to load a comp
import { createPiPaymentSession } from '@/lib/pi'          // your Pi SDK wrapper

export default function PurchasePage({ comp, sessionUrl, error }) {
  if (error) {
    return <p className="p-8 text-red-500">Error: {error}</p>
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{comp.title}</h1>
      <p>Prize: {comp.prize}</p>
      <p>Entry fee: {comp.entryFee ?? 0} π</p>
      <a href={sessionUrl} className="btn btn-primary w-full">
        Enter Competition
      </a>
    </main>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params

  // Ensure user is logged in
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
    // 1) Load the competition from your DB
    const comp = await fetchCompetitionBySlug(slug)
    if (!comp) {
      return { notFound: true }
    }

    // 2) Create a Pi payment session URL (server-side!)
    const paymentUrl = await createPiPaymentSession({
      competitionId: comp._id,
      amount: comp.entryFee || 0,
      // ...any other metadata
    })

    return {
      props: {
        comp,
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

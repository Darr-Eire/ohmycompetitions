// pages/ticket-purchase/[slug].js
'use client'
import { useRouter } from 'next/router'
import BuyTicketButton from '@/components/BuyTicketButton'

const DATA = {
  'ps5-bundle-giveaway': { title: 'PS5 Bundle Giveaway', entryFee: 0.8 },
  // …other slugs…
}

export default function TicketPurchasePage() {
  const { slug } = useRouter().query
  if (!slug) return <p>Loading…</p>
  const comp = DATA[slug]
  if (!comp) return <p>Competition “{slug}” not found</p>

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{comp.title}</h1>
      <p className="mb-4">Entry Fee: {comp.entryFee} π</p>
      <BuyTicketButton
        entryFee={comp.entryFee}
        competitionSlug={slug}
      />
    </div>
  )
}

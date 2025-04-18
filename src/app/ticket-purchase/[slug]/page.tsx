'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function TicketPurchasePage() {
  const params = useParams()
  const slug = params?.slug as string

  const router = useRouter()
  const { data: session } = useSession()
  const [competition, setCompetition] = useState<any>(null)

  useEffect(() => {
    if (!slug) return
    const fetchCompetition = async () => {
      try {
        const res = await fetch(`/api/competition/${slug}`)
        const data = await res.json()
        setCompetition(data)
      } catch (err) {
        console.error('Error fetching competition:', err)
      }
    }

    fetchCompetition()
  }, [slug])

  if (!competition) return <div className="p-4">Loading competition details...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">{competition.title}</h1>
      <p>{competition.description}</p>
      <p>🎟️ Tickets Available: {competition.totalTickets - competition.ticketsSold}</p>
      <p>💰 Entry Fee: {competition.entryFee} π</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">Enter Now</button>
    </div>
  )
}

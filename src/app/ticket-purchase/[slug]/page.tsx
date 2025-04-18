'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react' // or your Pi login session
import { useRouter } from 'next/navigation'

export default function TicketPurchasePage() {
  const { slug } = useParams()
  const router = useRouter()
  const { data: session } = useSession() // update if using Pi auth
  const [competition, setCompetition] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCompetition = async () => {
      const res = await fetch(`/api/competition/${slug}`)
      const data = await res.json()
      setCompetition(data)
    }

    if (slug) fetchCompetition()
  }, [slug])

  const handlePurchase = async () => {
    if (!session?.user?.id) {
      alert('Please log in first.')
      return
    }

    const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          competitionId: competition.id,
          quantity: Number(quantity),
        }),
      })
      

    const result = await res.json()
    setLoading(false)

    if (res.ok) {
      alert('Tickets purchased successfully!')
      router.push('/account')
    } else {
      alert(result.error || 'Something went wrong.')
    }
  }

  if (!competition) return <div>Loading...</div>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{competition.title}</h1>
      <img src={competition.imageUrl} alt={competition.title} className="mb-4 rounded" />
      <p>🎟️ {competition.ticketsToSell - competition.ticketsSold} tickets remaining</p>
      <p>💰 Entry Fee: {competition.entryFee}π</p>

      <input
        type="number"
        value={quantity}
        min={1}
        max={competition.ticketsToSell - competition.ticketsSold}
        onChange={(e) => setQuantity(Number(e.target.value))}

        className="border p-2 my-4 w-full"
      />

      <button
        onClick={handlePurchase}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay with Pi'}
      </button>
    </div>
  )
}

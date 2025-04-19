'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Competition {
  id: string
  title: string
  description?: string
  image?: string
  prize?: string
  ticketsSold: number
  totalTickets: number
  entryFee: string
  endDate?: string
}

export default function TicketPurchasePage() {
  const params = useParams()
  const slug = params?.slug as string

  const [competition, setCompetition] = useState<Competition | null>(null)

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

  const handlePayWithPi = () => {
    if (!window.Pi) {
      alert('Pi SDK not available. Please open in Pi Browser.')
      return
    }

    const userId = localStorage.getItem('pi_user_uid')
    if (!userId) {
      alert('Please log in with Pi before entering.')
      return
    }

    if (!competition) return

    const paymentData = {
      amount: parseFloat(competition.entryFee),
      memo: `Entry for ${competition.title}`,
      metadata: {
        competitionId: competition.id,
        userId,
        quantity: 1,
      },
    }

    const callbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        console.log('🛡️ Approving...', paymentId)
        await fetch('/api/pi/approve-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            userId,
            competitionId: competition.id,
            quantity: 1,
          }),
        })
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        console.log('✅ Completing...', paymentId, txid)
        await fetch('/api/pi/complete-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        })
        alert('🎉 Entry confirmed!')
      },
      onCancel: (paymentId: string) => {
        console.warn('❌ Cancelled', paymentId)
      },
      onError: (error: Error) => {
        console.error('❌ Payment error', error)
      },
    }

    window.Pi.createPayment(paymentData, callbacks)
  }

  if (!competition) return <div className="p-4">Loading competition details...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">{competition.title}</h1>
      {competition.description && <p>{competition.description}</p>}
      <p>🎟️ Tickets Available: {competition.totalTickets - competition.ticketsSold}</p>
      <p>💰 Entry Fee: {competition.entryFee} π</p>

      <button
        onClick={handlePayWithPi}
        className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300"
      >
        Pay with Pi
      </button>
    </div>
  )
}

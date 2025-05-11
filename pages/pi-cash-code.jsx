'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import GhostWinnerLog from '@/components/GhostWinnerLog'
import ClaimedWinnersLog from '@/components/ClaimedWinnersLog'

export default function PiCashCodePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [codeData, setCodeData] = useState(null)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const fetchCode = async () => {
      const res = await fetch('/api/pi-cash-code')
      const data = await res.json()
      setCodeData(data)
      setLoading(false)
    }
    fetchCode()
  }, [])

  useEffect(() => {
    if (!codeData?.expiresAt) return

    const interval = setInterval(() => {
      const now = new Date()
      const end = new Date(codeData.expiresAt)
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft('Expired')
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60))
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const s = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${h}h ${m}m ${s}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [codeData])

  const handleConfirmTicket = async () => {
    if (!session?.user) {
      alert('⚠️ Please log in with Pi Network first.')
      return
    }

    try {
      const payment = await window.Pi.createPayment({
        amount: 3.14,
        memo: 'Pi Cash Code Ticket',
        metadata: { type: 'pi-cash-ticket', week: codeData?.weekStart?.split('T')[0] }
      })

      if (payment?.transaction?.txid) {
        await fetch('/api/pi-cash-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txid: payment.transaction.txid,
            userId: session.user.id,
            week: codeData?.weekStart?.split('T')[0]
          })
        })

        alert('✅ Ticket confirmed! Good luck 🍀')
      } else {
        alert('❌ Payment not approved.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('❌ Payment failed or was cancelled.')
    }
  }

  if (loading) {
    return <div className="text-center text-white py-20">Loading Pi Cash Code...</div>
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-10 text-white">
      {/* HERO */}
      <section className="text-center bg-black rounded-xl p-6 border border-pink-500 shadow-lg space-y-4">
        <h1 className="text-3xl font-bold text-pink-400">🎉 Pi Cash Code</h1>
        <p className="text-xl">Enter the code before time runs out:</p>
        <div className="text-4xl font-mono bg-pink-600 px-6 py-3 rounded inline-block tracking-widest">
          {codeData?.code}
        </div>
        <div className="text-lg mt-2">⏰ Time Left: <span className="font-semibold">{timeLeft}</span></div>
        <div className="text-lg">🏆 Prize Pool: <span className="text-yellow-300 font-bold">{codeData?.prizePool} π</span></div>
        <button
          onClick={handleConfirmTicket}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-black rounded-lg font-bold shadow hover:scale-105 transition"
        >
          🎟 Confirm Ticket Purchase
        </button>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-cyan-400 space-y-4">
        <h2 className="text-2xl font-bold text-cyan-300">📜 How It Works</h2>
        <ul className="list-disc list-inside space-y-2 text-white/90">
          <li>The code is released every Monday at <strong>3:14 PM UTC</strong>.</li>
          <li>The code remains active for <strong>31 hours and 4 minutes</strong>.</li>
          <li>On Friday at <strong>3:14 PM UTC</strong>, one ticket is randomly drawn.</li>
          <li>The winner has <strong>31 minutes and 4 seconds</strong> to submit the correct code.</li>
          <li>If the winner fails, the prize <strong>rolls over</strong> and increases by 25%.</li>
          <li><strong>20%</strong> of previous tickets roll into next week’s draw.</li>
        </ul>
      </section>

      {/* UPCOMING DRAW */}
      <section className="bg-white bg-opacity-5 rounded-xl p-6 border border-yellow-400 space-y-2">
        <h2 className="text-2xl font-bold text-yellow-300">📅 Upcoming Draw</h2>
        <p>⏱️ Friday @ 3:14 PM UTC → <span className="font-bold">{new Date(codeData?.drawAt).toUTCString()}</span></p>
        <p>💰 Current prize: <span className="text-yellow-300 font-bold">{codeData?.prizePool} π</span></p>
      </section>

      {/* GHOST WINNERS */}
      <section className="bg-white bg-opacity-5 rounded-xl p-6 border border-gray-600 text-white">
        <h2 className="text-xl font-bold mb-4">👻 Ghost Winner Log</h2>
        <GhostWinnerLog />
      </section>

      {/* CLAIMED WINNERS */}
      <section className="bg-white bg-opacity-5 rounded-xl p-6 border border-green-500 text-white">
        <h2 className="text-xl font-bold mb-4">🏅 Claimed Winners</h2>
        <ClaimedWinnersLog />
      </section>
    </main>
  )
}

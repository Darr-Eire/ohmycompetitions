'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function ClaimCodePage() {
  const { data: session } = useSession()
  const [codeInput, setCodeInput] = useState('')
  const [status, setStatus] = useState('')
  const [eligible, setEligible] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWinner = async () => {
      const res = await fetch('/api/pi-cash-code')
      const data = await res.json()

      if (
        session?.user?.id === data?.winner?.userId &&
        new Date() >= new Date(data.drawAt) &&
        new Date() <= new Date(data.claimExpiresAt)
      ) {
        setEligible(true)
      }

      setLoading(false)
    }

    if (session?.user) {
      fetchWinner()
    }
  }, [session])

  const handleSubmit = async () => {
    const res = await fetch('/api/claim-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: codeInput, userId: session.user.id })
    })

    const result = await res.json()
    if (result.success) {
      setStatus('✅ Code accepted! Prize claimed 🎉')
    } else {
      setStatus(`❌ ${result.message}`)
    }
  }

  if (loading) return <div className="text-white text-center py-10">Loading...</div>
  if (!eligible) return <div className="text-white text-center py-10">⏳ You’re not currently eligible to claim.</div>

  return (
    <div className="max-w-md mx-auto p-6 bg-black text-white rounded-xl border border-yellow-400 mt-10 space-y-4">
      <h1 className="text-2xl font-bold text-yellow-300 text-center">🎯 Claim Your Pi Cash Prize</h1>
      <p className="text-center text-sm text-white/70">Enter the winning code below within 31:04 minutes of the draw.</p>
      <input
        type="text"
        value={codeInput}
        onChange={(e) => setCodeInput(e.target.value)}
        placeholder="Enter winning code"
        className="w-full px-4 py-2 text-black rounded"
      />
      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-pink-500 to-yellow-300 text-black font-bold py-2 rounded hover:scale-105 transition"
      >
        Submit Code
      </button>
      <p className="text-center">{status}</p>
    </div>
  )
}

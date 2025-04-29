// pages/ticket-purchase/[slug].js
'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'

export default function PurchasePage({ params }) {
  const { slug } = params
  const { data: session } = useSession()
  const [comp, setComp] = useState(null)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/competitions/${slug}`)
        if (!res.ok) throw new Error(res.statusText)
        const data = await res.json()
        setComp(data)
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [slug])

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p>Please sign in to enter.</p>
        <button onClick={() => signIn()} className="mt-4 btn">
          Sign In
        </button>
      </div>
    )
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>
  if (!comp) return <p className="p-8">Loading…</p>

  async function handleEnter() {
    try {
      const res = await fetch(`/api/competitions/${comp._id}/enter`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Purchase failed')
      const { paymentUrl } = await res.json()
      // Redirect to Pi payment flow or wherever:
      window.location.href = paymentUrl
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{comp.title}</h1>
      <p>Prize: {comp.prize}</p>
      <p>Entry fee: {comp.entryFee ?? 0} π</p>
      <button onClick={handleEnter} className="btn btn-primary w-full">
        Enter Competition
      </button>
    </main>
  )
}

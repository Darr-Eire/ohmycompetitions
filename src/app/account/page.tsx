'use client'
export const dynamic = 'force-dynamic'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

// rest of your component...


interface Entry {
  id: string
  quantity: number
  createdAt: string
  competition?: {
    title: string
  }
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEntries = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch(`/api/user/${session.user.id}`)
          const data = await res.json()
          setEntries(data.entries || [])
        } catch (err) {
          console.error('Failed to fetch entries:', err)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchEntries()
  }, [session])

  if (status === 'loading' || loading) return <div className="p-4">Loading your account...</div>
  if (!session) return <div className="p-4">Please log in to view your account.</div>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Entries</h1>

      {entries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="border p-4 rounded shadow-sm bg-white">
              <p className="font-semibold">{entry.competition?.title || 'Unknown Competition'}</p>
              <p>🎟️ Quantity: {entry.quantity}</p>
              <p>📅 Date: {new Date(entry.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

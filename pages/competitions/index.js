'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

export default function AllCompetitions() {
  const { data: session } = useSession()
  const carouselRef = useRef(null)
  const [competitions, setCompetitions] = useState([])

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const res = await fetch('/api/competitions')
    const data = await res.json()
    setCompetitions(data)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this competition?')) return
    const res = await fetch(`/api/competitions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCompetitions(comps => comps.filter(c => c._id !== id))
    } else {
      alert('Delete failed')
    }
  }

  return (
    <main className="pt-0 pb-12 px-4 space-y-8 bg-white min-h-screen">
      {/* Auth Controls */}
      <div className="flex justify-end space-x-4">
        {!session ? (
          <button onClick={() => signIn()} className="px-4 py-2 bg-blue-600 text-white rounded">
            Sign In
          </button>
        ) : (
          <>
            <button onClick={() => signOut()} className="px-4 py-2 bg-gray-600 text-white rounded">
              Sign Out
            </button>
            {session.user.isAdmin && (
              <Link href="/competitions/new">
                <button className="px-4 py-2 bg-green-600 text-white rounded">
                  New Competition
                </button>
              </Link>
            )}
          </>
        )}
      </div>

      {/* Carousel */}
      <div className="relative">
        <div ref={carouselRef} className="flex space-x-4 overflow-x-auto scroll-smooth">
          {competitions.length > 0 ? (
            competitions.map(comp => (
              <CompetitionCard
                key={comp._id}
                title={comp.title}
                prize={comp.prize}
                fee={comp.entryFee != null ? `${comp.entryFee} π` : 'Free'}
                href={`/competitions/${comp.slug}`}
                small
              >
                {session?.user?.isAdmin && (
                  <button
                    onClick={() => handleDelete(comp._id)}
                    className="mt-2 text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                )}
              </CompetitionCard>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full">Loading competitions...</p>
          )}
        </div>
      </div>
    </main>
  )
}

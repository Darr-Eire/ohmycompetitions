// pages/competitions/index.js
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

export default function AllCompetitions() {
  const { data: session } = useSession()
  const [competitions, setCompetitions] = useState([])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/competitions')
      const data = await res.json()

      // Inject Pi Day Freebie manually at top
      const piDay = {
        _id: 'pi-day-2026',
        slug: 'pi-day-freebie',
        title: 'Pi Day Freebie',
        prize: '🎉 Pi Day Badge',
        entryFee: 0,
      }

      setCompetitions([piDay, ...data])
    }
    load()
  }, [])

  async function handleDelete(id) {
    if (!confirm('Delete this competition?')) return
    const res = await fetch(`/api/competitions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCompetitions(cs => cs.filter(c => c._id !== id))
    } else {
      alert('Delete failed')
    }
  }

  return (
    <main className="pt-6 pb-12 px-4 bg-white min-h-screen">
      {/* Auth Buttons */}
      <div className="flex justify-end space-x-4 mb-8">
        {!session ? (
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Sign In
          </button>
        ) : (
          <>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
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

      {/* 2 cols by default, 4 cols at ≥768px */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {competitions.length > 0 ? (
          competitions.map(comp => {
            const isFreebie = comp.slug === 'pi-day-freebie'
            return (
              <CompetitionCard
                key={comp._id}
                comp={comp}
                title={comp.title}
                prize={comp.prize}
                fee={comp.entryFee != null ? `${comp.entryFee} π` : 'Free'}
                href={`/competitions/${comp.slug}`}
                small
                className="w-full"
              >
                {isFreebie && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-center">
                    <h4 className="text-green-700 font-semibold">
                      Referral Rewards
                    </h4>
                    <p className="text-sm text-gray-600">
                      Earn 1 free entry for every friend who signs up!
                    </p>
                    <Link
                      href={`/refer?comp=${comp.slug}`}
                      className="text-green-600 text-sm underline"
                    >
                      Get your referral link
                    </Link>
                  </div>
                )}
                {session?.user?.isAdmin && (
                  <button
                    onClick={() => handleDelete(comp._id)}
                    className="mt-2 text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                )}
              </CompetitionCard>
            )
          })
        ) : (
          <p className="text-center text-gray-500 w-full">
            Loading competitions...
          </p>
        )}
      </div>
    </main>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}

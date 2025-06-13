'use client'

import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function PioneerVotePage() {
  const [nominations, setNominations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNominations = async () => {
      const res = await fetch('/api/nominations')
      const data = await res.json()
      setNominations(data)
      setLoading(false)
    }

    fetchNominations()
  }, [])

  return (
    <>
      <Head>
        <title>Pioneer of the Week | Vote Now</title>
      </Head>

      <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
        <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white px-6 py-4 rounded-xl shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400 inline-block">
              Vote for Pioneer of the Week
            </h1>
          </div>

          {/* Content */}
          {loading ? (
            <p className="text-center text-white">Loading nominations...</p>
          ) : nominations.length === 0 ? (
            <p className="text-center text-white">No nominations yet. Check back soon!</p>
          ) : (
            <div className="space-y-6">
              {nominations.map((entry, i) => (
                <div
                  key={i}
                  className="border border-cyan-600 rounded-xl bg-[#0f172a]/60 p-4 shadow-[0_0_20px_#00fff044] backdrop-blur-md"
                >
                  <h2 className="text-lg font-bold text-cyan-300 mb-1">{entry.nominee}</h2>
                  <p className="text-sm text-white">{entry.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

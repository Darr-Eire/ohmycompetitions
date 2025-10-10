'use client'
import { useEffect, useState } from 'react'

export default function ClaimedWinnersLog() {
  const [winners, setWinners] = useState([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/claimed-winners')
      const data = await res.json()
      setWinners(data)
    }
    load()
  }, [])

  if (!winners.length) {
    return <div className="text-sm italic text-white/70">No claimed winners yet 🏅</div>
  }

  return (
    <div className="space-y-4">
      {winners.map((w, i) => (
        <div key={i} className="bg-black border border-green-500 rounded-lg p-4 space-y-1">
          <div className="text-green-300 font-bold">Week: {new Date(w.weekStart).toDateString()}</div>
          <div>Code: <span className="font-mono">{w.code}</span></div>
          <div>Winner: <span className="text-green-400">{w.userId}</span></div>
          <div>Prize: <span className="text-yellow-200 font-bold">{w.prizePool} π</span></div>
        </div>
      ))}
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'

export default function GhostWinnerLog() {
  const [ghosts, setGhosts] = useState([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/ghost-winners')
      const data = await res.json()
      setGhosts(data)
    }
    load()
  }, [])

  if (!ghosts.length) {
    return <div className="text-sm italic text-white/70">No missed winners yet 👻</div>
  }

  return (
    <div className="space-y-4">
      {ghosts.map((g, i) => (
        <div key={i} className="bg-black border border-gray-600 rounded-lg p-4 space-y-1">
          <div className="text-yellow-300 font-bold">Week: {new Date(g.weekStart).toDateString()}</div>
          <div>Code: <span className="font-mono">{g.code}</span></div>
          <div>Status: <span className="text-red-400 font-semibold">Unclaimed</span></div>
          <div>Missed Prize: <span className="text-yellow-200 font-bold">{g.prizePool} π</span></div>
        </div>
      ))}
    </div>
  )
}

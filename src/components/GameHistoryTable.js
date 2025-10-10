'use client'

import { useEffect, useState } from 'react'

export default function GameHistoryTable() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    fetch('/api/user/game-history')
      .then(res => res.json())
      .then(setHistory)
  }, [])

  if (!history.length) {
    return (
      <div className="bg-white bg-opacity-10 p-6 rounded-2xl text-white text-center">
        You haven’t played any games yet.
      </div>
    )
  }

  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-2xl text-white">
      <h2 className="text-xl font-bold mb-4">🎮 Game History</h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-white/20">
            <th className="py-2 pr-4">Game</th>
            <th className="py-2 pr-4">Result</th>
            <th className="py-2 pr-4">Prize</th>
            <th className="py-2 pr-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry._id} className="border-b border-white/10 hover:bg-white/5">
              <td className="py-2 pr-4 capitalize">{entry.game}</td>
              <td className="py-2 pr-4">{entry.result}</td>
              <td className="py-2 pr-4">{entry.prizeAmount ?? '—'}</td>
              <td className="py-2 pr-4">
                {new Date(entry.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

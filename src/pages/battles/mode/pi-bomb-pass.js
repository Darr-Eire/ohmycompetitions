'use client'

import { useEffect, useState } from 'react'

const PLAYERS = [
  { username: 'Player1', eliminated: false },
  { username: 'Player2', eliminated: false },
  { username: 'Player3', eliminated: false },
  { username: 'Player4', eliminated: false },
  { username: 'Player5', eliminated: false },
  { username: 'Player6', eliminated: false },
  { username: 'Player7', eliminated: false },
  { username: 'Player8', eliminated: false },
]

export default function PiBombPass() {
  const [round, setRound] = useState(1)
  const [players, setPlayers] = useState(PLAYERS)
  const [bombs, setBombs] = useState([])
  const [messages, setMessages] = useState([])

  // Simulate bomb explosion after random time
  const triggerBomb = (bombIndex) => {
    const bomb = bombs[bombIndex]
    const explodeDelay = Math.random() * 3000 + 2000 // 2-5 sec

    setTimeout(() => {
      setMessages((m) => [...m, `💥 ${bomb.holder} exploded!`])
      eliminatePlayer(bomb.holder)

      // Remove bomb or hand to another
      setBombs((b) => {
        const updated = [...b]
        updated.splice(bombIndex, 1)
        return updated
      })
    }, explodeDelay)
  }

  // Eliminate player
  const eliminatePlayer = (username) => {
    setPlayers((prev) =>
      prev.map((p) => (p.username === username ? { ...p, eliminated: true } : p))
    )
  }

  // Start round
  useEffect(() => {
    const alive = players.filter((p) => !p.eliminated)

    if (alive.length <= 1) return

    const bombsThisRound = round <= 2 ? 2 : 1

    const newBombs = Array.from({ length: bombsThisRound }).map(() => ({
      holder: alive[Math.floor(Math.random() * alive.length)].username,
    }))

    setBombs(newBombs)
    newBombs.forEach((_, i) => triggerBomb(i))

    setMessages((m) => [...m, `🚨 Round ${round} started with ${bombsThisRound} bomb(s)!`])
  }, [round])

  // Go to next round automatically
  useEffect(() => {
    if (bombs.length === 0 && players.filter((p) => !p.eliminated).length > 1) {
      const delay = setTimeout(() => setRound((r) => r + 1), 2000)
      return () => clearTimeout(delay)
    }
  }, [bombs, players])

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 font-orbitron text-center">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">💣 Pi Bomb Pass</h1>
      <p className="mb-4">Round {round}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {players.map((player) => (
          <div
            key={player.username}
            className={`rounded-lg px-4 py-3 ${
              player.eliminated ? 'bg-red-700 text-white/50 line-through' : 'bg-[#1e293b]'
            }`}
          >
            {player.username}
            {bombs.find((b) => b.holder === player.username) && (
              <span className="ml-2 animate-ping text-yellow-400">💣</span>
            )}
          </div>
        ))}
      </div>

      <div className="max-w-md mx-auto bg-[#0f172a] border border-cyan-600 rounded-xl p-4 text-left space-y-1">
        {messages.slice(-5).map((msg, i) => (
          <div key={i} className="text-sm">{msg}</div>
        ))}
      </div>

      {players.filter((p) => !p.eliminated).length === 1 && (
        <div className="mt-10 text-2xl text-green-400 font-bold">
          🏆 {players.find((p) => !p.eliminated)?.username} WINS!
        </div>
      )}
    </main>
  )
}

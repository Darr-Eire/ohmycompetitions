'use client'

import Link from 'next/link'

export default function TryYourLuck() {
  const games = [
    {
      title: '🎯 3.14 Seconds',
      description: 'Tap exactly at 3.14 seconds!',
      href: '/try-your-luck/three-fourteen',
    },
    {
      title: '🎰 Pi Slot Machine',
      description: 'Match 3 Pi symbols to win!',
      href: '/try-your-luck/slot-machine',
    },
    {
      title: '🚀 Launch Pi to the Moon',
      description: 'Time your launch perfectly!',
      href: '/try-your-luck/launch-pi',
    },
    {
      title: '🔒 Hack the Vault',
      description: 'Solve the daily riddle!',
      href: '/try-your-luck/hack-the-vault',
    },
    {
      title: '🎁 Mystery Wheel',
      description: 'Spin the wheel for a bonus!',
      href: '/try-your-luck/mystery-wheel',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-200 to-pink-200 animate-gradient-x p-6">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-blue-700 animate-pulse">🎲 Try Your Luck!</h1>
        <p className="text-lg mt-2 text-gray-700">Play games daily and win Pi prizes!</p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {games.map((game) => (
          <Link
            href={game.href}
            key={game.title}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center space-y-4 transform transition hover:scale-105 hover:shadow-2xl border-2 border-blue-300"
          >
            <h2 className="text-2xl font-bold text-blue-800">{game.title}</h2>
            <p className="text-gray-600 text-center">{game.description}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}


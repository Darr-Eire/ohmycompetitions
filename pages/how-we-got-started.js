'use client'

import Link from 'next/link'

export default function HowWeGotStarted() {
  return (
    <main className="flex justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white border border-blue-200 rounded-2xl shadow-lg p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          🚀 How We Got Started
        </h1>
        <div className="h-1 w-24 bg-blue-300 rounded mb-6" />

        {/* Banner */}
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          <span className="text-gray-400">[ Add a cool banner image here 📸 ]</span>
        </div>

        {/* Story */}
        <div className="space-y-4 text-gray-700">
          <p className="text-lg">Hey Pioneers! 👋</p>

          <p>
            I’ve been mining Pi since way back — <strong>6 years strong!</strong> 🔥 All that
            time I dreamed about building something cool for the Pi community… but there was
            just one problem: I had absolutely <strong>ZERO knowledge</strong> about making apps
            or connecting to the Pi Network. 😅
          </p>

          <p>
            Fast forward to now… after tons of trial and error, late nights, and a whole lotta
            coffee ☕, OhMyCompetitions was born! 🛠️ Built from scratch with love, hustle, and a
            massive passion for Pi.
          </p>

          <p>
            The goal? <span className="font-semibold">Bring the Pi community together</span>.
            <span className="font-semibold">Give back to fellow Pioneers</span>.{' '}
            <span className="font-semibold">Actually use Pi in fun, exciting ways!</span>
          </p>

          <p>
            And this is only the beginning… 🚀💜 Thanks for being part of the journey! Let’s keep
            building the Pi future together! 🌍
          </p>
        </div>

        {/* Optional CTA */}
        <div className="mt-6 text-center">
          <Link
            href="/competitions"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            View Current Competitions
          </Link>
        </div>
      </div>
    </main>
  )
}

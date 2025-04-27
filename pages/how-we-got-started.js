// Small change to trigger rebuild
// pages/how-we-got-started.js
'use client'

import Link from 'next/link'

export default function HowWeGotStarted() {
  return (
    <main className="page p-6 flex flex-col items-center text-center">
      {/* Big page title */}
      <h1 className="text-3xl font-bold mb-6">🚀 How We Got Started</h1>

      {/* Banner Placeholder */}
      <div className="bg-gray-100 border border-dashed border-gray-400 w-full max-w-2xl h-48 flex items-center justify-center mb-8 rounded-lg">
        [ Add a cool banner image here 📸 ]
      </div>

      {/* Story Text */}
      <div className="max-w-2xl text-left space-y-4">
        <p>Hey Pioneers! 👋</p>

        <p>
          I've been mining Pi since way back — <strong>6 years strong!</strong> 🔥
          All that time I dreamed about building something cool for the Pi community...
          but there was just one problem: I had absolutely <strong>ZERO knowledge</strong> about making apps
          or connecting to the Pi Network. 😅
        </p>

        <p>
          Fast forward to now... after tons of trial and error, late nights, and a whole lotta coffee ☕,
          OhMyCompetitions was born! 🛠️ Built from scratch with love, hustle, and a massive passion for Pi.
        </p>

        <p>
          The goal? 👉 Bring the Pi community together. 👉 Give back to fellow Pioneers.
          👉 Actually use Pi in fun, exciting ways!
        </p>

        <p>
          And this is only the beginning... 🚀💜 Thanks for being part of the journey! 
          Let's keep building the Pi future together! 🌍
        </p>
      </div>
    </main>
  )
}

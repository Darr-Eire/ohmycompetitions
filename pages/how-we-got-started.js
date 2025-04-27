// pages/how-we-got-started.js
'use client'

import Link from 'next/link'

export default function HowWeGotStarted() {
  return (
    <main className="page">
      <div className="competition-card">
        {/* Banner */}
        <div className="competition-top-banner">
          🚀 How We Got Started
        </div>

        {/* Divider */}
        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Story */}
        <div className="space-y-6 px-4">
          <p className="text-3xl leading-tight">
            I’ve been mining Pi since way back — <strong>6 years strong!</strong> 🔥<br />
            All that time I daydreamed about pi being something epic for the Pi family…<br />
            but there was one HUGE hiccup: I had zero clue how to code or even talk to the Pi Network. 😅<br />
            Fast forward through endless coffee ☕, late-night “why isn’t this working?!” rants,<br />
            and more trial-and-error than I care to admit… and boom 💥<br />
            <strong>OhMyCompetitions</strong> was born! Crafted from pure hustle,<br />
            passion, and a sprinkle of Pi magic. ✨<br />
            This is just the kickoff, though 🚀💜<br />
            Thanks for riding shotgun on this wild Pi journey — let’s keep co-creating the future together! 🌍
          </p>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <Link
            href="/competitions"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            View Current Competitions
          </Link>
        </div>
      </div>
    </main>
  )
}

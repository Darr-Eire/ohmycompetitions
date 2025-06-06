'use client'

import Link from 'next/link'

export default function VaultProTerms() {
  return (
    <main className="app-background min-h-screen flex flex-col items-center px-4 py-12 text-white">
      <div className="max-w-3xl w-full space-y-6">

        <div className="text-center mb-6">
          <h1 className="title-gradient text-3xl font-bold">
            Pi Vault Terms & Conditions
          </h1>
        </div>

        <section className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 space-y-6">

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Overview</h2>
            <p>
              Pi Vault is a competitive skill-based mini-game hosted by OhMyCompetitions, allowing participants to attempt cracking a 4-digit vault code for a prize of <strong>5000 π</strong> per day.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Eligibility</h2>
            <p>
              Open to all verified OhMyCompetitions platform users ("Pioneers"). Players must have an active Pi wallet connected to their account. Multiple accounts or wallet abuse is prohibited.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Gameplay Rules</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>1 Free Daily Attempt (resets at UTC midnight).</li>
              <li>1 Paid Attempt per day (cost: <strong>1 π</strong>).</li>
              <li>Attempts cannot be carried over to future days.</li>
              <li>1 Retry allowed after failure (cost: <strong>1 π</strong>).</li>
              <li>Vault code is randomized daily with 4 digits (0-9).</li>
              <li>Correct digits are visually revealed after failure.</li>
            </ul>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Prize Pool & Payout</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Daily Vault Prize: <strong>5000 π</strong>.</li>
              <li>First Pioneer to open vault wins the daily prize.</li>
              <li>Prize credited directly to winner’s Pi wallet.</li>
              <li>If no winner, prize resets at midnight UTC.</li>
            </ul>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Fair Play & Anti-Cheat</h2>
            <p>
              Use of automation, scripts, bots, or unfair methods is strictly prohibited. Violations may result in disqualification, forfeiture, and account suspension.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Leaderboard Display</h2>
            <p>
              Recent winners will be displayed publicly for transparency. Display names may be shown.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Platform Rights</h2>
            <p>
              OhMyCompetitions reserves the right to modify prize pools, adjust mechanics, suspend access, or update Terms & Conditions when necessary.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Liability</h2>
            <p>
              OhMyCompetitions is not responsible for network errors, wallet issues, or user-side technical malfunctions. All gameplay actions are final once submitted.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Governing Law</h2>
            <p>
              This game operates under applicable jurisdictional regulations related to skill gaming, competitions, and cryptocurrency platforms.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Acceptance</h2>
            <p>
              By participating in The Pi Vault, you acknowledge and accept these Terms & Conditions.
            </p>
          </div>

        </section>

        <Link href="/try-your-luck" className="text-sm text-cyan-300 underline mt-4 mx-auto block text-center">
           Back to Mini Games
        </Link>

      </div>
    </main>
  )
}

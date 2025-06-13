'use client';

import Link from 'next/link';

export default function FreeCompTerms() {
  return (
    <main className="app-background min-h-screen flex flex-col items-center px-4 py-12 text-white">
      <div className="max-w-3xl w-full space-y-6">

        <div className="text-center mb-6">
          <h1 className="title-gradient text-3xl font-bold">
            Free Entry Competition Terms & Conditions
          </h1>
        </div>

        <section className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 space-y-6">

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Overview</h2>
            <p>
              Our Free Entry Competitions allow verified users to participate at zero cost for a chance to win exciting prizes. Participation is limited to one free ticket per competition per user.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Eligibility</h2>
            <p>
              Open to all verified OhMyCompetitions platform users ("Pioneers") who have completed account verification. Multiple accounts, duplicate entries, or account abuse are strictly prohibited.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Entry Rules</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>One (1) free ticket claim allowed per Pioneer, per competition.</li>
              <li>To earn additional tickets, Pioneers may refer other users using their personal referral link.</li>
              <li>Each valid referral equals one (1) bonus ticket per new verified account.</li>
              <li>Referral abuse or fraudulent invites are prohibited and may void eligibility.</li>
            </ul>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Prize Pool & Winner Selection</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Prizes will be displayed clearly for each competition prior to entry.</li>
              <li>Winners will be selected at random from all valid entries after the countdown ends.</li>
              <li>Winners are notified directly and may be publicly displayed in the winners list.</li>
              <li>Prizes are non-transferable and credited to the winner’s Pi wallet.</li>
            </ul>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Anti-Fraud & Fair Play</h2>
            <p>
              Automated bots, fake accounts, or any method that manipulates the fairness of the competition is strictly prohibited. Offenders may be banned from all future competitions.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Referral Program Policy</h2>
            <p>
              Referrals must be genuine new users who complete registration via your personal referral link. System audits are conducted regularly to maintain program integrity.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Platform Rights</h2>
            <p>
              OhMyCompetitions reserves the right to update terms, modify prizes, or cancel competitions in cases of technical issues, abuse, or regulatory compliance.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Liability Disclaimer</h2>
            <p>
              OhMyCompetitions is not responsible for technical failures, internet connectivity, or personal device issues that may prevent participation.
            </p>
          </div>

          <div>
            <h2 className="title-gradient text-center text-2xl font-bold mb-2">Acceptance of Terms</h2>
            <p>
              By claiming your free entry or participating via referrals, you fully agree to these Terms & Conditions.
            </p>
          </div>

        </section>

        <Link href="/" className="text-sm text-cyan-300 underline mt-4 mx-auto block text-center">
           Back to Home
        </Link>

      </div>
    </main>
  )
}

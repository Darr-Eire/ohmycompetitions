'use client'

import Link from 'next/link'

export default function TermsConditions() {
  return (
    <main className="page">
      <div className="competition-card max-w-3xl w-full">

        {/* Title Banner */}
        <div className="competition-top-banner text-center">
          📜 Terms &amp; Conditions
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-left text-gray-700">

          <p>
            Welcome to OhMyCompetitions! By participating in our competitions, you fully agree to these Terms &amp; Conditions:
          </p>

          <h2 className="font-semibold text-blue-600 mt-6">1. Eligibility</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Entrants must be at least 18 years old or meet the age of majority in their country.</li>
            <li>Entries are only valid if made through OhMyCompetitions via Pi Network login.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">2. Entries &amp; Fees</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Some competitions may be free, others may require a small Pi entry fee.</li>
            <li>Fees are final and non-refundable once a ticket is purchased.</li>
            <li>Entries are personal and cannot be transferred or resold.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">3. Winner Selection</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Winners are selected fairly using random draws or specified skill-based criteria.</li>
            <li>Winners will be contacted via their registered Pi account or email.</li>
            <li>Failure to claim a prize within 7 days may result in forfeiture.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">4. Prizes</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Prizes are non-transferable and cannot be exchanged for cash unless stated.</li>
            <li>We reserve the right to substitute a prize with one of equal or greater value if needed.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">5. Limitation of Liability</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>OhMyCompetitions is not liable for lost entries, technical issues, or failure of Pi transactions.</li>
            <li>Participation is at your own risk; we are not responsible for any losses incurred.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">6. Data Usage</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Basic account data may be collected solely for competition operations.</li>
            <li>We do not sell, rent, or distribute user data to third parties.</li>
            <li>View our <Link href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</Link> for full details.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">7. Compliance with Pi Network</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>All activities comply with Pi Network’s App Developer Guidelines and Pi policies.</li>
            <li>Competitions and payments may be subject to Pi Network’s ongoing ecosystem terms.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">8. Changes to Terms</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>We reserve the right to amend these Terms &amp; Conditions at any time.</li>
            <li>Changes become effective immediately upon posting on this website.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">9. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at <span className="text-blue-600">ohmycompetitions@gmail.com</span>.</p>

          {/* Back Home Button */}
          <div className="text-center mt-8">
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded">
                ← Back to Home
              </button>
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}


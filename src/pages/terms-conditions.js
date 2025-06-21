'use client'

import Link from 'next/link'

export default function TermsConditions() {
  return (
    <main className="page text-white">
      <div className="competition-card max-w-3xl w-full mx-auto">

        {/* Title Banner */}
  <div className="competition-top-banner text-center text-xl sm:text-2xl font-bold my-4 !text-cyan-300">
  Terms &amp; Conditions
</div>



        {/* Body */}
        <div className="p-6 space-y-6 text-center">

          <p>
            Welcome to OhMyCompetitions! By participating in our competitions and games, you fully agree to these Terms &amp; Conditions:
          </p>

          {/* Section Template */}
          {[
            {
              title: '1. Eligibility',
              points: [
                'Participants must be 18 years or older or meet their country’s legal age of majority.',
                'All entries must be made via OhMyCompetitions through Pi Network login.'
              ]
            },
            {
              title: '2. Entries & Fees',
              points: [
                'Some games are free to enter, while others require a Pi entry fee or retry token.',
                'All payments are final and non-refundable.',
                'Entries are non-transferable and may not be sold or exchanged.'
              ]
            },
            {
              title: '3. General Winner Selection',
              points: [
                'Winners are selected via random draws, automated skill-based systems, or performance criteria depending on the game or competition.',
                'Winners must respond within the claim period or risk forfeiting the prize.'
              ]
            },
            {
              title: '4. Prizes',
              points: [
                'All prizes are paid in Pi unless otherwise stated.',
                'Prizes cannot be exchanged for cash unless explicitly offered.',
                'We may substitute prizes of equal or higher value if necessary.'
              ]
            },
            {
              title: '5. Limitation of Liability',
              points: [
                'We are not liable for lost entries, system errors, or failed Pi transactions.',
                'Participation is at your own risk. We are not responsible for personal losses.'
              ]
            },
            {
              title: '6. Data Usage',
              points: [
                'We collect basic Pi account data for identification and prize delivery only.',
                'We never sell or share user data with third parties.',
                'See our ',
                <Link key="privacy" href="/privacy-policy" className="text-blue-400 underline">Privacy Policy</Link>,
                ' for details.'
              ]
            },
            {
              title: '7. Compliance with Pi Network',
              points: [
                'All activities comply with Pi Network App Developer Guidelines.',
                'Prizes and mechanics are subject to Pi Network\'s evolving ecosystem rules.'
              ]
            },
      
            {
              title: '9. Pi Cash Code',
              points: [
                'Each week’s challenge includes a visible code and a limited claim period.',
                'Winners must submit the correct code within the designated claim time (31 min 4 sec).',
                'If not claimed, the prize rolls over and doubles.'
              ]
            },
            {
              title: '10. Pi Battles',
              points: [
                'Two or more players compete for a winner-takes-all Pi prize.',
                'OhMyCompetitions takes a small % fee from the total pool.',
                'Gameplay may include tap challenges, reaction speed, or decision-making games.'
              ]
            },
            {
              title: '11. Hack the Vault',
              points: [
                'Players guess a secret code to open the Pi Vault.',
                'Each attempt may cost Pi or be limited to a number of daily guesses.',
                'The vault resets once cracked, with new prizes available.'
              ]
            },
            {
              title: '12. Match the Pi Code',
              points: [
                'Players must match a rapidly scrolling Pi digit sequence with perfect timing.',
                'Retrying for prizes may cost Pi.',
                'Jackpot rounds offer boosted rewards for streaks or perfect matches.'
              ]
            },
            {
              title: '13. Competitions',
              points: [
                'Each competition may have unique rules or entry methods (free or paid).',
                'Time-sensitive entries, especially daily or weekly ones, close at the stated time.',
                'Winners are chosen fairly based on the stated draw or judging criteria.'
              ]
            },
            {
              title: '14. Changes to Terms',
              points: [
                'We reserve the right to update these Terms &amp; Conditions at any time.',
                'Changes are effective immediately upon posting.'
              ]
            }
          ].map((section, index) => (
            <div key={index}>
              <h2 className="font-semibold text-cyan-300 mt-6">{section.title}</h2>
              <ul className="list-disc list-inside mt-2 text-white text-left max-w-xl mx-auto">
                {section.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <h2 className="font-semibold text-blue-400 mt-6">15. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please email us at{' '}
            <span className="text-blue-400">ohmycompetitions@gmail.com</span>.
          </p>

          {/* Back Home Button */}
          <div className="text-center mt-8">
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded">
                Back to Home
              </button>
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}

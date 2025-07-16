'use client';

import Link from 'next/link';

export default function TermsConditions() {
  return (
    <main className="page text-white">
      <div className="competition-card max-w-3xl w-full mx-auto">

        {/* Title */}
        <div className="competition-top-banner text-center text-xl sm:text-2xl font-bold my-4 !text-cyan-300">
          Terms &amp; Conditions
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-center">

          <p>
            Welcome to OhMyCompetitions! By participating in our competitions and games, you fully agree to these Terms &amp; Conditions:
          </p>

          {[
            {
              title: '1. Eligibility',
              points: [
                'Participants must be 18 years or older or meet their country’s legal age of majority.',
                'Certain countries may be restricted from participating due to local laws. You are responsible for complying with your local regulations before participating.',
                'All entries must be made via OhMyCompetitions through Pi Network login.'
              ]
            },
            {
              title: '2. Country Restrictions',
              points: [
                'We do not allow participation from jurisdictions where competitions or games of chance are prohibited.',
                'Participants from countries with embargoes or sanctions imposed by the EU, US, UK, or UN are not eligible.'
              ]
            },
            {
              title: '3. Entries & Fees',
              points: [
                'Some games are free to enter, while others require a Pi entry fee or retry token.',
                'All payments are final and non-refundable.',
                'Entries are non-transferable and may not be sold or exchanged.',
                'We reserve the right to verify eligibility and disqualify participants found violating terms.'
              ]
            },
            {
              title: '4. General Winner Selection',
              points: [
                'Winners are selected via random draws, automated skill-based systems, or performance criteria depending on the game or competition.',
                'Winners must respond within the claim period or risk forfeiting the prize.',
                'We may request proof of identity and eligibility before awarding prizes.'
              ]
            },
            {
              title: '5. Prizes & Value in Pi',
              points: [
                'All prizes are paid in Pi unless explicitly stated otherwise.',
                'Selected prizes may be offered as a Pi-equivalent value, and can be redeemed in Pi or for an agreed alternative.',
                'Prizes cannot be exchanged for cash unless explicitly offered.',
                'We reserve the right to substitute prizes of equal or higher value if necessary.',
                'Prizes may be subject to tax or reporting requirements in your jurisdiction; participants are responsible for any applicable taxes.'
              ]
            },
            {
              title: '6. Limitation of Liability',
              points: [
                'We are not liable for lost entries, system errors, or failed Pi transactions.',
                'Participation is at your own risk. We are not responsible for any indirect, incidental, or consequential damages.',
                'OhMyCompetitions does not guarantee uninterrupted access to the app or competition pages.'
              ]
            },
            {
              title: '7. Data Usage & Privacy',
              points: [
                'We collect and use personal data strictly for identification, account verification, and prize fulfillment purposes.',
                'Data is stored securely and handled in accordance with GDPR, local privacy regulations, and our internal privacy policies.',
                'Your data will never be sold or shared with third-party advertisers without explicit consent.',
                <>
                  Please refer to our{' '}
                  <Link href="/privacy-policy" className="text-blue-400 underline">
                    Privacy Policy
                  </Link>{' '}
                  for comprehensive details on how we handle your data.
                </>
              ]
            },
            {
              title: '8. Compliance with Pi Network',
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
                'OhMyCompetitions may take a small % fee from the total pool.',
                'Gameplay may include tap challenges, reaction speed, or decision-based mini games.'
              ]
            },
            {
              title: '11. Hack the Vault',
              points: [
                'Players guess a secret code to open the Pi Vault.',
                'Each attempt may cost Pi or be limited to a number of daily guesses.',
                'The vault resets once cracked, with new prizes added.'
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
              title: '13. Competitions & Launch Week',
              points: [
                'Launch week competitions are 0 profit to build trust and support the community.',
                'We aim to showcase real winners and build a transparent reputation within the Pi community.',
                'Future competitions will include a wide range of categories and themes for all interests.',
                'Competitions may include both free entry options and paid Pi entry options, depending on the event type.',
                'All prizes are primarily awarded in Pi; however, in certain cases, prizes may be provided as the equivalent value in Pi to allow flexibility or for fulfillment reasons.',
                'Entries are time-limited and must be submitted before the stated deadlines. Late entries will not be accepted under any circumstances.',
                'All entries are final, and participation implies full acceptance of the competition-specific rules and these Terms & Conditions.',
                'We reserve the right to modify, suspend, or cancel competitions at our discretion to maintain fairness and integrity.'
              ]
            },
            {
              title: '14. Changes to Terms',
              points: [
                'We reserve the right to update these Terms & Conditions at any time.',
                'Changes are effective immediately upon posting and continued participation implies acceptance.'
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
  );
}

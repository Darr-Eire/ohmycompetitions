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
              title: '1. Decentralized Platform',
              points: [
                'OhMyCompetitions is a decentralized application (dApp) built for the Pi Network.',
                'There is no central company or legal entity behind the platform. It is community-powered and Pi-native.',
                'By using this platform, you acknowledge the risks and responsibilities associated with decentralized technologies.'
              ]
            },
            {
              title: '2. Pi-Only Economy',
              points: [
                'All entries, prizes, and transactions are exclusively in Pi cryptocurrency.',
                'We do not accept or facilitate any fiat currency (USD, EUR, GBP, etc.).',
                'Any mention of prize value is indicative and not a fiat or cash guarantee.'
              ]
            },
            {
              title: '3. Finality of Pi Transactions',
              points: [
                'All Pi transactions are final and cannot be reversed.',
                'We are not liable for mistakes in wallet input or transaction issues.',
                'You are responsible for verifying your details before submitting any entry or payment.'
              ]
            },
            {
              title: '4. Eligibility',
              points: [
                'Participants must be 18 years or older or meet their country’s legal age of majority.',
                'Certain countries may be restricted due to local laws. It is your responsibility to comply.',
                'All entries must be made via OhMyCompetitions through Pi Network login.'
              ]
            },
            {
              title: '5. Country Restrictions',
              points: [
                'We do not allow participation from jurisdictions where competitions or games of chance are prohibited.',
                'Participants from embargoed or sanctioned countries (EU, US, UK, UN) are not eligible.'
              ]
            },
            {
              title: '6. Entries & Fees',
              points: [
                'Some games are free to enter, others require a Pi entry fee or retry token.',
                'All payments are final and non-refundable.',
                'Entries are non-transferable and cannot be sold or exchanged.',
                'We reserve the right to verify eligibility and disqualify users who breach rules.'
              ]
            },
            {
              title: '7. General Winner Selection',
              points: [
                'Winners are selected by random draw, skill-based logic, or competition performance.',
                'Winners must respond within the claim period or risk forfeiting the prize.',
                'We may request proof of identity or eligibility before awarding prizes.'
              ]
            },
            {
              title: '8. Prizes & Value in Pi',
              points: [
                'All prizes are paid in Pi unless explicitly stated otherwise.',
                'Some items may be given as Pi-equivalent digital rewards.',
                'Prizes cannot be redeemed for fiat or external value unless clearly offered.',
                'Taxes, duties, or local regulations are the user’s responsibility.'
              ]
            },
            {
              title: '9. Limitation of Liability',
              points: [
                'We are not liable for lost entries, failed wallet transactions, or platform errors.',
                'Use of this dApp is at your own risk. No guarantee of uptime or performance is given.',
                'We are not responsible for any indirect, incidental, or consequential loss.'
              ]
            },
            {
              title: '10. Data Usage & Privacy',
              points: [
                'We collect and use minimal personal data strictly for verification and prize distribution.',
                'Your data will never be sold or shared with advertisers.',
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
              title: '11. Compliance with Pi Network',
              points: [
                'OhMyCompetitions follows the Pi Network Developer Guidelines.',
                'All features and competitions operate within Pi Network’s evolving ecosystem.'
              ]
            },
            {
              title: '12. Pi Cash Code',
              points: [
                'Each week’s challenge includes a visible code and a limited claim period.',
                'Winners must submit the correct code within the designated time (31 min 4 sec).',
                'If not claimed, the prize rolls over and doubles.'
              ]
            },
            {
              title: '13. Pi Battles',
              points: [
                'Two or more players compete for a winner-takes-all Pi prize.',
                'OhMyCompetitions may take a small % fee from the prize pool.',
                'Gameplay may include tap battles, reaction speed, or skill-based games.'
              ]
            },
            {
              title: '14. Hack the Vault',
              points: [
                'Players guess a secret code to open the Pi Vault.',
                'Each guess may cost Pi or be limited daily.',
                'The vault resets once cracked with new prizes added.'
              ]
            },
            {
              title: '15. Match the Pi Code',
              points: [
                'Players match a fast-moving Pi digit sequence with perfect timing.',
                'Retrying may cost Pi.',
                'Jackpot rounds offer boosted rewards for streaks or perfect hits.'
              ]
            },
            {
              title: '16. Competitions & Launch Week',
              points: [
                'Launch week competitions are 0 profit — to build trust and community.',
                'Real winners will be publicly showcased.',
                'We offer both free and paid competitions across many themes.',
                'Prizes are awarded in Pi or Pi-equivalent items where appropriate.',
                'All entries must be submitted before the posted deadline.',
                'All participation implies full acceptance of these terms.',
                'We may modify, pause, or cancel events to ensure fairness.'
              ]
            },
            {
              title: '17. Changes to Terms',
              points: [
                'We reserve the right to change these Terms & Conditions at any time.',
                'Updates are effective immediately once posted.',
                'Continued use of the app means you accept the latest version.'
              ]
            },
            {
              title: '18. Contact Us',
              points: [
                <>
                  For help, support, or questions, email{' '}
                  <span className="text-blue-400">ohmycompetitions@gmail.com</span> or message us via Pi usernames:{' '}
                  <span className="text-cyan-300">darreire2020</span> and{' '}
                  <span className="text-cyan-300">Lyndz2020</span>.
                </>
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

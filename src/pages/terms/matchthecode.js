'use client';

import Link from 'next/link';

export default function MatchPiTermsPage() {
  return (
    <main className="min-h-screen px-6 py-12 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl bg-[#1e293b]/60 shadow-[0_0_30px_#00fff055] p-8 backdrop-blur-md">
        <h1 className="text-3xl font-bold text-cyan-300 mb-6 text-center">
          Match The Pi Code – Terms & Conditions
        </h1>

        <section className="space-y-4 text-sm leading-relaxed">
         

          <p>
            By entering the <strong>Match the Pi Code</strong> challenge on <strong>Oh My Competitions</strong>, you confirm your agreement to the following rules. These terms are designed to keep the game fair, secure and enjoyable for everyone.
          </p>

          <ol className="list-decimal list-inside space-y-3">
            <li>
              <strong>Eligibility:</strong> You must be logged in with a verified Pi Network account. Duplicate, fake, or inactive accounts will be blocked.
            </li>
            <li>
              <strong>One Free Daily Try:</strong> You get one free attempt every 24 hours. No resets, no manual refreshes.
            </li>
            <li>
              <strong>Skill Check Required:</strong> You must answer a simple question before starting. This is a legal requirement and cannot be skipped.
            </li>
            <li>
              <strong>How to Win:</strong> Match each digit in sequence to perfectly recreate the first 8 digits of π (3.1415926). Stop the spinner on each digit at the right time. Hit all 8 to win.
            </li>
            <li>
              <strong>Jackpot Mode:</strong> A rare multiplier event may trigger. If active, the reward is doubled automatically. No action is needed to activate it.
            </li>
            <li>
              <strong>Prize:</strong> Standard prize is <strong>50π</strong>. Jackpot reward is <strong>100π</strong>. Additional bonuses may apply for perfect accuracy.
            </li>
            <li>
              <strong>Payouts:</strong> Pi is sent directly to your wallet via the Pi SDK. Tampering, multiple logins, or fake attempts will result in permanent disqualification and loss of all rewards.
            </li>
            <li>
              <strong>Retries:</strong> After your free attempt, you may retry up to 5 times per day by paying <strong>1π</strong> per attempt. All payments are final.
            </li>
            <li>
              <strong>Abuse Protection:</strong> Any suspicious activity, automation, or attempts to manipulate the system will lead to a permanent ban and report to the Pi Network moderators.
            </li>
            <li>
              <strong>SDK & Technical Limits:</strong> Oh My Competitions is not responsible for SDK failures, network issues, or device-related bugs. All usage is at your own risk.
            </li>
            <li>
              <strong>Updates:</strong> These rules can change at any time without notice. By playing, you agree to the current terms in effect at the time of your attempt.
            </li>
          </ol>
 <p><strong>Last Updated:</strong> August 3, 2025</p>
          <p>
            For support, payout issues, or general feedback, contact us through the app or via our official Pi Network channels. We're here to help real pioneers win real rewards.
          </p>
        </section>

        <div className="mt-8 text-center">
          <Link href="/try-your-skill/three-fourteen" className="text-cyan-300 underline">
             Back to Match The Pi Code
          </Link>
        </div>
      </div>
    </main>
  );
}

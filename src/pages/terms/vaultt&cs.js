'use client';

import Link from 'next/link';

export default function VaultProTermsPage() {
  return (
    <main className="min-h-screen px-6 py-12 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl bg-[#1e293b]/60 shadow-[0_0_30px_#00fff055] p-8 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-cyan-300 mb-6 text-center">
         OMC Hack The Vaults Terms & Conditions
        </h1>

        <section className="space-y-4 text-sm leading-relaxed">
         

          <p>
            By playing <strong>Hack the Vault</strong> on <strong>Oh My Competitions</strong>, you agree to the following terms. These are in place to keep the game secure, fair and enjoyable for every pioneer.
          </p>

          <ol className="list-decimal list-inside space-y-3">
            <li>
              <strong>Eligibility:</strong> You must be logged in with your verified Pi Network account. Fake, inactive, or duplicate accounts will be blocked.
            </li>
            <li>
              <strong>One Free Attempt Daily:</strong> Every user gets 1 free attempt every 24 hours. No resets. No exceptions.
            </li>
            <li>
              <strong>Skill Check:</strong> To keep it fair and legal, you must correctly answer a simple question before trying to unlock the vault.
            </li>
            <li>
              <strong>Winning:</strong> If your 4-digit code is an exact match, you win the full prize instantly — no splits, no delays.
            </li>
            <li>
              <strong>Prize Pool:</strong> The current reward is <strong>50π</strong>. This amount may increase or decrease based on events, funding, or promotional activity.
            </li>
            <li>
              <strong>Payouts:</strong> Winners are paid directly to their Pi wallet through secure API integration. Attempted abuse, automation, or manipulation will result in a permanent ban and forfeiture of winnings.
            </li>
            <li>
              <strong>Retry System:</strong> If your first try fails, you may get a second attempt. This is limited to one retry and may be changed or removed at any time.
            </li>
            <li>
              <strong>Cheating & Abuse:</strong> We operate a zero-tolerance policy. Any suspicious activity, bot use, or manipulation will lead to an instant blacklist and report to the Pi Network.
            </li>
            <li>
              <strong>No Liability:</strong> We are not responsible for Pi SDK failures, network delays or issues on your device. Use the game at your own risk.
            </li>
            <li>
              <strong>Terms Can Change:</strong> We may update these terms without notice. By continuing to use the game, you agree to any changes made.
            </li>
          </ol>
<p><strong>Last Updated:</strong> August 3, 2025</p>
          <p>
            For support, issues, or general questions, reach out via the app or message us directly through our official Pi Network channels. We’re here to help.
          </p>
        </section>

        <div className="mt-8 text-center">
          <Link href="/try-your-luck" className="text-cyan-300 underline">
            Back to Hack the Vault
          </Link>
        </div>
      </div>
    </main>
  );
}

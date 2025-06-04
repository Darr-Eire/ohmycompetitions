'use client';

import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-[#0b1120] text-white px-6 py-12 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 text-cyan-400 text-center">
  PlayStation 5 Giveaway<br />Terms & Conditions
</h1>


      <section className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <p>
          By entering the PlayStation 5 Giveaway (&quot;Giveaway&quot;), you agree to comply with and be bound by these Terms and Conditions. Please read them carefully.
        </p>

        <h2 className="text-xl font-semibold text-black"> Eligibility</h2>
        <p>
          The Giveaway is open exclusively to registered Pioneers of the Pi Network who hold an active Pi wallet. Participants must be aged 18 years or older. Employees, affiliates, and family members of Oh My Competitions are not eligible to enter.
        </p>

        <h2 className="text-xl font-semibold text-black"> Entry and Currency</h2>
        <p>
          Entries can only be submitted via the Oh My Competitions platform using Pi cryptocurrency (π). No fiat currency or other cryptocurrencies are accepted for entry fees. All entries must be paid in Pi to qualify.
        </p>

        <h2 className="text-xl font-semibold text-black"> How to Enter</h2>
        <p>
          Entries must be submitted by purchasing tickets using your Pi wallet through the Oh My Competitions platform. Multiple entries are allowed. Entry fees are non-refundable.
        </p>

        <h2 className="text-xl font-semibold text-black"> Giveaway Period</h2>
        <p>
          The Giveaway starts on [Start Date] and ends on June 14, 2025 at 3:14 PM UTC. Entries received after the end time will not be considered.
        </p>

        <h2 className="text-xl font-semibold text-black"> Prize</h2>
        <p>
          One winner will receive a PlayStation 5 console and an extra controller as described on the competition page. No cash alternatives or substitutions will be provided.
        </p>

        <h2 className="text-xl font-semibold text-black"> Winner Selection and Notification</h2>
        <p>
          The winner will be selected at random from all valid entries received during the Giveaway period. The winner will be notified via their registered contact details within 7 days after the Giveaway ends.
        </p>

        <h2 className="text-xl font-semibold text-black"> Privacy</h2>
        <p>
          Personal data collected during the Giveaway will be used solely for the purposes of administering the Giveaway and contacting winners, in accordance with our Privacy Policy.
        </p>

        <h2 className="text-xl font-semibold text-black"> Liability</h2>
        <p>
          Oh My Competitions is not responsible for any technical issues, lost entries, or unauthorized access during the Giveaway. Participation is at your own risk.
        </p>

        <h2 className="text-xl font-semibold text-black"> General Terms</h2>
        <p>
          Oh My Competitions reserves the right to cancel, modify, or suspend the Giveaway if any fraud, technical failure, or other factor beyond its control impairs the fairness of the Giveaway.
        </p>

        <h2 className="text-xl font-semibold text-black"> Governing Law</h2>
        <p>
          These Terms and Conditions are governed by and construed in accordance with the laws of Ireland. Any disputes will be subject to the exclusive jurisdiction of the Irish courts.
        </p>
  <div className="max-w-screen-md mx-auto px-4 py-8 flex justify-center">
  <Link href="/homepage" legacyBehavior>
    <a className="btn-gradient inline-block text-sm px-3 py-1 rounded-md">
      Back To Competition
    </a>
  </Link>
</div>

  


      </section>
    </main>
  );
}

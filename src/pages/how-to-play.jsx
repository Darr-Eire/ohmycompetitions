'use client'

import Link from 'next/link'
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaDiscord,
} from 'react-icons/fa'

export default function HowToPlay() {
  return (
    <main className="app-background min-h-screen flex justify-center px-4 text-white">
      <div className="competition-card max-w-3xl w-full bg-white bg-opacity-10 rounded-2xl shadow-lg">
        
        {/* Header */}
        <div className="competition-top-banner title-gradient text-white text-center py-5 text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">
          How to Play & Win
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 text-sm sm:text-base leading-relaxed">

          {/* Intro */}
          <p className="text-white/90 text-center">
             Welcome to <span className="font-semibold text-white">OhMyCompetitions</span> — the ultimate Pi-powered platform where your entries could win real rewards every single day.
          </p>

          {/* Step 1 */}
          <section>
            <h2 className="text-lg font-bold gradient-text mb-3"> Step 1: Log In & Secure Your Account</h2>
            <ul className="list-disc list-inside space-y-3 text-white/90">
              <li>Go to <strong>ohmycompetitions.com</strong> or open the app(must be within the pi browser).</li>
              <li>Click <strong>Login</strong> in the top right corner.</li>
              <li>Select <strong>“Login with Pi”</strong> and approve the request in the Pi Browser.</li>
              <li>Once logged in, your wallet is connected and ready to go.</li>
            </ul>
          </section>

          {/* Step 2 */}
          <section>
            <h2 className="text-lg font-bold gradient-text mb-3"> Step 2: Enter Competitions</h2>
            <ul className="list-disc list-inside space-y-3 text-white/90">
              <li>Browse live, upcoming, or themed competitions on the homepage.</li>
              <li>Click any competition card to view details like prize, draw time, tickets, and fee.</li>
              <li>Click <strong>“Enter Now”</strong> and choose how many tickets to buy.</li>
              <li>Confirm payment using your Pi wallet once complete, your entry is locked and shown in your account.</li>
            </ul>
          </section>

          {/* Step 3 */}
          <section>
            <h2 className="text-lg font-bold gradient-text mb-3">Step 3: Track Entries</h2>
            <ul className="list-disc list-inside space-y-3 text-white/90">
              <li>Go to <strong>My Account → My Tickets</strong> to track your competitions.</li>
              <li>See your tickets, draw dates, and competition status.</li>
              <li>Check ticket history and winning status any time.</li>
            </ul>
          </section>

          {/* Step 4 */}
        <section>
  <h2 className="text-lg font-bold gradient-text mb-3"> Step 4: Pi Cash Code</h2>
  <ul className="list-disc list-inside space-y-4 text-white/90">
    <li>
      <strong>Pi Cash Code:</strong> Every day, a secret Pi Cash Code is hidden across the site. Find it and enter it to unlock bonus Pi or extra tickets — no entry fee required.
    </li>
    <li>
      New codes are revealed daily and remain active for <strong>exactly 31 hours and 4 minutes</strong>. Miss it, and the prize resets so don’t delay!
    </li>
    <li>
      Codes drop across our site, Discord, and social media. Stay sharp every code is a fresh chance to win.
    </li>
  </ul>

</section>


          {/* Step 5 */}
          <section>
            <h2 className="text-lg font-bold gradient-text mb-3"> Step 5: Win & Claim Prizes</h2>
            <ul className="list-disc list-inside space-y-3 text-white/90">
              <li>Each competition has a visible countdown to draw time.</li>
              <li>Winners are picked instantly via our random & fair draw system.</li>
              <li>You’ll receive an in-app alert (and email if subscribed) when you win.</li>
              <li>Prizes are sent as Pi (instantly) or delivered physically for real-world items.</li>
            </ul>
          </section>

          {/* Trust */}
          <section>
            <h2 className="text-lg font-bold gradient-text mb-3"> Fair Play & Transparency</h2>
            <ul className="list-disc list-inside space-y-3 text-white/90">
              <li>Every draw is timestamped, logged, and verifiable.</li>
              <li>No bots. No manipulation. One account = one chance per draw.</li>
              <li>All transactions are processed through the official Pi SDK.</li>
            </ul>
          </section>

          {/* Support */}
          <section className="text-center">
            <h2 className="text-lg font-semibold gradient-text mb-2"> Need Help?</h2>
            <p className="text-white/90">
              Visit our <Link href="/help-support" className="gradient-text underline font-semibold">Help & Support</Link> center available 24/7.
            </p>
          </section>

          {/* Social */}
          <section className="text-center">
            <h2 className="text-lg font-semibold gradient-text mt-8 mb-3">🌍 Stay Connected</h2>
            <p className="text-white/80 mb-2">Follow us for surprise codes, announcements and exclusive giveaways</p>
            <div className="flex justify-center space-x-5 mb-4">
              {[FaTwitter, FaFacebookF, FaInstagram, FaDiscord].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-300 transition"
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="text-center mt-10">
            <Link href="/competitions/live-now">
              <span className="inline-block bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl shadow hover:bg-cyan-400 transition text-lg">
                View Live Competitions
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

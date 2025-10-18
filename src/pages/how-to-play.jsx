// src/pages/how-to-play.jsx
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
    <main className="relative min-h-screen text-white">
      {/* soft background + glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0a1222]" />
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[1100px] aspect-square rounded-full blur-[140px] opacity-25"
          style={{ background: 'radial-gradient(50% 50% at 50% 50%, #22d3ee66 0%, transparent 60%)' }}
        />
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-12">
        {/* Header / hero card */}
<div className="rounded-3xl border border-cyan-500/40 bg-white/[0.04] backdrop-blur-md shadow-[0_0_50px_rgba(34,211,238,0.25)] overflow-hidden">
  <div className="competition-top-banner title-gradient text-center py-6">
    <h2 className="text-2xl font-bold text-black">How to Play</h2>
    <p className="mt-2 text-sm sm:text-base text-black px-4">
      Welcome to <span className="font-semibold text-black">Oh My Competitions</span>
    </p>
  </div>
          {/* Steps / timeline */}
          <div className="p-6 sm:p-8">
            <ol className="relative border-s border-white/10 pl-6 space-y-7">
              {/* Step 1 */}
              <li className="relative">
          
                <h2 className="text-lg font-bold gradient-text mb-3">Log In & Secure Your Account</h2>
                <GlassList items={[
                  'Go to ohmycompetitions.com or open the app (must be within the Pi Browser).',
                  'Click Login in the top right corner.',
                  'A pop-up will appear where you can choose to Sign up (optional referral) or Log in if you’re a returning user.',
                  'Select “Login with Pi” and approve the request in the Pi Browser.',
                  'Once logged in, your wallet is connected and ready to go.',
                ]}/>
              </li>

              {/* Step 2 */}
              <li className="relative">
       
                <h2 className="text-lg font-bold gradient-text mb-3">Enter Competitions</h2>
                <GlassList items={[
                  'Browse live, upcoming or themed competitions on the homepage.',
                  'Click on more details on the competition card to view details like prize, draw time, tickets and fee.',
                  'Click “Proceed to Payment” and choose how many tickets to buy.',
                  'You must enter a skill question before making the purchase',
                  'Confirm payment using your Pi wallet. Once complete, your entry is locked and shown in your account.',
                ]}/>
              </li>

              {/* Step 3 */}
              <li className="relative">
          
                <h2 className="text-lg font-bold gradient-text mb-3">Step 3: Track Entries</h2>
                <GlassList items={[
                  'Go to My Account → My Tickets to track your competitions.',
                  'See your tickets, draw dates and competition status.',
                  'Check ticket history and winning status any time.',
                ]}/>
              </li>

              {/* Step 4 (Pi Cash Code) */}
              <li className="relative">
    
                <h2 className="text-lg font-bold gradient-text mb-3">Step 4: Pi Cash Code</h2>
                <GlassList items={[
                  'Pi Cash Code: Every day, a secret Pi Cash Code is hidden and is only shown for alimited time. see it, keep it safe and enter it if picked to unlock the pi cash code.',
                  'New codes are revealed daily and remain active for exactly 31 hours and 4 minutes.',
                  'Codes drop across our site, Discord and social media. Stay sharp every code is a fresh chance to win.',
                ]}/>
              </li>

              {/* Step 5 */}
              <li className="relative">
   
                <h2 className="text-lg font-bold gradient-text mb-3">Step 5: Win & Claim Prizes</h2>
                <GlassList items={[
                  'Each competition has a visible countdown to draw time.',
                  'Winners are picked instantly via our random & fair draw system.',
                  'You’ll receive an in-app alert (and email if subscribed) when you win.',
                  'Prizes are sent as Pi (instantly) or delivered physically for real-world items.',
                ]}/>
              </li>
              <li className="relative">
  <h2 className="text-lg font-bold gradient-text mb-3">Step 6: Play OMC Stages</h2>
  <GlassList
    items={[
      'Stage 1 entry fee is 0.15 π.',
      'Each qualifier has 25 players, and only the Top 5 advance.',
      'The same format applies through Stage 2, Stage 3, and Stage 4.',
      'Tickets for Stage 2, 3, and 4 are FREE you win them by advancing.',
      'Stage 5 Final: all finalists share apart of the prize pool.',
      'Only one ticket per user is allowed in each qualifier (no multi-entries).',
    ]}
  />
</li>
            </ol>

            {/* Trust / transparency */}
            <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 sm:p-5">
              <h3 className="text-lg font-bold text-emerald-300 mb-3">Fair Play & Transparency</h3>
              <ul className="list-disc list-inside space-y-2 text-white/90 text-sm sm:text-base">
                <li>Every draw is timestamped, logged and verifiable.</li>
                <li>No bots. No manipulation. One account = one chance per draw.</li>
                <li>All transactions are processed through the official Pi SDK.</li>
              </ul>
            </div>

            {/* Support */}
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold gradient-text mb-2">Need Help?</h3>
              <p className="text-white/90 text-sm sm:text-base">
                Visit our{' '}
                <Link href="/help-support" className="gradient-text underline font-semibold">
                  Help & Support
                </Link>{' '}
                center — available 24/7.
              </p>
            </div>

            {/* Social */}
            <div className="mt-8 text-center">
              <h3 className="text-lg font-semibold gradient-text mb-2">🌍 Stay Connected</h3>
              <p className="text-white/80 text-sm mb-4">Follow us for surprise codes, announcements and exclusive giveaways</p>
              <div className="flex justify-center gap-4">
                <Social href="https://x.com/OhMyComps" title="Twitter / X">
                  <FaTwitter size={18} />
                </Social>
                <Social href="https://facebook.com" title="Facebook">
                  <FaFacebookF size={18} />
                </Social>
                <Social href="https://instagram.com/ohmycompetitions" title="Instagram">
                  <FaInstagram size={18} />
                </Social>
                <Social href="https://discord.gg" title="Discord">
                  <FaDiscord size={18} />
                </Social>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
              <Link href="/competitions/live-now" className="inline-block">
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold px-6 py-3 rounded-xl shadow-[0_0_28px_rgba(34,211,238,0.35)] hover:brightness-110 active:scale-[0.99] transition text-base">
                  View Live Competitions
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ---------- tiny helpers ---------- */

function StepDot() {
  return (
    <span
      className="
        absolute -left-[9px] top-1.5 h-4 w-4 rounded-full
        bg-gradient-to-br from-cyan-400 to-blue-500
        shadow-[0_0_18px_rgba(34,211,238,0.5)]
        ring-2 ring-[#0a1222]
      "
      aria-hidden
    />
  )
}

function GlassList({ items = [] }) {
  return (
    <ul className="space-y-2">
      {items.map((t, i) => (
        <li
          key={i}
          className="
            rounded-lg border border-white/10 bg-white/5
            text-white/90 text-sm sm:text-base
            px-3.5 py-2
          "
        >
          {t}
        </li>
      ))}
    </ul>
  )
}

function Social({ href, title, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className="
        inline-flex items-center justify-center
        h-10 w-10 rounded-xl
        border border-cyan-400/30 bg-cyan-400/10
        text-cyan-200 hover:text-white hover:bg-cyan-400/15
        transition-colors
      "
    >
      {children}
    </a>
  )
}

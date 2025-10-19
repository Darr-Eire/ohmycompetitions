// src/pages/how-to-play.jsx
'use client'

import Link from 'next/link'
import { FaTwitter, FaFacebookF, FaInstagram, FaDiscord } from 'react-icons/fa'

export default function HowToPlay() {
  return (
    <main className="relative min-h-screen text-white">
      {/* soft background + glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0a1222]" />
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[900px] aspect-square rounded-full blur-[120px] opacity-25"
          style={{
            background:
              'radial-gradient(50% 50% at 50% 50%, #22d3ee66 0%, transparent 60%)',
          }}
        />
      </div>

      {/* page container (mobile-first, comfortable measure) */}
      <div className="mx-auto w-full max-w-[680px] px-3 sm:px-4 py-6 sm:py-10">
        {/* hero card */}
        <div className="rounded-2xl sm:rounded-3xl border border-cyan-500/35 bg-white/[0.04] backdrop-blur-md shadow-[0_0_28px_rgba(34,211,238,0.18)] overflow-hidden">
          <div className="competition-top-banner title-gradient text-center py-5 sm:py-7">
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
                How to Play
              </span>
            </h2>
            <p className="mt-1 text-[13px] sm:text-base text-white px-4">
              Welcome to <span className="font-semibold">Oh My Competitions</span>
            </p>
          </div>

          {/* Steps */}
          <div className="p-4 sm:p-8">
            {/* On mobile, we don’t show the left timeline rule; it appears on sm+ */}
            <ol className="relative sm:border-s sm:border-white/10 sm:pl-6 space-y-4 sm:space-y-7">
              <Step
                title="login & Secure Your Account"
                items={[
                  'Open ohmycompetitions.com in the Pi Browser.',
                  'Tap “Login”. Choose Sign up (optional referral) or login.',
                  'Select “Login with Pi” and approve in the Pi Browser.',
                  'Your wallet is connected and ready.',
                ]}
              />

              <Step
                title="Enter Competitions"
                items={[
                  'Browse live/upcoming competitions on the homepage.',
                  'Open a card for prize, draw time, tickets & fee.',
                  'Tap “Pay With π” and choose ticket quantity.',
                  'Answer the skill question to continue.',
                  'Confirm with your Pi wallet your entry appears in your account.',
                ]}
              />

              <Step
                title="Track Entries"
                items={[
                  'Go to My Account → My Tickets.',
                  'See tickets, draw dates, and status in one place.',
                  'Check history and winnings anytime.',
                ]}
              />

              <Step
                title="Pi Cash Code"
                items={[
                  'Each day a secret code appears for a limited time. See it, keep it safe, and enter if picked to unlock the Pi Cash Code.',
                  'New code every day, active for exactly 31 hours 4 minutes.',
                  'Codes drop across site, Discord, and socials stay sharp.',
                ]}
              />

              <Step
                title="Win & Claim Prizes"
                items={[
                  'Each competition shows a live countdown.',
                  'Winners picked instantly via our fair draw system.',
                  'Get an in-app alert (and email if subscribed).',
                  'Prizes: Pi (instant) or shipped items for physical rewards.',
                ]}
              />

              <Step
                title="Play OMC Stages"
                items={[
                  'Stage 1 entry fee: 0.15 π.',
                  'Each qualifier has 25 players; Top 5 advance.',
                  'Same format for Stages 2–4.',
                  'Tickets for Stages 2–4 are FREE you earn them by advancing.',
                  'Stage 5 Final: all finalists share a part of the prize pool.',
                  'One ticket per user per qualifier.',
                ]}
              />
            </ol>

            {/* Trust / transparency */}
            <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-bold text-emerald-300 mb-2 sm:mb-3">
                Fair Play & Transparency
              </h3>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-white/90 text-[13px] sm:text-base">
                <li>Every draw is timestamped, logged, and verifiable.</li>
                <li>No bots. No manipulation. One account = one chance per draw.</li>
                <li>All transactions run through the official Pi SDK.</li>
              </ul>
            </div>

            {/* Support */}
            <div className="mt-5 sm:mt-6 text-center">
              <h3 className="text-base sm:text-lg font-semibold gradient-text mb-1.5 sm:mb-2">
                Need Help?
              </h3>
              <p className="text-white/90 text-[13px] sm:text-base">
                Visit our{' '}
                <Link
                  href="/help-support"
                  className="gradient-text underline font-semibold"
                >
                  Help &amp; Support
                </Link>{' '}
                center available 24/7.
              </p>
            </div>

            {/* Social */}
            <div className="mt-6 sm:mt-8 text-center">
              <h3 className="text-base sm:text-lg font-semibold gradient-text mb-1.5">
                🌍 Stay Connected
              </h3>
              <p className="text-white/80 text-[13px] sm:text-sm mb-3">
                Follow for surprise codes, announcements, and exclusive giveaways
              </p>
              <div className="flex justify-center gap-3 sm:gap-4">
                <Social href="https://x.com/OhMyComps" title="Twitter / X">
                  <FaTwitter size={16} />
                </Social>
                <Social href="https://facebook.com" title="Facebook">
                  <FaFacebookF size={16} />
                </Social>
                <Social href="https://instagram.com/ohmycompetitions" title="Instagram">
                  <FaInstagram size={16} />
                </Social>
                <Social href="https://discord.gg" title="Discord">
                  <FaDiscord size={16} />
                </Social>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-7 sm:mt-10 text-center">
              <Link href="/competitions/live-now" className="block">
                <button className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-xl border border-cyan-400/60 bg-white/5 backdrop-blur hover:bg-white/10 shadow-[0_0_18px_#22d3ee33] transition focus:outline-none focus:ring-2 focus:ring-cyan-400/70">
                  <span className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent font-bold">
                    View Live Competitions
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* bottom padding for safe-area */}
        <div className="h-8" />
      </div>

      {/* reduce motion */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  )
}

function Step({ title, items }) {
  return (
    <li className="relative">
  
      <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 sm:p-0 sm:bg-transparent sm:border-0">
        <h2 className="text-[15px] sm:text-lg font-bold gradient-text mb-2 sm:mb-3">
          {title}
        </h2>
        <GlassList items={items} />
      </div>
    </li>
  );
}


function GlassList({ items = [] }) {
  return (
    <ul className="space-y-1.5 sm:space-y-2">
      {items.map((t, i) => (
        <li
          key={i}
          className="rounded-lg border border-white/10 bg-white/5 text-white/90 text-[13px] sm:text-base leading-relaxed px-3 py-2"
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
      className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 hover:text-white hover:bg-cyan-400/15 transition-colors"
    >
      {children}
    </a>
  )
}

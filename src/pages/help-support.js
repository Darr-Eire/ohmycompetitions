// src/pages/help-support.js
'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaDiscord,
  FaEnvelope,
  FaQuestionCircle,
  FaBookOpen,
  FaShieldAlt,
  FaBell
} from 'react-icons/fa'

/* ------------------------------- FAQ DATA ------------------------------- */
const faqSections = [
  {
    title: 'General Frequently Asked Questions',
    items: [
      ['How does Oh My Competitions work?',
       'You sign in using your Pi account, choose a competition and either enter for free or use Pi to buy tickets. Winners are picked at random after the countdown ends and Pi prizes are paid out via the official Pi SDK. Bonus games, daily streaks and referral rewards also boost your chances!'],
      ['How do I enter competitions?',
       'Click the “Enter Now” button on any competition. If it’s a Pi competition, you’ll be asked to confirm a small Pi payment through the Pi Network SDK.'],
      ['Is joining free?',
       'Yes! We offer a mix of free and paid competitions. Free entries are open to all users, while premium entries require a small Pi entry fee.'],
      ['How do I Pay With π?',
       'Simply click to enter a competition that requires Pi and you’ll be prompted to confirm the transaction through the official Pi payment popup. Make sure you\'re logged into your Pi Wallet.'],
      ['Where are my tickets?',
       'You can view all your active and past tickets on the “My Entries” page, accessible after logging in.'],
      ['How are winners chosen?',
       'All winners are picked using a fair and random selection process once the competition ends.'],
      ['Can I try again if I don’t win?',
       'Yes! You can enter multiple competitions weekly, including retrying mini-games and challenges like the 3.14 Stopwatch game.'],
      ['Is the platform decentralized?',
       'We are actively building toward decentralization. Our payment system is already integrated with the Pi Network and future updates will use smart contracts for prize verification and randomness.'],
      ['Is my Pi safe?',
       'Yes. All payments go through the official Pi Network SDK. We never store your private keys or Pi wallet data.'],
      ['How do I contact support?',
       'Reach out any time via email at ohmycompetitions@gmail.com or message us on Instagram, X (Twitter), or Discord.'],
    ]
  },
  {
    title: 'Using Oh My Competitions',
    items: [
      ['Who can join Oh My Competitions?',
       'Anyone with a Pi account can play! Whether you’re a casual Pioneer or a seasoned Pi believer, OMC is open to players worldwide. All you need is a verified Pi login to get started.'],
      ['Is this legit or just another Pi scam?',
       'Great question. OMC is 100% powered by the official Pi Network SDK. All payments are made through Pi’s secure wallet and every winner is verifiable on the app — no bots, no fake giveaways, no false promises.'],
      ['How are winners picked?',
       'All draws use a fair randomization process. We don’t control the outcome — it’s automated and verified. Once the timer ends, winners are chosen transparently and shown publicly.'],
      ['What makes OMC different from other Pi apps?',
       'We don’t just hand out Pi — we build hype, community and real value. From Try Your Skill games and Pi Cash Code to referral bonuses and high-stakes giveaways, OMC creates an engaging, fair experience for everyone.'],
      ['Can I win without spending Pi?',
       'Yes! We offer free daily games, mystery draws and social competitions. Every Pioneer, no matter how much Pi you have, can win something — even instantly.'],
      ['How do I know if a competition is live?',
       'Each competition shows a live countdown and ticket availability. If it’s live, you’ll see an “Enter Now” button. You can also filter by “Live,” “Upcoming,” and “Closed” competitions.'],
      ['What happens if a competition doesn’t sell all tickets?',
       'We still draw a winner at the scheduled end time. If the prize pool was based on ticket sales, it adjusts automatically. No delays, no excuses — someone still wins.'],
      ['How do I invite friends?',
       'Use your referral link on the dashboard to share with friends. When they join and enter their first comp, you both get free entries. More invites = more rewards.'],
      ['How is my Pi protected?',
       'Your Pi never touches our servers. All transactions use the official Pi payment SDK and we never access your wallet keys or private info. We prioritize security, fairness and transparency.'],
      ['Do I need to install anything?',
       'No app install is required. Just visit ohmycompetitions.com from any device and sign in using your Pi account — that’s it. Mobile-optimized and ready to go.'],
      ['What are “Try Your Skill” games?',
       'These are free daily mini-games like “Match The Pi Code” and “Hack The Vault.” They’re fun, fast and can reward you instantly with Pi, bonus entries, or even hidden prize drops.'],
      ['Can I win more than once?',
       'Absolutely. We’ve had users win multiple times across different draws and mini-games. As long as you stay active, you stay eligible.'],
      ['What if I get disconnected during payment?',
       'If the payment isn’t confirmed by the Pi SDK, it won’t go through — and you won’t lose Pi. Just refresh and try again.'],
      ['Can I play if I’m not KYC verified?',
       'Yes, you can enter competitions and win. However, for Pi payouts, your Pi wallet must be eligible to receive transactions, which typically means KYC’d.'],
      ['What if my country doesn’t support shipping?',
       'For physical prizes, if we can’t ship to your country, we’ll offer an alternative prize or Pi equivalent instead — we’ll always make it fair.'],
      ['Do competitions ever get cancelled?',
       'Very rarely. If we ever need to cancel a comp, all Pi entries are refunded automatically and the reason is transparently shown on the competition page.']
    ]
  },
  {
    title: 'Pi Cash Code — FAQ',
    items: [
      ['What is Pi Cash Code?',
       'Pi Cash Code is a weekly high-stakes giveaway where one Piioneer is randomly selected to claim a Pi prize — but only if they submit the correct secret code in time. It’s fast, intense and 100% real.'],
      ['How does it work?',
       'Every week, we pick one winner randomly from all eligible participants. A unique secret code is revealed and the chosen winner must enter it on the Pi Cash Code page within a strict time window.'],
      ['When does it happen?',
       'The secret code is revealed every Monday at 3:14 PM GMT and the winning Piioneer is selected the following Friday at 3:14 PM GMT. Keep your notifications on — your name could come up!'],
      ['How long do I have to claim?',
       'You have exactly 31 minutes and 4 seconds (a nod to 3.14 Pi) to enter the secret code after the winner announcement. If you’re the winner, a special input box will appear for you to submit it.'],
      ['Where do I enter the code?',
       'Go to the official Pi Cash Code page while logged in. If you’re the selected winner, the input field will automatically appear — but only during your claim window.'],
      ['What if I miss the window?',
       'If you don’t enter the code in time, the prize is forfeited — there are no extensions. We recommend setting an alarm for every Friday at 3:14 PM and checking back just in case.'],
      ['What happens if nobody claims the prize?',
       'If the weekly prize goes unclaimed, it rolls over and doubles for the next week. This means bigger and bigger Pi jackpots until someone grabs the code and wins it all.'],
      ['How do I become eligible?',
       'To be eligible, make sure you’ve entered at least one competition that week or logged in and played any “Try Your Skill” game. That’s it — no extra steps needed.'],
      ['Can I win more than once?',
       'Yes! Every week is a new chance. As long as you remain active and engaged, you’re always eligible to be chosen again.'],
      ['Is it really random?',
       'Yes — winners are picked using a transparent and tamper-proof randomization process and the code claim mechanism is triggered directly through the app’s backend for fairness.'],
    ]
  },
  {
    title: 'How to Claim if You Win',
    items: [
      ['I won a competition. How do I claim?',
       'First off — congrats! 🎉 If you win, you’ll get a real-time in-app notification. Head to your dashboard to view the winning competition. If it’s a Pi Cash Code win, you’ll need to enter the correct code before your claim timer runs out. For standard competitions, Pi is sent automatically.'],
      ['Do I need to verify my wallet?',
       'No additional wallet verification is required. Since you login with the official Pi Network, your Pi Wallet is already securely linked. All payouts are processed via the Pi SDK.'],
      ['When is Pi sent?',
       'For normal competitions, Pi is transferred directly to your linked wallet within moments of the competition ending. For Pi Cash Code, the prize is only released after you submit the correct code within the 31:04 time window.'],
      ['What if I win but don’t respond?',
       'If you miss your chance to claim (especially for time-sensitive events like Pi Cash Code), the prize either rolls over or is awarded to a backup winner depending on the rules. Be sure to turn on app notifications so you never miss out!'],
      ['Can I claim from anywhere in the world?',
       'Yes — digital Pi prizes can be claimed globally. For physical items, we’ll work with you to arrange shipping or an equivalent payout where possible.'],
      ['Where can I track my winnings?',
       'Your full history — including tickets, entries, wins and prize status — can be viewed in your "My Entries" dashboard anytime you’re logged in.'],
    ]
  }
]

/* ----------------------------- Background FX ----------------------------- */
function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -inset-40 blur-3xl opacity-35 [background:conic-gradient(from_180deg_at_50%_50%,#00ffd5,rgba(0,255,213,.2),#0077ff,#00ffd5)] animate-[spin_45s_linear_infinite]" />
      <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-25 bg-cyan-400 animate-[float_14s_ease-in-out_infinite]" />
      <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-blue-500 animate-[float2_18s_ease-in-out_infinite]" />
      <style jsx global>{`
        @keyframes float {0%{transform:translate(0,0)}50%{transform:translate(12px,18px)}100%{transform:translate(0,0)}}
        @keyframes float2{0%{transform:translate(0,0)}50%{transform:translate(-16px,-14px)}100%{transform:translate(0,0)}}
      `}</style>
    </div>
  )
}

/* ------------------------------- Components ------------------------------ */

function SectionChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition
        ${active
          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
          : 'text-white/70 hover:text-white hover:bg-white/10 border border-white/20'}
      `}
      type="button"
    >
      {label}
    </button>
  )
}

function Accordion({ title, items, isOpen, onToggle, searchTerm }) {
  const normalized = (s) => String(s || '').toLowerCase()
  const term = normalized(searchTerm)

  const filtered = useMemo(() => {
    if (!term) return items
    return items.filter(([q, a]) => normalized(q).includes(term) || normalized(a).includes(term))
  }, [items, term])

  if (!filtered.length) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 font-semibold text-[15px] gradient-text flex items-center justify-between"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className="ml-3 text-white/80 text-xl">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <ul className="px-4 pb-4 space-y-4 text-white/90">
          {filtered.map(([q, a], idx) => (
            <li key={idx} className="rounded-lg bg-white/[0.04] border border-white/10 p-3">
              <p className="font-semibold mb-1">{q}</p>
              <p className="text-white/80 leading-relaxed">{a}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* --------------------------------- Page ---------------------------------- */
export default function HelpSupport() {
  const [openIndex, setOpenIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if (!searchTerm) return
    // when searching, open all sections that have results (or close all if none)
    const matches = faqSections
      .map((s, i) => ({ i, has: s.items.some(([q, a]) => {
        const t = searchTerm.toLowerCase()
        return q.toLowerCase().includes(t) || a.toLowerCase().includes(t)
      })}))
      .filter(x => x.has)
      .map(x => x.i)

    if (matches.length) setOpenIndex(matches[0])
  }, [searchTerm])

  const totalMatches = useMemo(() => {
    if (!searchTerm) return null
    const t = searchTerm.toLowerCase()
    return faqSections.reduce((acc, s) => (
      acc + s.items.filter(([q,a]) => q.toLowerCase().includes(t) || a.toLowerCase().includes(t)).length
    ), 0)
  }, [searchTerm])

  return (
    <main className="relative min-h-screen text-white bg-[#0f1b33]">
      <BackgroundFX />

      {/* Header chip */}
      <header className="pt-[calc(14px+env(safe-area-inset-top))] pb-3 sm:pb-4">
        <div className="mx-auto w-full max-w-[min(94vw,1100px)] px-3">
          <div className="text-center space-y-2">
            <h1 className="inline-flex items-center justify-center gap-2 text-[22px] sm:text-[28px] font-extrabold tracking-tight px-5 py-2.5 rounded-xl font-orbitron
                           text-transparent bg-clip-text bg-gradient-to-r from-[#00ffd5] to-[#0077ff]">
              Help & Support
            </h1>
            <p className="text-white/75 text-[13px] sm:text-[14px]">
              Answers, tips and the fastest ways to get help.
            </p>
          </div>
        </div>
      </header>

      <section className="pb-10">
        <div className="mx-auto w-full max-w-[min(94vw,1100px)] px-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_24px_rgba(34,211,238,0.15)] overflow-hidden">

            {/* Top bar with search + quick links */}
            <div className="p-4 sm:p-5 border-b border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <FaQuestionCircle className="text-cyan-300" />
                <span className="font-semibold">Search FAQs</span>
                {totalMatches != null && (
                  <span className="ml-auto text-sm text-white/70">
                    {totalMatches} result{totalMatches === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              <input
                type="text"
                placeholder="Search ‘payment’, ‘tickets’, ‘Pi Cash Code’…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-[14px] placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
              />

              {/* Quick section filters */}
              <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-1">
                {faqSections.map((s, idx) => (
                  <SectionChip
                    key={s.title}
                    label={s.title.replace(' — FAQ','')}
                    active={openIndex === idx}
                    onClick={() => setOpenIndex(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Contact / quick-help row */}
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <a
                href="mailto:ohmycompetitions@gmail.com?subject=OMC%20Support"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/10 transition"
              >
                <span className="grid place-items-center h-8 w-8 rounded-md bg-cyan-400/20 border border-cyan-300/30"><FaEnvelope /></span>
                <div>
                  <p className="text-sm font-semibold">Email Support</p>
                  <p className="text-xs text-white/70">ohmycompetitions@gmail.com</p>
                </div>
              </a>

              <Link
                href="/status"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/10 transition"
              >
                <span className="grid place-items-center h-8 w-8 rounded-md bg-cyan-400/20 border border-cyan-300/30"><FaBell /></span>
                <div>
                  <p className="text-sm font-semibold">Status & Updates</p>
                  <p className="text-xs text-white/70">Live system health</p>
                </div>
              </Link>

              <Link
                href="/terms"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/10 transition"
              >
                <span className="grid place-items-center h-8 w-8 rounded-md bg-cyan-400/20 border border-cyan-300/30"><FaBookOpen /></span>
                <div>
                  <p className="text-sm font-semibold">Terms</p>
                  <p className="text-xs text-white/70">Rules & eligibility</p>
                </div>
              </Link>

              <Link
                href="/privacy"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/10 transition"
              >
                <span className="grid place-items-center h-8 w-8 rounded-md bg-cyan-400/20 border border-cyan-300/30"><FaShieldAlt /></span>
                <div>
                  <p className="text-sm font-semibold">Privacy</p>
                  <p className="text-xs text-white/70">Your data & wallet</p>
                </div>
              </Link>
            </div>

            {/* FAQ sections */}
            <div ref={listRef} className="p-4 sm:p-5 space-y-4">
              {faqSections.map((section, i) => (
                <Accordion
                  key={section.title}
                  title={section.title}
                  items={section.items}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                  searchTerm={searchTerm}
                />
              ))}
            </div>

            {/* Socials */}
            <div className="px-4 sm:px-5 pb-5">
              <h3 className="text-center text-[15px] font-semibold text-cyan-300 mb-2">Connect with us</h3>
              <div className="flex justify-center gap-3">
                <a
                  href="https://x.com/OM_Competitions"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition"
                  aria-label="X (Twitter)"
                >
                  <FaTwitter />
                </a>
                <a
                  href="https://instagram.com/_ohmycompetitions"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61577406478876"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://discord.gg/YOUR_DISCORD_INVITE"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition"
                  aria-label="Discord"
                >
                  <FaDiscord />
                </a>
              </div>
            </div>

          </div>

          {/* footer nav chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold border border-white/15 bg-white/5 hover:bg-white/10">
              Back to Home
            </Link>
            <Link href="/support" className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold border border-white/15 bg-white/5 hover:bg-white/10">
              Support Center
            </Link>
            <Link href="/forums" className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold border border-white/15 bg-white/5 hover:bg-white/10">
              Community Forums
            </Link>
          </div>
        </div>
      </section>

      {/* subtle global gradient text helper (matches other pages) */}
      <style jsx global>{`
        .gradient-text {
          background-image: linear-gradient(90deg, #67e8f9, #60a5fa);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>
    </main>
  )
}

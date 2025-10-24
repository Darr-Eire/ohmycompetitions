// file: src/pages/about-us.jsx (or keep your current path/name)
'use client'

import Head from 'next/head'
import Link from 'next/link'
import React from 'react'

/* ---------------------- Background FX (same as homepage) ---------------------- */
function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* aurora swirl */}
      <div className="absolute -inset-32 blur-3xl opacity-35 [background:conic-gradient(from_180deg_at_50%_50%,#00ffd5,rgba(0,255,213,.2),#0077ff,#00ffd5)] animate-[spin_35s_linear_infinite]" />
      {/* star grid */}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
      {/* drifting glows */}
      <div className="absolute -top-20 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-25 bg-cyan-400 animate-[float_14s_ease-in-out_infinite]" />
      <div className="absolute -bottom-20 -right-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-blue-500 animate-[float2_18s_ease-in-out_infinite]" />
      <style jsx global>{`
        @keyframes float {0%{transform:translate(0,0)}50%{transform:translate(12px,18px)}100%{transform:translate(0,0)}}
        @keyframes float2{0%{transform:translate(0,0)}50%{transform:translate(-16px,-14px)}100%{transform:translate(0,0)}}
      `}</style>
    </div>
  )
}

const PageWrapper = ({ children }) => (
  <div className="app-background relative min-h-screen w-full text-white">
    <BackgroundFX />
    {children}
  </div>
)

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us | OhMyCompetitions</title>
        <meta
          name="description"
          content="Oh My Competitions is built for Pioneers, powered by Pi. Fair, transparent and fun Pi-powered competitions and mini-games."
        />
        <meta property="og:title" content="About Us | OhMyCompetitions" />
        <meta property="og:description" content="Built for Pioneers. Powered by Pi. Driven by Fun." />
      </Head>

      <PageWrapper>
        <main className="min-h-screen">
          {/* page container */}
          <div className="mx-auto w-full max-w-5xl px-3 sm:px-4">
            {/* card shell */}
            <div className="competition-card mx-auto mt-8 sm:mt-14 w-full max-w-3xl rounded-2xl bg-white/[0.06] backdrop-blur-md shadow-[0_0_40px_#00fff022] border border-white/10">

              {/* banner */}
              <div className="text-center rounded-t-2xl px-3 py-7 sm:py-9 bg-[#0f172a]/70 border-b border-white/10">
                <h1 className="font-orbitron font-extrabold tracking-tight text-2xl sm:text-3xl">
                  <span className="bg-gradient-to-r from-[#00ffd5] via-[#27b7ff] to-[#0077ff] bg-clip-text text-transparent">
                    About Us
                  </span>
                </h1>
                <p className="mt-2 text-white/95 text-[13px] sm:text-lg leading-relaxed">
                  Built for Pioneers. Powered by Pi. Driven by Fun.
                </p>
              </div>

              {/* body */}
              <div className="p-5 sm:p-8 space-y-8 sm:space-y-10">

                {/* intro */}
                <p className="text-[13px] sm:text-lg leading-relaxed text-white/90 text-center max-w-2xl mx-auto">
                  Oh My Competitions was created to bring <span className="font-semibold text-cyan-300">fun</span>, <span className="font-semibold text-cyan-300">fairness</span> and <span className="font-semibold text-cyan-300">real rewards</span> to the Pi community. Built by Pioneers, for Pioneers. Our goal is to make competitions exciting, transparent and genuinely rewarding.
                </p>

                <p className="text-[13px] sm:text-lg leading-relaxed text-white/80 text-center max-w-2xl mx-auto">
                  What started as one casual Pi referral turned into a full-on competition adventure powered by belief, late nights and a lot of Pi.
                </p>

                {/* What OMC stands for */}
                <section className="relative">
                  <h2 className="text-center text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
                    Oh My Competitions Stands For
                  </h2>
                  <p className="text-center text-[13px] sm:text-lg leading-relaxed text-white/80 max-w-2xl mx-auto mb-7 sm:mb-10">
                    OMC isn’t just a platform—it’s a <span className="font-semibold">movement</span> built around Pioneers, rewards and real utility in the Pi ecosystem. Here’s what drives us:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    {/* community */}
                    <div className="group rounded-2xl p-4 sm:p-6 bg-white/[0.04] border border-cyan-400/30 shadow-[0_0_22px_#00fff022] hover:shadow-[0_0_32px_#00fff044] transition">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-xl sm:text-2xl">🌍</span>
                        <h3 className="text-lg sm:text-xl font-semibold text-cyan-300 group-hover:text-cyan-200 transition">
                          Community
                        </h3>
                      </div>
                      <p className="text-white/80 leading-relaxed text-[13px] sm:text-base">
                        Built for Pioneers, by Pioneers. OMC brings people together through games, competitions and real rewards—creating friendships and a thriving Pi-powered community.
                      </p>
                    </div>

                    {/* utility */}
                    <div className="group rounded-2xl p-4 sm:p-6 bg-white/[0.04] border border-green-400/30 shadow-[0_0_22px_#22c55e22] hover:shadow-[0_0_32px_#22c55e44] transition">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-xl sm:text-2xl">🔗</span>
                        <h3 className="text-lg sm:text-xl font-semibold text-green-300 group-hover:text-green-200 transition">
                          Real Utility
                        </h3>
                      </div>
                      <p className="text-white/80 leading-relaxed mb-2 text-[13px] sm:text-base">
                        Pi isn’t just a number—it’s a currency. OMC gives Pi real use cases:
                      </p>
                      <ul className="list-disc list-inside text-white/80 space-y-1 text-[13px] sm:text-base">
                        <li>
                          <Link href="/competitions/live-now" className="text-cyan-300 hover:underline">
                            Join competitions and win real Pi
                          </Link>
                        </li>
                        <li>
                          <Link href="/try-your-skill" className="text-cyan-300 hover:underline">
                            Play skill-based mini-games
                          </Link>
                        </li>
                        <li>
                          <Link href="/redeem" className="text-cyan-300 hover:underline">
                            Redeem prizes, vouchers & rewards
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* fairness */}
                    <div className="group rounded-2xl p-4 sm:p-6 bg-white/[0.04] border border-purple-400/30 shadow-[0_0_22px_#a855f722] hover:shadow-[0_0_32px_#a855f744] transition">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-xl sm:text-2xl">🔐</span>
                        <h3 className="text-lg sm:text-xl font-semibold text-purple-300 group-hover:text-purple-200 transition">
                          Fairness & Accessibility
                        </h3>
                      </div>
                      <p className="text-white/80 leading-relaxed text-[13px] sm:text-base">
                        No hidden tricks. No whales. No pay-to-win. Every ticket, draw and prize is transparent. We keep competitions fair, fun and accessible to everyone.
                      </p>
                    </div>

                    {/* connecting dapps */}
                    <div className="group rounded-2xl p-4 sm:p-6 bg-white/[0.04] border border-pink-400/30 shadow-[0_0_22px_#ec489922] hover:shadow-[0_0_32px_#ec489944] transition">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-xl sm:text-2xl">🤝</span>
                        <h3 className="text-lg sm:text-xl font-semibold text-pink-300 group-hover:text-pink-200 transition">
                          Connecting dApps
                        </h3>
                      </div>
                      <p className="text-white/80 leading-relaxed mb-2 text-[13px] sm:text-base">
                        OMC is about collaboration, not competition. We work closely with other Pi dApps to:
                      </p>
                      <ul className="list-disc list-inside text-white/80 space-y-1 mb-2 text-[13px] sm:text-base">
                        <li>Integrate cross-dApp rewards</li>
                        <li>Share APIs and utilities</li>
                        <li>Strengthen the Pi Web3 ecosystem together</li>
                      </ul>
                      <Link
                        href="/contact"
                        className="inline-block mt-1 px-4 py-2 rounded-lg bg-pink-500/20 border border-pink-400/50 text-pink-300 hover:bg-pink-500/30 transition text-[13px] sm:text-sm"
                      >
                        Partner with us
                      </Link>
                    </div>
                  </div>
                </section>

                {/* Pi Economy Loop Section */}
                <section className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
                    Fuelling the Pi Economy
                  </h2>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    At OMC, we're committed to a sustainable and thriving Pi ecosystem. All profits generated from our competitions are <strong>reinvested back into the community</strong>. This forms a continuous loop:
                  </p>
                  <ul className="list-disc list-inside text-white/90 space-y-2 text-[13px] sm:text-lg">
                    <li>Funding future prizes and bigger rewards 🏆</li>
                    <li>Developing new features and enhancing the app experience ✨</li>
                    <li>Supporting and collaborating with other innovative dApps within the Pi Network 🤝</li>
                  </ul>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    Our goal is to continually source from and contribute to the Pi ecosystem, ensuring that Pi stays in circulation and its utility grows stronger with every competition.
                  </p>
                </section>

                {/* story sections */}
                <section className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
                    An Idea That Wouldn’t Let Go
                  </h2>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    One late night, somewhere between caffeine and a weird documentary, it clicked:
                    <em> “What if we didn’t just earn Pi—what if we played for it?”</em>
                  </p>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    Whiteboards. Sketches. Flows. Domains. Code. And a suspicious amount of pizza. The vision got louder every day.
                  </p>
                </section>

                <section className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
                    Discovering Pi Network
                  </h2>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    A friend told us about <strong>Pi Network</strong>. We pushed the button, got curious and saw the potential. We mined… and yeah, sometimes forgot to mine.
                  </p>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    My friend joked, <em>“If it ever hits 5¢, that’s still good for free mining.”</em> But we looked past price—it was about the vision and the ecosystem it could build.
                  </p>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    Then it hit us: <em>Why just mine when we can build something real for Pioneers?</em> That’s when the mission began.
                  </p>
                </section>

                <section className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
                    Built by Beginners. Fueled by Belief.
                  </h2>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    Did we know how to ship a whole app? Not really. Did we try anyway? Absolutely.
                  </p>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    Bugs, crashes, keyboard-smashing—all part of it. Every fix felt like a win. Not a jackpot… but close. It paid in momentum.
                  </p>
                </section>

                <section className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
                    Oh My Competitions Was Born
                  </h2>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    We didn’t want just another app. We wanted a Pi-powered playground—games, competitions and challenges that bring people together not just to win, but to have fun doing it.
                  </p>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    That’s how OhMyCompetitions came to life. And it hasn’t stopped growing since.
                  </p>
                </section>

                <section className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
                    When the Magic Clicked
                  </h2>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    The first time Pi Login worked end-to-end—frontend, backend, wallet—it felt like magic. We nearly Pi-danced in the living room.
                  </p>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    That was the moment it went from “this could work” to “this <em>does</em> work.”
                  </p>
                </section>

                {/* current status */}
                <section className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
                    Where We Are Now
                  </h2>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    🎮 Real games<br />
                    🎁 Real prizes<br />
                    👥 Real Pioneers playing daily<br />
                    💡 Real utility for Pi<br />
                    🤝 Real connections and friendships
                  </p>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    OMC isn’t just an idea anymore. It’s a platform and a promise to reward the Pi community for being early, curious and relentless.
                  </p>
                </section>

                {/* future */}
                <section className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
                    Where We’re Going
                  </h2>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    We’re building towards:<br />
                    🌍 Global tournaments<br />
                    🛍 Merchant partnerships<br />
                    🕹 A full-blown Pi arcade<br />
                    🧠 Skill-based games that reward hustle, not luck
                  </p>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    The goal? Be the most trusted, most entertaining and most community-powered competition platform in the Pi Network universe.
                  </p>
                </section>

                {/* thank you */}
                <section className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
                    Thank You, Pioneers
                  </h2>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    To the early testers, patient bug-slayers, Pi evangelists and hype crew—you built this with us. OMC is for you. And we’re only getting started.
                  </p>
                  <p className="text-[13px] sm:text-lg leading-relaxed text-white/90">
                    The next chapter? You’re in it.
                  </p>
                </section>

                {/* CTA */}
                <div className="text-center pt-2 sm:pt-4">
                  <Link href="/forums/general">
                    <button
                      className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-lg rounded-full border border-cyan-400/60 bg-white/[0.06] backdrop-blur hover:bg-white/[0.1] shadow-[0_0_20px_#22d3ee33] transition focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
                      type="button"
                    >
                      <span className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent font-bold">
                        Join the Conversation
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* subtle bottom padding */}
            <div className="h-10" />
          </div>
        </main>
      </PageWrapper>
    </>
  )
}

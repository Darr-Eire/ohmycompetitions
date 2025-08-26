'use client'

import Head from 'next/head'
import Link from 'next/link'

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us | OhMyCompetitions</title>
      </Head>

     <main className="app-background min-h-screen flex justify-center px-4 text-white">
  <div className="competition-card max-w-3xl w-full bg-white/10 rounded-2xl shadow-lg backdrop-blur-md mt-10 sm:mt-16">

    {/* Banner */}
    <div className="competition-top-banner title-gradient text-center py-8 rounded-t-2xl">
      <h1 className="text-2xl sm:text-2xl font-orbitron font-extrabold text-black tracking-tight">
        About Us
      </h1>
      <p className="mt-3 text-lg sm:text-xl leading-relaxed text-black text-center max-w-2xl mx-auto">
        Built for Pioneers. Powered by Pi. Driven by Fun.
      </p>
    </div>

 

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-10">

            {/* Intro */}
            <p className="text-base sm:text-lg leading-relaxed text-white/90 text-center max-w-2xl mx-auto">
              Oh My Competitions was created to bring fun, fairness and real rewards 
              to the Pi community. Built by pioneers, for pioneers our goal is to make competitions exciting, 
              transparent and genuinely rewarding.
            </p>

            <p className="text-base sm:text-lg leading-relaxed text-white/80 text-center max-w-2xl mx-auto">
              What started as one casual Pi referral turned into a full-on giveaway adventure.  
              It’s a story powered by belief, late nights and a lot of Pi.
            </p>

            {/* What OMC Stands For */}
<section className="relative my-12">
  {/* Section Heading */}
  <h2 className="text-3xl sm:text-4xl font-bold gradient-text text-center mb-4">
   Oh My Competitions Stands For
  </h2>
  <p className="text-base sm:text-lg leading-relaxed text-white/80 text-center max-w-2xl mx-auto mb-10">
    Oh My Competitions isn’t just a platform it’s a <span className="font-semibold">movement</span> 
    built around pioneers, rewards and creating real value in the Pi ecosystem.  
    Here’s what drives us
  </p>

  {/* Neon Grid Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
    
    {/* 🌍 Community */}
    <div className="glass-card group border border-cyan-400/40 rounded-2xl p-6 shadow-neon hover:shadow-cyan-500/40 transition">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">🌍</span>
        <h3 className="text-xl font-semibold text-cyan-300 group-hover:text-cyan-200 transition">
          Community
        </h3>
      </div>
      <p className="text-white/80 leading-relaxed">
        We’re built for pioneers, by pioneers. OMC brings people together through games, 
        competitions, and real rewards creating friendships and a thriving Pi-powered community.
      </p>
    </div>

    {/* 🔗 Real Utility */}
    <div className="glass-card group border border-green-400/40 rounded-2xl p-6 shadow-neon hover:shadow-green-500/40 transition">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">🔗</span>
        <h3 className="text-xl font-semibold text-green-300 group-hover:text-green-200 transition">
          Real Utility
        </h3>
      </div>
      <p className="text-white/80 leading-relaxed mb-3">
        Pi isn’t just a number it’s a currency. OMC gives Pi real use cases
      </p>
      <ul className="list-disc list-inside text-white/80 space-y-1">
        <li>
          <Link href="/competitions/live-now" className="text-cyan-300 hover:underline">
            Join competitions and win real Pi
          </Link>
        </li>
        <li>
          <Link href="/try-your-luck" className="text-cyan-300 hover:underline">
            Play skill-based mini-games
          </Link>
        </li>
        <li>
          <Link href="/redeem" className="text-cyan-300 hover:underline">
            Redeem prizes, vouchers, and rewards
          </Link>
        </li>
      </ul>
    </div>

    {/* 🔐 Fairness */}
    <div className="glass-card group border border-purple-400/40 rounded-2xl p-6 shadow-neon hover:shadow-purple-500/40 transition">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">🔐</span>
        <h3 className="text-xl font-semibold text-purple-300 group-hover:text-purple-200 transition">
          Fairness & Accessibility
        </h3>
      </div>
      <p className="text-white/80 leading-relaxed">
        No hidden tricks. No whales. No pay-to-win nonsense.  
        Every ticket, every draw and every prize is 100% transparent.  
        We make competitions fair, fun and accessible for everyone.
      </p>
    </div>

    {/* 🤝 Connecting dApps */}
    <div className="glass-card group border border-pink-400/40 rounded-2xl p-6 shadow-neon hover:shadow-pink-500/40 transition">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">🤝</span>
        <h3 className="text-xl font-semibold text-pink-300 group-hover:text-pink-200 transition">
          Connecting dApps
        </h3>
      </div>
      <p className="text-white/80 leading-relaxed mb-3">
        OMC is about collaboration, not competition.  
        We work closely with other Pi dApps to
      </p>
      <ul className="list-disc list-inside text-white/80 space-y-1 mb-3">
        <li>Integrate cross-dApp rewards</li>
        <li>Share APIs and utilities</li>
        <li>Strengthen the Pi Web3 ecosystem together</li>
      </ul>
      <Link
        href="/contact"
        className="inline-block mt-2 px-4 py-2 rounded-lg bg-pink-500/20 border border-pink-400/50 text-pink-300 hover:bg-pink-500/30 transition"
      >
        Partner with us
      </Link>
    </div>
  </div>
</section>



            {/* Story Timeline */}
      <section className="space-y-6">
  <h2 className="text-2xl font-bold gradient-text">An Idea That Wouldn’t Let Go</h2>
  <p className="text-base sm:text-lg leading-relaxed text-white/90">
    One late night, somewhere between caffeine and a weird documentary, it clicked:
    <em> “What if we didn’t just earn Pi — what if we played for it?”</em>
  </p>
  <p className="text-base sm:text-lg leading-relaxed text-white/90">
    Whiteboards. Sketches. User flows. Domains. Code.  
    And a suspicious amount of pizza.  
    The vision got louder every day.
  </p>
</section>

<section className="space-y-6">
  <h2 className="text-2xl font-bold gradient-text">Discovering Pi Network</h2>
  <p className="text-base sm:text-lg leading-relaxed text-white/90">
    A friend once told us about this thing called <strong>Pi Network</strong>.  
    We had no idea what it was but for some reason, we still pushed that button.  
    Day by day, we got more curious, learned more and started to understand its potential.  
    We mined and mined… and yeah, sometimes even forgot to mine.
  </p>
  <p className="text-base sm:text-lg leading-relaxed text-white/90">
    My friend used to joke, <em> If it ever hits 5¢, that’s still good for free mining.”</em>  
    But I always looked past that.  
    For me, it wasn’t about the price it was about the vision,  
    about what Pi could become and the ecosystem it could build.
  </p>
  <p className="text-base sm:text-lg leading-relaxed text-white/90">
    And then it hit us  
    <em>Why just mine when we can actually build something real for the pioneers?</em>  
    That’s when the mission began.
  </p>
</section>

<section className="space-y-6">
  <h2 className="text-2xl font-bold gradient-text">Built by Beginners. Fueled by Belief.</h2>
  <p className="text-base sm:text-lg leading-relaxed text-white/90">
    Did we know how to ship a whole app? Not really. Did we try anyway? Absolutely.
  </p>
  <p className="text-base sm:text-lg leading-relaxed text-white/90">
    Bugs, crashes, keyboard-smashing all part of it.  
    Every fix felt like a win.  
    Not a jackpot… but close.  
    It paid in momentum.
  </p>
</section>


            <section className="space-y-6">
              <h2 className="text-2xl font-bold gradient-text">Oh My Competitions Was Born</h2>
              <p className="text-base sm:text-lg leading-relaxed text-white/90">
                We didn’t want just another app. We wanted a Pi-powered playground,
                games, giveaways and challenges that bring people together not just to win,
                but to have fun doing it.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-white/90">
                That’s how OhMyCompetitions came to life. And it hasn’t stopped growing since.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold gradient-text">When the Magic Clicked</h2>
              <p className="text-base sm:text-lg leading-relaxed text-white/90">
                The first time Pi Login worked end-to-end frontend, backend, wallet it felt like magic.
                I nearly Pi-danced in the living room.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-white/90">
                That was the moment it went from this could work to this <em>does</em> work.
              </p>
            </section>

            {/* Current Status */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold gradient-text">Where We Are Now</h2>
              <p className="text-base sm:text-lg leading-relaxed text-white/90">
                🎮 Real games<br />
                🎁 Real prizes<br />
                👥 Real pioneers playing daily<br />
                💡 Real utility for Pi<br />
                🤝 Real connections and friendships
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-white/90">
                Oh My Competitions isn’t just an idea anymore. It’s a platform and a promise
                to reward the Pi community for being early, curious and relentless.
              </p>
            </section>

            {/* Future Vision */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold gradient-text">Where We’re Going</h2>
              <p className="text-base sm:text-lg leading-relaxed text-white/90">
                We’re building towards:<br />
                🌍 Global tournaments<br />
                🛍 Merchant partnerships<br />
                🕹 A full-blown Pi arcade<br />
                🧠 Skill-based games that reward hustle, not luck
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-white/90">
                The goal? To be the most trusted, most entertaining and most community-powered
                competition platform in the Pi Network universe.
              </p>
            </section>

            {/* Thank You */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold gradient-text">Thank You, Pioneers</h2>
              <p className="text-base sm:text-lg leading-relaxed text-white/90">
                To the early testers, patient bug slayers, Pi evangelists and hype crew you built this with us.
                Oh My Competitions is for you. And we’re only getting started.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-white/90">
                The next chapter? You’re in it.
              </p>
            </section>

            {/* CTA */}
            <div className="text-center pt-6">
              <Link href="/forums/general">
                <button className="btn-gradient px-6 py-3 text-lg rounded-full shadow-lg hover:scale-105 transition">
                  Join the Conversation
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

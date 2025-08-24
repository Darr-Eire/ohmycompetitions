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
        <div className="competition-card max-w-3xl w-full bg-white bg-opacity-10 rounded-2xl shadow-lg">

          {/* Banner */}
          <div className="competition-top-banner title-gradient text-center py-6">
            <h2 className="text-2xl font-bold text-black">Our Story</h2>
          </div>

          {/* Body */}
        <div className="p-6 space-y-6">
  <p className="text-base sm:text-lg leading-relaxed text-white/90 px-4 max-w-2xl mx-auto">
    Oh My Competitions was created to bring <span className="text-white">fun, fairness and real rewards to </span> 
     the Pi community. Built by pioneers, for pioneers, our goal is to make competitions exciting, transparent and genuinely rewarding.
  </p>

  <p className="text-base sm:text-lg leading-relaxed text-white/90">
    Hey Pioneers! Here’s how one casual Pi referral turned into a full-on giveaway adventure.
    It’s a story powered by belief, late nights and a lot of Pi.
  </p>

  <section>
    <h2 className="text-xl font-bold gradient-text mt-6">From What’s Pi to Let’s Build This</h2>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      It started like most good stories: a message from a mate Bro, try Pi Network. I thought it was a food app. I joined anyway.
    </p>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      Before long we were mining daily. My partner joined. My family joined. Even the cat tried (unsuccessfully).
    </p>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      We weren’t here for hype. We believed quietly, patiently, obsessively.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-bold gradient-text mt-6">An Idea That Wouldn’t Let Go</h2>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      One late night, somewhere between caffeine and a weird documentary, it clicked:
      <em> “What if we didn’t just earn Pi what if we played for it?”</em>
    </p>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      Whiteboards. Sketches. User flows. Domains. Code. And a suspicious amount of pizza.
      The vision got louder every day.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-bold gradient-text mt-6">Built by Beginners. Fueled by Belief.</h2>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      Did we know how to ship a whole app? Not really. Did we try anyway? Absolutely.
    </p>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      Bugs, crashes, keyboard-smashing all part of it. Every fix felt like a win.
      Not a jackpot… but close it paid in momentum.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-bold gradient-text mt-6">Oh My Competitions Was Born</h2>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      We didn’t want “just another app.” We wanted a Pi-powered playground:
      games, giveaways and challenges that bring people together not just to win,
      but to have fun doing it.
    </p>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      That’s how OhMyCompetitions came to life. And it hasn’t stopped growing since.
    </p>
  </section>

  <section>
    <h2 className="text-xl font-bold gradient-text mt-6">When the Magic Clicked</h2>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      The first time Pi Login worked end-to-end frontend, backend, wallet it felt like magic.
      I nearly Pi-danced in the living room.
    </p>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      That was the moment it went from “this could work” to “this <em>does</em> work.”
    </p>
  </section>

<section>
 <h2 className="text-xl font-bold gradient-text mt-6">Where We Are Now</h2>
<p className="text-base sm:text-lg leading-relaxed text-white/90">
  🎮 Real games<br />
  🎁 Real prizes<br />
  👥 Real pioneers playing daily<br />
  💡 Real utility for Pi<br />
  🤝 Real connections with Pioneers and many friendships along the way<br />
  🔑 We believe in the Pi Network and its pioneers<br />
  🚀 Built around what Pi is looking for in an app real utility, community engagement and opportunities for everyday use
</p>

  <p className="text-base sm:text-lg leading-relaxed text-white/90">
    OhMyCompetitions isn’t just an idea anymore. It’s a platform and a promise
    to reward the Pi community for being early, curious and relentless while
    building genuine connections and lasting friendships along the way.
  </p>
</section>


  <section>
    <h2 className="text-xl font-bold gradient-text mt-6">Where We’re Going</h2>
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

  <section>
    <h2 className="text-xl font-bold gradient-text mt-6">Thank You, Pioneers</h2>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      To the early testers, patient bug slayers, Pi evangelists and hype crew you built this with us.
      Oh My Competitions is for you. And we’re only getting started.
    </p>
    <p className="text-base sm:text-lg leading-relaxed text-white/90">
      The next chapter? You’re in it.
    </p>
  </section>

  <div className="text-center mt-8">
    <Link href="/forums/general">
      <button className="btn-gradient">Join the Conversation</button>
    </Link>
  </div>
</div>

        </div>
      </main>
    </>
  )
}

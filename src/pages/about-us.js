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
          <div className="competition-top-banner title-gradient">
            Our Story
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">

            <p className="font-semibold">
              Hey Pioneers! Here’s how one casual Pi referral spiraled into the wildest giveaway adventure in the Pi ecosystem. Buckle up this one’s powered by belief, late nights and a lot of Pi.
            </p>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">From What's Pi to Let’s Build a Platform</h2>
              <p>
                It started like most good stories: with a ping from a mate.  
                “Bro, try Pi Network.”  
                I thought it was a food app. I joined anyway.
              </p>
              <p>
                Next thing I knew I was mining Pi like it was 1999. My partner joined. My family joined. Even the cat tried to mine once (unsuccessfully).
              </p>
              <p>
                We weren’t in it for the hype. We just believed. Quietly. Patiently. Obsessively.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">An Idea That Wouldn’t Let Go</h2>
              <p>
                One night in the glow of caffeine and bad documentaries it hit me:
                <em>“What if we didn’t just earn Pi? What if we played for it?”</em>
              </p>
              <p>
                That one idea started a chain reaction: whiteboards, sketches, user flows, domain names, late-night coding and one very suspicious pizza addiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Built by Beginners Fueled by Belief</h2>
              <p>
                Did I know how to code an app? Nope.  
                Did I try anyway? Absolutely.
              </p>
              <p>
                Bugs? Crashes? Keyboard-smashing? All part of the journey.  
                But every solved issue felt like winning a jackpot except this one pays in Pi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">OhMyCompetitions Was Born</h2>
              <p>
                We didn’t want just another app. We wanted a Pi-powered playground.  
                One where games, giveaways and challenges bring the community together not just to win but to have fun doing it.
              </p>
              <p>
                That’s how OhMyCompetitions came to life. And honestly? It hasn’t stopped growing since.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">When the Magic Clicked</h2>
              <p>
                The day Pi Login worked for the first time? Absolute magic.  
                Everything connected frontend, backend and wallet. I nearly Pi-danced in the living room.
              </p>
              <p>
                That was the turning point. The moment it all felt real. From “this could work” to “this IS working.”
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Where We Are Now</h2>
              <p>
                🎮 Real games  
                🎁 Real prizes  
                👥 Real pioneers playing daily  
                💡 Real utility for Pi
              </p>
              <p>
                OhMyCompetitions isn’t just an idea anymore. It’s a movement. A platform. A mission to reward Pi believers for being early and being awesome.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Where We're Going</h2>
              <p>
                We’re building more:  
                🌍 Global tournaments  
                🛍 Merchant partnerships  
                🕹 A full-blown Pi arcade  
                🧠 Skill-based games that reward hustle not luck
              </p>
              <p>
                Our goal? To become the most trusted, most entertaining and most community-powered competition platform in the Pi Network universe.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Thank You Pioneer</h2>
              <p>
                To the early testers, patient bug reporters, Pi evangelists and hype crew you built this with us.  
                OhMyCompetitions is for you. And we’re only getting started.
              </p>
              <p>
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

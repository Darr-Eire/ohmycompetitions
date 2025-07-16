// pages/how-we-got-started.js
'use client'

import Head from 'next/head'
import Link from 'next/link'

export default function HowWeGotStarted() {
  return (
    <>
      <Head>
        <title>How We Got Started | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen flex justify-center px-4 text-white">
        <div className="competition-card max-w-3xl w-full bg-white bg-opacity-10 rounded-2xl shadow-lg">

          {/* Banner */}
          <div className="competition-top-banner title-gradient">
            How We Got Started
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">

            <p className="font-semibold">
              Hey Pioneers! This is the story of how we went from "What's Pi?" to "Let's give away Pi prizes to the world!" Buckle up.
            </p>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">It All Started With a Ping</h2>
              <p>
                One day, a mate says: “Bro, try Pi Network.”  
                Me: “Sounds like a new pizza place.”  
                But I joined anyway. Before long, I was mining Pi like it was Pokémon cards in 1999. My partner joined. My family joined. Even the cat tried to tap the phone screen once.
              </p>
              <p>
                It felt like being early to a secret party no hype, no noise, just quiet belief that someday, it would matter.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">That Annoying Idea You Can’t Unsee</h2>
              <p>
                One night, mid-coffee and too many late YouTube videos, the lightbulb went off: <em>“What if we didn’t just stack Pi? What if we spun it, played with it, and maybe even lost a few along the way?”</em>
              </p>
              <p>
                That idea haunted me. So I scribbled a note. That turned into a wild sketch. That sketch turned into... well, lots of late nights, pizza boxes, and questionable sanity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Learning Curve or Rollercoaster?</h2>
              <p>
                Did I know how to code an app? Nope.  
                Did that stop me? Also nope.
              </p>
              <p>
                I dove into the deep end bug after bug, crash after crash. My browser had more StackOverflow tabs open than stars in the sky. But every late-night victory felt like winning a Pi jackpot.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">The Birth of OhMyCompetitions</h2>
              <p>
                We didn’t want just another boring dApp. We wanted something that made you jump out of bed, yell "Let's win some Pi!" and annoy your neighbors (sorry, neighbors).
              </p>
              <p>
                Games. Giveaways. Challenges. Real Pi utility. OhMyCompetitions was born and it refuses to sleep.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">The First "Whoa" Moment</h2>
              <p>
                When Pi Login finally worked? Pure magic. Not just because it worked (though that was a miracle), but because everything connected, frontend, backend and that one button that almost gave me a heart attack.
              </p>
              <p>
                That day, it went from “crazy idea” to “we’re actually doing this.” I nearly Pi-danced in my living room.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Where We Are Today</h2>
              <p>
                Real Pi prizes. Real players. Real community.  
                And we’re just warming up.
              </p>
              <p>
                OhMyCompetitions is no longer just an idea on my head it’s a living, breathing Pi playground. Built <strong>by Pioneers, for Pioneers.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Our Future? Even Wilder</h2>
              <p>
                We’re dreaming big global tournaments, merchant partners, even a full Pi-powered arcade (imagine).
              </p>
              <p>
                Our mission become the most trusted, most fun, and most community-powered competition platform in the Pi universe.
              </p>
              <p>
                We’re just getting started. The question is Are You In?
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Thank You for the Ride</h2>
              <p>
                To every early tester, every friend who believed, and every Pioneer who cheered from the sidelines thank you.  
                We built this for you. And we’re only scratching the surface.
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

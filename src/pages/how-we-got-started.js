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
              Welcome, Pioneers! Our journey with Pi Network started just like yours — with a simple invite from a friend... and a bit of curiosity.
            </p>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">The Day Mining Started</h2>
              <p className="text-white">
                One day, a friend said, “Check this out — it’s called Pi Network.” I thought: why not? Next thing you know, I was mining daily. Then my partner. Then my family. Even my neighbor’s dog almost got signed up (not kidding).
              </p>
              <p className="text-white">
                It felt like we were early to something big — like finding Bitcoin at the beginning, but without the hype. I didn’t know what Pi would become, but I knew I wanted to be part of it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">The Random Idea That Wouldn’t Go Away</h2>
              <p className="text-white">
                One night, it just hit me: <em>“What if there was a fun way to actually use Pi?”</em>  
                Not just stack it, but spin it, win it, compete with it.  
                A full-blown competitions app — built just for Pioneers.
              </p>
              <p className="text-white">
                That spark turned into a scribbled note. That note became a prototype. That prototype? It became a mission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Learning the Hard Way</h2>
              <p className="text-white">
                The only problem? I had no clue how to build a real app. So I did what every mad founder does — I learned everything from scratch.  
                Late nights. YouTube tutorials. Crashed code. Broken logic. StackOverflow tabs everywhere.
              </p>
              <p className="text-white">
                Half the time I didn’t even know if it would work. But every bug fixed, every feature built — it got us closer to launch.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">The Birth of OhMyCompetitions</h2>
              <p className="text-white">
                I didn’t want just another dApp. I wanted a Pi-powered experience that made people excited to come back every day.  
                Competitions. Giveaways. Mini-games. Real utility. That’s what OhMyCompetitions became — and it’s still growing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">The First Win</h2>
              <p className="text-white">
                When Pi Login finally worked... it was surreal. Not because of the button — but because all the parts came together.  
                Frontend. Backend. SDK auth. A real user session. It felt like a rocket finally clearing the launchpad.
              </p>
              <p className="text-white">
                That one success made it real. This wasn’t a side project anymore. It was Pi in motion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Where We Are Now</h2>
              <p className="text-white">
                Months later — here we are. Real Pi prizes. Real users. A growing community.  
                And we’re just getting warmed up.
              </p>
              <p className="text-white">
                OhMyCompetitions is now more than an idea. It’s a home for Pi-powered entertainment — built <strong>by Pioneers, for Pioneers.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">Where We’re Headed</h2>
              <p className="text-white">
                We’re building toward something bigger: full tournaments, decentralized prize pools, merchant partnerships — and maybe even a Pi-powered arcade.
              </p>
              <p className="text-white">
                Our mission? To become the most trusted competition platform in the Pi ecosystem — open to all Pioneers, developers, creators, and dreamers.
              </p>
              <p className="text-white">
                The journey is just beginning.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold gradient-text mt-6">A Final Thank You</h2>
              <p className="text-white">
                To everyone who believed, played, tested, or just cheered us on — thank you. We built this for you. And we’re just getting started.
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

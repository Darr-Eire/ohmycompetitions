// pages/how-we-got-started.js
'use client'

import Head from 'next/head'

export default function HowWeGotStarted() {
  return (
    <>
      <Head>
        <title>How We Got Started | OhMyCompetitions</title>
      </Head>

      <main className="flex justify-center bg-white py-8 px-4 min-h-screen">
        <div className="competition-card max-w-3xl w-full">
          
          {/* Banner */}
          <div className="competition-top-banner bg-blue-600 text-white text-center px-4 py-2">
            🚀 How We Got Started
          </div>


          {/* Body */}
          <div className="p-6 space-y-6 text-left text-black">
            <p>
              <strong>
                Welcome, Pioneers! Our journey with Pi Network started just like yours — with a simple invite from a friend... and a bit of curiosity. 🔥
              </strong>
            </p>

            <h2 className="font-bold text-black mt-6">
              Finding Pi — And Believing in It Early
            </h2>
            <p>
              One day, a friend sent me a message: “Hey, check this out. It's called Pi Network!”  
              Next thing you know — not just me, but my partner, my family, even my neighbor’s dog (okay maybe not the dog) were all mining Pi. 🐶📱
            </p>
            <p>
              It felt like we had discovered treasure before the world knew about it. I became the “Pi Guru” of the family — everyone asking me questions I barely knew the answers to yet. 😅
            </p>

            <h2 className="font-bold text-black mt-6">
              The Great KYC Race
            </h2>
            <p>
              If you were around during KYC time — you know. The stress was real. We were racing the clock, helping everyone get verified before Mainnet launched.  
              “Why is my KYC not showing?” “What is Pi Browser?” “Can you do it for me?”  
              Somehow, I became tech support for half the family. 🤣
            </p>

            <h2 className="font-bold text-black mt-6">
              Learning From Scratch
            </h2>
            <p>
              The dream was simple:<br/>
              <em>Build something awesome for Pioneers.</em><br/>
              The problem? I had no idea how to build anything!  
              So it began — late nights, YouTube tutorials, StackOverflow rabbit holes... fixing bugs at 3 AM with bloodshot eyes. 💻☕
            </p>

            <h2 className="font-bold text-black mt-6">
              The Birth of OhMyCompetitions
            </h2>
            <p>
              We wanted to create a place where Pi wasn’t just sitting — it was moving, winning, exciting!  
              Giveaways, mini-games, live competitions — and a way to make Pi valuable through community and fun.  
              That's how <em>OhMyCompetitions</em> was born — built <strong>by Pioneers, for Pioneers.</strong> 🚀
            </p>

            <h2 className="font-bold text-black mt-6">
              The First Wins
            </h2>
            <p>
              The first time Pi Login worked... I almost cried. The first time the Scratch Card flipped? I was doing laps around the room.  
              My family’s feedback? “Not bad for someone who couldn’t install a printer last year!” 😂
            </p>

            <h2 className="font-bold text-black mt-6">
              Where We’re Headed
            </h2>
            <p>
              We’re just getting started.  
              Bigger prizes, bigger events, real Pi-based tournaments, and maybe even a full Pioneer arcade someday. 🎯🎮  
              Our goal? <strong>Make OhMyCompetitions the heart of Pi fun.</strong>
            </p>

            <h2 className="font-bold text-black mt-6">
              A Final Thank You
            </h2>
            <p>
              Thank you to everyone who plays, shares, enters, or just believes in the dream.  
              We couldn't have made it without you.  
              See you at the next draw! 🥧🚀
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

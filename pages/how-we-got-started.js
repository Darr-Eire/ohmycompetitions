'use client'

import Link from 'next/link'

export default function HowWeGotStarted() {
  return (
    <main className="page">
      <div className="competition-card max-w-3xl w-full">

        {/* Banner */}
        <div className="competition-top-banner text-center">
          🚀 How We Got Started
        </div>

        {/* Divider */}
        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-6 text-left text-gray-700">

          {/* 1. Intro */}
          <p>
            Welcome, Pioneers! Our journey with Pi Network started just like yours — with a simple invite from a friend... and a bit of curiosity. 🔥
          </p>

          {/* 2. The Early Days */}
          <h2 className="font-semibold text-blue-600 mt-6">Finding Pi — And Believing in It Early</h2>
          <p>
            One day, a friend sent me a message: "*Hey, check this out. It's called Pi Network!*"  
            Next thing you know — not just me, but my partner, my family, even my neighbor’s dog (okay maybe not the dog) were all mining Pi. 🐶📱
          </p>
          <p>
            It felt like we had discovered treasure before the world knew about it. I became the “Pi Guru” of the family — everyone asking me questions I barely knew the answers to yet. 😅
          </p>

          {/* 3. The KYC Race */}
          <h2 className="font-semibold text-blue-600 mt-6">The Great KYC Race</h2>
          <p>
            If you were around during KYC time — you know. The stress was real. We were racing the clock, helping everyone get verified before Mainnet launched.  
            "*Why is my KYC not showing?*" "*What is Pi Browser?*" "*Can you do it for me?*"  
            Somehow, I became tech support for half the family. 🤣
          </p>

          {/* 4. Learning to Build */}
          <h2 className="font-semibold text-blue-600 mt-6">Learning From Scratch</h2>
          <p>
            The dream was simple:  
            *Build something awesome for Pioneers.*  
            The problem? I had no idea how to build anything!  
            So it began — late nights, YouTube tutorials, StackOverflow rabbit holes... fixing bugs at 3AM with bloodshot eyes. 💻☕
          </p>

          {/* 5. OhMyCompetitions is Born */}
          <h2 className="font-semibold text-blue-600 mt-6">The Birth of OhMyCompetitions</h2>
          <p>
            We wanted to create a place where Pi wasn’t just sitting — it was moving, winning, exciting!  
            Giveaways, mini-games, live competitions — and a way to make Pi valuable through community and fun.  
            That's how *OhMyCompetitions* was born — built **by Pioneers, for Pioneers.** 🚀
          </p>

          {/* 6. Early Wins and Feedback */}
          <h2 className="font-semibold text-blue-600 mt-6">The First Wins</h2>
          <p>
            The first time Pi Login worked... I almost cried. The first time the Scratch Card flipped? I was doing laps around the room.  
            My family’s feedback? "*Not bad for someone who couldn’t install a printer last year!*" 😂
          </p>

          {/* 7. The Vision Moving Forward */}
          <h2 className="font-semibold text-blue-600 mt-6">Where We're Headed</h2>
          <p>
            We’re just getting started.  
            Bigger prizes, bigger events, real Pi-based tournaments, and maybe even a full Pioneer arcade someday. 🎯🎮  
            Our goal? **Make OhMyCompetitions the heart of Pi fun.**
          </p>

          {/* 8. Final Thanks */}
          <h2 className="font-semibold text-blue-600 mt-6">A Final Thank You</h2>
          <p>
            Thank you to everyone who plays, shares, enters, or just believes in the dream.  
            We couldn't have made it without you.  
            See you at the next draw! 🥧🚀
          </p>

          {/* Back Home Button */}
          <div className="text-center mt-8">
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded">
                ← Back to Home
              </button>
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}

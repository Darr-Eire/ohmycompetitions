'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HeroBanner() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date('2025-05-28T22:00:00Z');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
   <section className="pt-4 sm:pt- pb-0 text-center max-w-4xl mx-auto px-4">
  {/* Tagline */}
  <p className="text-lg uppercase tracking-widest text-white font-semibold mb-2">
    Enter the Ultimate Pi Competition
  </p>

  {/* Main Prize Display */}
  <h1 className="pulse-glow text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
    250,000 Pi
  </h1>

  {/* CTA */}


  {/* Prize Summary */}
  <p className="text-white/90 text-lg italic mb-4">
    Main Grand Prize — Paid in Pi Equivalent
  </p>

  {/* Prize Tiers */}
  <div className="text-white/90 text-lg sm:text-base mb-6 space-y-1">
    <p><strong> 1<sup>st</sup> Prize:</strong> 250,000 Pi</p>
    <p><strong> 2<sup>nd</sup> Prize:</strong> 25,000 Pi</p>
    <p><strong> 3<sup>rd</sup> – 999<sup>th</sup> Place:</strong> Smaller Pi & Prizes to be WON</p>
    <p><strong> Mystery Draw:</strong> Surprise reward for 5 random pioneers</p>
     <p><strong> Enter Now: </strong> Only 3.14 Pi</p>
  </div>

  <div className="mb-6">
    <Link href="/ticket-purchase/main-prize">
      <button className="comp-button w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg hover:scale-105 transition-transform duration-200">
        Enter Now
      </button>
    </Link>
  </div>

      {/* Countdown Timer */}
      <div className="flex justify-center gap-4 sm:gap-6 font-mono text-cyan-300">
        {Object.entries(timeLeft).map(([label, value]) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-2xl sm:text-4xl font-extrabold leading-tight drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]">
              {value.toString().padStart(2, '0')}
            </span>
            <span className="uppercase text-xs sm:text-sm tracking-widest text-white/70">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

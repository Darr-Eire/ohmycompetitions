'use client';

import Link from 'next/link';

export default function HomeInfoSections() {
  return (
    <section className="text-white px-4 py-16 space-y-16 max-w-5xl mx-auto">
      
      {/* HOW IT WORKS */}
      <div>
        <h2 className="text-3xl font-bold gradient-text mb-6">How Our Competitions Work</h2>
        <div className="space-y-4 text-lg leading-relaxed text-gray-300">
          <p><strong>🚀 Join in 3 Easy Steps:</strong></p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li><strong>Log in with Pi Browser:</strong> No passwords, just Pi login.</li>
            <li><strong>Browse Active Competitions:</strong> Choose from tech, fashion, daily giveaways, and more.</li>
            <li><strong>Enter & Win:</strong> Buy tickets using Pi. Winners picked fairly and paid instantly.</li>
          </ul>

          <p><strong>🎯 Proof of Fairness:</strong> Every winner is selected using a transparent algorithm tied to on-chain data. View ticket IDs, winner lists, and payout history publicly.</p>

          <p><strong>💰 Instant Payouts:</strong> We auto-pay winners in Pi directly to their wallet after each draw. No delays, no middlemen.</p>

          <div className="flex gap-6 mt-4">
            <Link href="/fairness" className="text-cyan-400 hover:underline">See How Fairness Works</Link>
            <Link href="/winners" className="text-cyan-400 hover:underline">View Past Winners</Link>
          </div>
        </div>
      </div>

      {/* WHO IT'S FOR */}
      <div>
        <h2 className="text-3xl font-bold gradient-text mb-6">Made for Every Pioneer</h2>
        <div className="space-y-4 text-lg text-gray-300">
          <p>Whether you're a casual dreamer or a serious competitor, Oh My Competitions is built for you:</p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>🎮 <strong>Casual Pi Users</strong> – Join low-cost games and win real Pi.</li>
            <li>💼 <strong>Brands & Creators</strong> – Launch giveaways to grow your reach and reward fans.</li>
            <li>👥 <strong>Engaged Pioneers</strong> – Participate in exclusive drops, free ticket events, and voucher giveaways.</li>
          </ul>
        </div>
      </div>

      {/* VISION */}
      <div>
        <h2 className="text-3xl font-bold gradient-text mb-6">A Real Pi Economy</h2>
        <div className="text-lg text-gray-300 space-y-4">
          <p>💎 <strong>500,000+ Pi in Rewards = Real Impact</strong></p>
          <p>Our goal? Circulate over <strong>500,000 Pi in verified rewards by 2026</strong>. That means thousands of winners, growing real utility, and a living, breathing Pi economy.</p>
          <p>Every Pi you win here can be used, gifted, or spent. You're not just playing — you're helping grow the network.</p>
        </div>
      </div>

      {/* LEGAL LINKS */}
      <div className="pt-12 border-t border-cyan-700 text-center text-sm text-gray-400">
        <p>
          <Link href="/privacy-policy" className="hover:underline mr-4">Privacy Policy</Link>
          <Link href="/terms" className="hover:underline mr-4">Terms of Use</Link>
          <Link href="/fairness" className="hover:underline mr-4">Fairness & Transparency</Link>
          <Link href="/data-policy" className="hover:underline">Data Handling</Link>
        </p>
      </div>

    </section>
  );
}

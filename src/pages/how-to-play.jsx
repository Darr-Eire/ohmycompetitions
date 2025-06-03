'use client'

import Link from 'next/link'
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaDiscord,
} from 'react-icons/fa'

export default function HowToPlay() {
  return (
    <main className="app-background min-h-screen flex justify-center items-start px-4 py-12 text-white">
      <div className="competition-card max-w-3xl w-full bg-white bg-opacity-10 rounded-2xl shadow-lg">
        {/* Banner */}
      <div className="competition-top-banner title-gradient text-white">
  How To Play
</div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p>
            Welcome to <span className="gradient-text font-semibold">OhMyCompetitions</span> — where your Pi turns into real prizes every single day.
          </p>

          {/* Getting Started */}
          <section>
            <h2 className="text-lg font-bold gradient-text mt-6 mb-2">Getting Started</h2>
            <ul className="list-disc list-inside space-y-4 text-white">
              <li>Log in using your Pi credentials.</li>
              <li>Verify your Pi Wallet connection for secure transactions.</li>
            </ul>
          </section>

          {/* Entering Competitions */}
          <section>
            <h2 className="text-lg font-bold gradient-text mt-6 mb-2">How To Enter Competitions</h2>
            <ul className="list-disc list-inside space-y-4 text-white">
              <li>Browse competitions on the homepage or competitions page.</li>
              <li>Select the competition you wish to enter.</li>
              <li>Pay the entry fee directly using your Pi wallet.</li>
              <li>Your entry will be confirmed instantly and shown in "My Entries".</li>
            </ul>
          </section>

          {/* Draw & Winners */}
          <section>
            <h2 className="text-lg font-bold gradient-text mt-6 mb-2">Winning & Prize Draws</h2>
            <ul className="list-disc list-inside space-y-4 text-white">
              <li>Each competition has a countdown timer displayed clearly.</li>
              <li>Winners are drawn automatically and fairly via random selection.</li>
              <li>Notifications will be sent instantly when winners are picked.</li>
              <li>Prizes will be delivered either as Pi transfers or real-world items depending on the competition type.</li>
            </ul>
          </section>

          {/* Bonus Features */}
          <section>
            <h2 className="text-lg font-bold gradient-text mt-6 mb-2">Daily Bonus Games</h2>
            <ul className="list-disc list-inside space-y-4 text-white">
              <li><strong>Spin The Wheel:</strong> Daily spins for bonus Pi and prizes.</li>
              <li><strong>Pi Cash Code:</strong> Weekly jackpot codes for huge rollover prizes.</li>
              <li><strong>Scratch & Win:</strong> Instant scratch cards for extra entries.</li>
            </ul>
          </section>

          {/* Fair Play */}
          <section>
            <h2 className="text-lg font-bold gradient-text mt-6 mb-2">Fair Play & Security</h2>
            <ul className="list-disc list-inside space-y-4 text-white">
              <li>All draws are transparent, timestamped, and verifiable.</li>
              <li>Multiple entries allowed (where applicable), no bots or automation permitted.</li>
              <li>All Pi transactions secured through the official Pi SDK integration.</li>
            </ul>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-center text-lg font-semibold gradient-text mt-6 mb-2">Need Help?</h2>
            <p className="text-center">
              Visit our <Link href="/help-support" className="gradient-text underline">Help & Support</Link> center for full assistance.
            </p>
          </section>

          {/* Connect */}
          <section>
            <h2 className="text-center text-lg font-semibold gradient-text mt-8 mb-2">Connect with Us</h2>
            <div className="flex justify-center space-x-4 mb-4">
              {[FaTwitter, FaFacebookF, FaInstagram, FaDiscord].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition"
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

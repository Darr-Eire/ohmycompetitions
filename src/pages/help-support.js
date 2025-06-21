'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaDiscord,
} from 'react-icons/fa'

const faqSections = [
  {
    title: 'General Frequently Asked Questions',
    items: [
      ['How do I enter competitions?', 'Click the “Enter Now” button on any competition. If it’s a Pi competition, you’ll be asked to confirm a small Pi payment through the Pi Network SDK.'],
      ['Is joining free?', 'Yes! We offer a mix of free and paid competitions. Free entries are open to all users, while premium entries require a small Pi entry fee.'],
      ['How do I pay with Pi?', 'Simply click to enter a competition that requires Pi, and you’ll be prompted to confirm the transaction through the official Pi payment popup. Make sure you\'re logged into your Pi Wallet.'],
      ['Where are my tickets?', 'You can view all your active and past tickets on the “My Entries” page, accessible after logging in.'],
      ['How are winners chosen?', 'All winners are picked using a fair and random selection process once the competition ends.'],
      ['Can I try again if I don’t win?', 'Yes! You can enter multiple competitions weekly, including retrying mini-games and challenges like the 3.14 Stopwatch game.'],
      ['Is the platform decentralized?', 'We are actively building toward decentralization. Our payment system is already integrated with the Pi Network, and future updates will use smart contracts for prize verification and randomness.'],
      ['Is my Pi safe?', 'Yes. All payments go through the official Pi Network SDK. We never store your private keys or Pi wallet data.'],
      ['How do I contact support?', 'Reach out any time via email at ohmycompetitions@gmail.com or message us on Instagram, X (Twitter), or Discord.'],
    ]
  },
  {
    title: 'Pi Cash Code — FAQ',
    items: [
      ['What is Pi Cash Code?', 'Pi Cash Code is a weekly event where one random winner must submit a secret code to claim a Pi prize.'],
      ['When does it happen?', 'Every Monday at 3:14 PM, the secret code is revealed. The winner is selected Friday at 3:14 PM.'],
      ['How long do I have to claim?', 'Winners have exactly 31 minutes and 4 seconds to submit the correct code after the winner announcement.'],
      ['What if the winner doesn\'t respond?', 'The prize rolls over and doubles for the following week, increasing the total Pi up for grabs.'],
      ['Where do I enter the code?', 'If selected, you’ll see the input field on the Pi Cash Code page during your claim window.'],
      ['What if I miss the window?', 'Unfortunately, unclaimed prizes cannot be recovered. Set reminders and check back every Friday!'],
    ]
  },

  {
    title: 'How to Claim if You Win',
    items: [
      ['I won a competition. How do I claim?', 'You’ll receive an in-app notification. If it’s Pi Cash Code, enter the correct code before the timer expires.'],
      ['Do I need to verify my wallet?', 'No wallet verification is required. All winnings are paid via the Pi SDK to your linked wallet.'],
      ['When is Pi sent?', 'Pi is sent immediately upon winning for standard draws. For Pi Cash Code, you must first submit the code to trigger the payout.'],
      ['What if I win but don’t respond?', 'If the prize isn’t claimed in time, it rolls over or is re-drawn based on the event rules.'],
    ]
  },
]

function Accordion({ title, items, isOpen, onClick, searchTerm }) {
  const filteredItems = items.filter(([q, a]) =>
    q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (filteredItems.length === 0) return null

  return (
    <div className="border border-white/20 rounded-xl bg-white/5 overflow-hidden">
      <button
        onClick={onClick}
        className="w-full text-left p-4 font-semibold gradient-text text-lg flex justify-between items-center"
      >
        {title}
        <span className="text-white text-xl">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <ul className="p-4 list-disc list-inside space-y-4 text-white">
          {filteredItems.map(([q, a], i) => (
            <li key={i}>
              <strong>{q}</strong><br />
              {a}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function HelpSupport() {
  const [openIndex, setOpenIndex] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <main className="app-background min-h-screen flex justify-center px-4 text-white">
      <div className="competition-card max-w-3xl w-full bg-white bg-opacity-10 rounded-2xl shadow-lg">
        <div className="competition-top-banner title-gradient">Help & Support</div>

        <div className="p-6 space-y-6">
          <p>Welcome to our Help & Support Center. We’re here to assist you with any questions or issues!</p>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded bg-white/10 text-white"
          />

          {/* Contact Information */}
          <section>
            <h2 className="text-lg font-bold gradient-text mt-6 mb-2">Contact Information</h2>
            <ul className="flex flex-col gap-3 text-white">
              <li className="flex justify-between flex-wrap"><strong>Email</strong><span className="text-right">ohmycompetitions@gmail.com</span></li>
              <li className="flex justify-between flex-wrap"><strong>Phone</strong><span className="text-right">+353 87 1365782</span></li>
              <li className="flex justify-between flex-wrap"><strong>Address</strong><span className="text-right">Dublin, Ireland</span></li>
              <li className="flex justify-between flex-wrap"><strong>Pi Username</strong><span className="text-right">@darreire2020</span></li>
              <li className="flex justify-between flex-wrap"><strong>Instagram</strong><a href="https://instagram.com/_ohmycompetitions" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline text-right">OhMyCompetitions</a></li>
              <li className="flex justify-between flex-wrap"><strong>Discord</strong><a href="https://discord.gg/YOUR_DISCORD_INVITE" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline text-right">ohmycompetitions_</a></li>
              <li className="flex justify-between flex-wrap"><strong>X</strong><a href="https://x.com/OM_Competitions" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline text-right">@OhMyCompetitions</a></li>
<li className="flex justify-between flex-wrap">
  <strong>Facebook</strong>
  <a
    href="https://www.facebook.com/profile.php?id=61577406478876"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-300 hover:underline text-right"
  >
    Oh My Competitions
  </a>
</li>
            </ul>
          </section>

          {/* FAQ Accordion */}
          <section className="space-y-6">
            {faqSections.map((section, index) => (
              <Accordion
                key={index}
                title={section.title}
                items={section.items}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                searchTerm={searchTerm}
              />
            ))}
          </section>

          {/* Connect */}
          <section>
            <h2 className="text-center text-lg font-semibold gradient-text mb-2">Connect with Us</h2>
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

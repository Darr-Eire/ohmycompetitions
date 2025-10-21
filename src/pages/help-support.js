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
    ['How does Oh My Competitions work?', 
     'You sign in using your Pi account, choose a competition and either enter for free or use Pi to buy tickets. Winners are picked at random after the countdown ends and Pi prizes are paid out via the official Pi SDK. Bonus games, daily streaks and referral rewards also boost your chances!'],
    ['How do I enter competitions?', 
     'Click the “Enter Now” button on any competition. If it’s a Pi competition, you’ll be asked to confirm a small Pi payment through the Pi Network SDK.'],
    ['Is joining free?', 
     'Yes! We offer a mix of free and paid competitions. Free entries are open to all users, while premium entries require a small Pi entry fee.'],
    ['How do I Pay With π?', 
     'Simply click to enter a competition that requires Pi and you’ll be prompted to confirm the transaction through the official Pi payment popup. Make sure you\'re logged into your Pi Wallet.'],
    ['Where are my tickets?', 
     'You can view all your active and past tickets on the “My Entries” page, accessible after logging in.'],
    ['How are winners chosen?', 
     'All winners are picked using a fair and random selection process once the competition ends.'],
    ['Can I try again if I don’t win?', 
     'Yes! You can enter multiple competitions weekly, including retrying mini-games and challenges like the 3.14 Stopwatch game.'],
    ['Is the platform decentralized?', 
     'We are actively building toward decentralization. Our payment system is already integrated with the Pi Network and future updates will use smart contracts for prize verification and randomness.'],
    ['Is my Pi safe?', 
     'Yes. All payments go through the official Pi Network SDK. We never store your private keys or Pi wallet data.'],
    ['How do I contact support?', 
     'Reach out any time via email at ohmycompetitions@gmail.com or message us on Instagram, X (Twitter), or Discord.'],
  ]
},
{
  title: 'Using Oh My Competitions',
  items: [
    ['Who can join Oh My Competitions?', 
     'Anyone with a Pi account can play! Whether you’re a casual Pioneer or a seasoned Pi believer, OMC is open to players worldwide. All you need is a verified Pi login to get started.'],

    ['Is this legit or just another Pi scam?', 
     'Great question. OMC is 100% powered by the official Pi Network SDK. All payments are made through Pi’s secure wallet and every winner is verifiable on the app — no bots, no fake giveaways, no false promises.'],

    ['How are winners picked?', 
     'All draws use a fair randomization process. We don’t control the outcome — it’s automated and verified. Once the timer ends, winners are chosen transparently and shown publicly.'],

    ['What makes OMC different from other Pi apps?', 
     'We don’t just hand out Pi — we build hype, community and real value. From Try Your Skill games and Pi Cash Code to referral bonuses and high-stakes giveaways, OMC creates an engaging, fair experience for everyone.'],

    ['Can I win without spending Pi?', 
     'Yes! We offer free daily games, mystery draws and social competitions. Every Pioneer, no matter how much Pi you have, can win something — even instantly.'],

    ['How do I know if a competition is live?', 
     'Each competition shows a live countdown and ticket availability. If it’s live, you’ll see an “Enter Now” button. You can also filter by “Live,” “Upcoming,” and “Closed” competitions.'],

    ['What happens if a competition doesn’t sell all tickets?', 
     'We still draw a winner at the scheduled end time. If the prize pool was based on ticket sales, it adjusts automatically. No delays, no excuses — someone still wins.'],

    ['How do I invite friends?', 
     'Use your referral link on the dashboard to share with friends. When they join and enter their first comp, you both get free entries. More invites = more rewards.'],

    ['How is my Pi protected?', 
     'Your Pi never touches our servers. All transactions use the official Pi payment SDK and we never access your wallet keys or private info. We prioritize security, fairness and transparency.'],

    ['Do I need to install anything?', 
     'No app install is required. Just visit ohmycompetitions.com from any device and sign in using your Pi account — that’s it. Mobile-optimized and ready to go.'],

    ['What are “Try Your Skill” games?', 
     'These are free daily mini-games like “Match The Pi Code” and “Hack The Vault.” They’re fun, fast and can reward you instantly with Pi, bonus entries, or even hidden prize drops.'],

    ['Can I win more than once?', 
     'Absolutely. We’ve had users win multiple times across different draws and mini-games. As long as you stay active, you stay eligible.'],

    ['What if I get disconnected during payment?', 
     'If the payment isn’t confirmed by the Pi SDK, it won’t go through — and you won’t lose Pi. Just refresh and try again.'],

    ['Can I play if I’m not KYC verified?', 
     'Yes, you can enter competitions and win. However, for Pi payouts, your Pi wallet must be eligible to receive transactions, which typically means KYC’d.'],

    ['What if my country doesn’t support shipping?', 
     'For physical prizes, if we can’t ship to your country, we’ll offer an alternative prize or Pi equivalent instead — we’ll always make it fair.'],

    ['Do competitions ever get cancelled?', 
     'Very rarely. If we ever need to cancel a comp, all Pi entries are refunded automatically and the reason is transparently shown on the competition page.']
  ]
},



{
  title: 'Pi Cash Code — FAQ',
  items: [
    ['What is Pi Cash Code?', 
     'Pi Cash Code is a weekly high-stakes giveaway where one Piioneer is randomly selected to claim a Pi prize — but only if they submit the correct secret code in time. It’s fast, intense and 100% real.'],
    
    ['How does it work?', 
     'Every week, we pick one winner randomly from all eligible participants. A unique secret code is revealed and the chosen winner must enter it on the Pi Cash Code page within a strict time window.'],

    ['When does it happen?', 
     'The secret code is revealed every **Monday at 3:14 PM GMT** and the winning Piioneer is selected the following **Friday at 3:14 PM GMT**. Keep your notifications on — your name could come up!'],

    ['How long do I have to claim?', 
     'You have **exactly 31 minutes and 4 seconds** (a nod to 3.14 Pi) to enter the secret code after the winner announcement. If you’re the winner, a special input box will appear for you to submit it.'],

    ['Where do I enter the code?', 
     'Go to the official Pi Cash Code page while logged in. If you’re the selected winner, the input field will automatically appear — but only during your claim window.'],

    ['What if I miss the window?', 
     'If you don’t enter the code in time, the prize is forfeited — there are no extensions. We recommend setting an alarm for every Friday at 3:14 PM and checking back just in case.'],

    ['What happens if nobody claims the prize?', 
     'If the weekly prize goes unclaimed, it **rolls over and doubles** for the next week. This means bigger and bigger Pi jackpots until someone grabs the code and wins it all.'],

    ['How do I become eligible?', 
     'To be eligible, make sure you’ve entered at least one competition that week or logged in and played any “Try Your Skill” game. That’s it — no extra steps needed.'],

    ['Can I win more than once?', 
     'Yes! Every week is a new chance. As long as you remain active and engaged, you’re always eligible to be chosen again.'],

    ['Is it really random?', 
     'Yes — winners are picked using a transparent and tamper-proof randomization process and the code claim mechanism is triggered directly through the app’s backend for fairness.'],
  ]
},


 {
  title: 'How to Claim if You Win',
  items: [
    ['I won a competition. How do I claim?', 
     'First off — congrats! 🎉 If you win, you’ll get a real-time in-app notification. Head to your dashboard to view the winning competition. If it’s a Pi Cash Code win, you’ll need to enter the correct code before your claim timer runs out. For standard competitions, Pi is sent automatically.'],

    ['Do I need to verify my wallet?', 
     'No additional wallet verification is required. Since you login with the official Pi Network, your Pi Wallet is already securely linked. All payouts are processed via the Pi SDK.'],

    ['When is Pi sent?', 
     'For normal competitions, Pi is transferred directly to your linked wallet **within moments** of the competition ending. For Pi Cash Code, the prize is only released after you submit the correct code within the 31:04 time window.'],

    ['What if I win but don’t respond?', 
     'If you miss your chance to claim (especially for time-sensitive events like Pi Cash Code), the prize either rolls over or is awarded to a backup winner depending on the rules. Be sure to turn on app notifications so you never miss out!'],

    ['Can I claim from anywhere in the world?', 
     'Yes — digital Pi prizes can be claimed globally. For physical items, we’ll work with you to arrange shipping or an equivalent payout where possible.'],

    ['Where can I track my winnings?', 
     'Your full history — including tickets, entries, wins and prize status — can be viewed in your "My Entries" dashboard anytime you’re logged in.'],
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

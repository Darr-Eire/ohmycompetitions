import Link from 'next/link';

const features = [
  {
    icon: '💎',
    title: 'Daily Competitions',
    description: 'Enter daily challenges using Pi and win guaranteed prizes — new winners every day!',
    link: '/competitions/daily',
    cta: 'Learn More →',
  },
  {
    icon: '📲',
    title: 'Pi Cash Code',
    description: 'Crack the code and unlock instant Pi rewards. Only the fastest Pioneers win.',
    link: '/try-your-luck/pi-cash-code',
    cta: 'Try It Now →',
  },
  {
    icon: '🎁',
    title: 'Crypto Giveaways',
    description: 'Win real Pi and other crypto prizes in free-to-enter giveaways open to all Pioneers.',
    link: '/competitions/crypto-giveaways',
    cta: 'See Prizes →',
  },
  {
    icon: '⚔️',
    title: 'Pi Battles',
    description: 'Battle it out in head-to-head Pi duels. Highest streaks, fastest times, and boldest moves win big.',
    link: '/pi-battles',
    cta: 'Join a Battle →',
  },
  {
    icon: '🎮',
    title: 'Mini Games',
    description: 'Compete in fast-paced arcade and puzzle games to win instant Pi rewards every day.',
    link: '/try-your-luck',
    cta: 'Play Now →',
  },
];

export default function FeatureSection() {
  return (
    <section className="mt-10 px-4">
      <h2 className="text-3xl font-bold text-center text-white mb-6">Explore Our Core Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-[#0f172a] border border-cyan-500 rounded-xl p-6 shadow-xl hover:scale-105 transition">
            <div className="text-4xl mb-2">{feature.icon}</div>
            <h3 className="text-xl font-bold text-white mb-1">{feature.title}</h3>
            <p className="text-gray-300 mb-4">{feature.description}</p>
            <Link href={feature.link} className="text-cyan-400 hover:underline">
              {feature.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

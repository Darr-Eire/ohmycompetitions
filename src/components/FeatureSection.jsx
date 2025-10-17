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
    description: 'Compete in skill-based games. Score high, top the leaderboard, and earn Pi prizes!',
    link: '/mini-games',
    cta: 'Play Now →',
  },
];

export default function FeatureSection() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {features.map((feature, index) => (
        <div key={index} className="glass glow p-6 rounded-xl hover:scale-[1.02] transition-all text-[var(--text-light)]">
          <div className="text-3xl mb-2">{feature.icon}</div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className="mb-4">{feature.description}</p>
          <Link href={feature.link} className="text-[var(--primary-solid)] hover:underline">
            {feature.cta}
          </Link>
        </div>
      ))}
    </section>
  );
}

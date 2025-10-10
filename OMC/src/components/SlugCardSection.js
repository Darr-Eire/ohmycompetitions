'use client';
import SlugCard from './SlugCard';
import {
  techItems,
  premiumItems,
  piItems,
  dailyItems,
  freeItems,
  cryptoGiveawaysItems,
} from '../data/competitions';

const categories = [
  { title: 'Tech Competitions', items: techItems },
  { title: 'Premium Competitions', items: premiumItems },
  { title: 'Pi Competitions', items: piItems },
  { title: 'Daily Competitions', items: dailyItems },
  { title: 'Free Competitions', items: freeItems },
  { title: 'Crypto Competitions', items: cryptoGiveawaysItems },
];

export default function SlugCardSection() {
  return (
    <div className="min-h-screen px-4 py-10 text-white bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      {categories.map(({ title, items }) =>
        items.length > 0 ? (
          <section key={title} className="mb-10">
            <h2 className="text-2xl font-bold mb-4 border-b border-cyan-400 pb-1">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(({ comp, title, prize, imageUrl, thumbnail }) => (
                <SlugCard
                  key={comp.slug}
                  comp={{
                    ...comp,
                    title,
                    prize,
                    imageUrl,
                    thumbnail,
                  }}
                />
              ))}
            </div>
          </section>
        ) : null
      )}
    </div>
  );
}

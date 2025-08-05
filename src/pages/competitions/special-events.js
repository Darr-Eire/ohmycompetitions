'use client'

import CompetitionCard from '@components/CompetitionCard';
import { dailyItems } from '../../data/competitions'; // adjust path if needed

export default function SpecialEventsPage() {
  const eventItems = dailyItems.filter(item => item.theme === 'event');

  return (
    <main className="app-background min-h-screen px-0 py-0 text-white">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
        <h1
          className="
            text-2xl font-extrabold text-center mb-4
            bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
            bg-clip-text text-transparent
            font-orbitron
          "
        >
          Special Event Competitions
        </h1>

   
        {eventItems.length === 0 ? (
          <div className="text-center text-cyan-300 py-2 px-6 border border-cyan-400 bg-[#0f172a] rounded-xl">
            <h3 className="text-lg font-bold mb-4">Special Events Launching Soon</h3>
            <p className="text-white/80 text-sm mb-4">
              Explore time-limited competitions celebrating unique milestones, holidays, or Pi community events. These one-off giveaways bring excitement and massive rewards to our most active pioneers.
            </p>
            <p className="text-white/80 text-sm">
              We're preparing special event competitions for upcoming occasions. Check back soon and don't miss your chance to win exclusive prizes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mt-8">
            {eventItems.map((item) => (
              <CompetitionCard
                key={item.comp.slug}
                comp={{ ...item.comp, comingSoon: item.comp.comingSoon ?? false }}
                title={item.title}
                prize={item.prize}
                fee={`${(item.comp.entryFee ?? 0).toFixed(2)} π`}
                imageUrl={item.imageUrl}
                endsAt={item.comp.endsAt}
                disableGift
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

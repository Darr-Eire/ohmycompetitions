'use client'

import DailyCompetitionCard from '@components/DailyCompetitionCard'
import { dailyItems } from '../../data/competitions' // adjust path if needed

export default function RegionalCompetitionsPage() {
  const regionalItems = dailyItems.filter(item => item.theme === 'regional');

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
          Regional Competitions
        </h1>

       {regionalItems.length === 0 ? (
  <div className="text-center text-cyan-300 py-4 px-6 border border-cyan-400 bg-[#0f172a] rounded-xl">
    <h3 className="text-lg font-bold mb-4">Regional Giveaways Launching Soon</h3>
    <p className="text-white/80 text-sm mb-4">
      Discover location-based giveaways exclusively for Pi Network Pioneers. Regional competitions bring tailored opportunities to win real Pi prizes based on where you live. Check back often as we expand across more regions.
    </p>
    <p className="text-white/80 text-sm">
      We're currently preparing regional competitions for select areas. Stay tuned for updates and be ready to represent your region!
    </p>
  </div>
) : (


    
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mt-8">
            {regionalItems.map((item) => (
              <DailyCompetitionCard key={item.comp.slug} {...item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

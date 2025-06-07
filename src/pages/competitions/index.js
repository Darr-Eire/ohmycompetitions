'use client';

import { allComps } from '@data/competitions'; // Adjust path as needed
import CompetitionCard from '@components/CompetitionCard';
import PiCompetitionCard from '@components/PiCompetitionCard';
import DailyCompetitionCard from '@components/DailyCompetitionCard';
import FreeCompetitionCard from '@components/FreeCompetitionCard';
import CryptoGiveawayCard from '@components/CryptoGiveawayCard';

export default function AllCompetitionsPage() {

  const renderCompetitionCard = (item) => {
    const props = {
      key: item.comp.slug,
      comp: item.comp,
      title: item.title,
      prize: item.prize,
      fee: item.fee,
      theme: item.theme,
      imageUrl: item.imageUrl,
      endsAt: item.comp.endsAt,
    };

    switch (item.theme) {
      case 'free':
        return <FreeCompetitionCard {...props} />;
      case 'daily':
        return <DailyCompetitionCard {...props} />;
      case 'crypto':
        return <CryptoGiveawayCard {...props} />;
      case 'pi':
        return <PiCompetitionCard {...props} />;
      case 'tech':
      default:
        return <CompetitionCard {...props} />;
    }
  };

  return (
    <main className="app-background min-h-screen p-4 text-white">
      <div className="competition-top-banner title-gradient mb-6 text-black">
        All Competitions
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allComps.map(item => renderCompetitionCard(item))}
      </div>
    </main>
  );
}

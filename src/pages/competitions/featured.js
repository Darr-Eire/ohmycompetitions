import Head from 'next/head';
import CompetitionCard from '@components/CompetitionCard';
import { techItems } from '@data/competitions';


export default function FeaturedCompetitionsPage() {
  return (
    <>
      <Head>
        <title>Featured Competitions | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] bg-clip-text text-transparent">
            Featured Competitions
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {techItems.map(({ comp, title, prize, href, imageUrl, theme }) => (
          <CompetitionCard
  key={comp.slug}
  comp={comp}
  title={title}
  prize={prize}
  fee={`${(comp.entryFee ?? 0).toFixed(2)} π`}
  imageUrl={imageUrl}
  endsAt={comp.endsAt}
  hideButton={false}
/>

            ))}
          </div>
        </div>
      </main>
    </>
  );
}

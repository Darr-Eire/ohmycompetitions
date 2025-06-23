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
        <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          <h1
            className="
              text-3xl font-bold text-center mb-4
              bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
              bg-clip-text text-transparent
            "
          >
            Featured Competitions
          </h1>
          <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-8">
            Are you the next winner? Try your luck at one of our featured competitions for as little as{' '}
            <span className="font-semibold">0.35 π</span>!
          </p>
        </div>

        <div className="max-w-screen-lg mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
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
      </main>
    </>
  );
}

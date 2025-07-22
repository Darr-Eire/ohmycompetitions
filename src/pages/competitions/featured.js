import Head from 'next/head';
import CompetitionCard from '@components/CompetitionCard';
import { techItems } from '@data/competitions';

export default function FeaturedCompetitionsPage() {
  const filteredCompetitions = techItems.filter(item => item?.comp);

  return (
    <>
      <Head>
        <title>Featured Competitions | OhMyCompetitions</title>
      </Head>

      <main className="app-background min-h-screen px-0 py-0 text-white">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
          <h1
            className="
              text-2xl font-bold text-center mb-4
              bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
              bg-clip-text text-transparent
            "
          >
            Featured Competitions
          </h1>
       <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-8">
  Are you our next winner? Try your luck at one of our featured competitions from as little as{' '}
  <span className="font-semibold">0.35 π</span>  We’re always adding new competitions and creating even more winners as time goes on don’t miss your chance to join the excitement!
</p>

        </div>

        <div className="max-w-screen-lg mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mt-8 px-4 sm:px-0">
          {filteredCompetitions.map(({ comp, title, prize, href, imageUrl }) => {
            const fee =
              typeof comp.entryFee === 'number' ? `${comp.entryFee.toFixed(2)} π` : '0.00 π';

            return (
              <CompetitionCard
                key={comp.slug}
                comp={{ ...comp, comingSoon: comp.comingSoon ?? false }}
                title={title}
                prize={prize}
                fee={fee}
                imageUrl={imageUrl}
                endsAt={comp.endsAt}
                href={href}
              />
            );
          })}
        </div>
      </main>
    </>
  );
}

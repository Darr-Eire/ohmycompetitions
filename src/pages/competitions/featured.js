import Head from 'next/head';
import { useEffect, useState } from 'react';
import CompetitionCard from '@components/CompetitionCard';

export default function FeaturedCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch competitions from database
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/competitions/all');
        if (!response.ok) {
          throw new Error(`Failed to fetch competitions: ${response.status}`);
        }
        
        const result = await response.json();
        const liveData = result.data || [];
        
        // Filter for tech theme competitions only
        const techCompetitions = liveData.filter(comp => 
          comp.theme === 'tech' && 
          comp.comp?.status === 'active' && 
          !comp.comp?.comingSoon
        );

        console.log(`📊 Found ${techCompetitions.length} tech competitions for featured page`);
        setCompetitions(techCompetitions);
        
      } catch (err) {
        console.error('❌ Failed to fetch competitions:', err);
        setError(err.message);
        setCompetitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  if (loading) {
    return (
      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading featured competitions...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-background min-h-screen px-4 py-8 text-white">
        <div className="max-w-screen-lg mx-auto text-center">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-400">Error loading competitions: {error}</p>
          </div>
        </div>
      </main>
    );
  }

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

        {competitions.length === 0 ? (
          <div className="max-w-screen-lg mx-auto text-center">
            <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">🏆 No Featured Competitions</h2>
              <p className="text-gray-300">
                There are currently no active tech competitions. Check back soon for new featured competitions!
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-screen-lg mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
            {competitions.map(({ comp, title, prize, imageUrl, theme }) => (
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
        )}
      </main>
    </>
  );
}

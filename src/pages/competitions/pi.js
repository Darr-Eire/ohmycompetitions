'use client';

import { useEffect, useState } from 'react';
import PiCompetitionCard from '@components/PiCompetitionCard';

export default function PiCompetitionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/competitions/all');
        const json = await res.json();

        const data = Array.isArray(json?.data) ? json.data : [];
        // Keep only Pi competitions
        const piOnly = data.filter((c) => {
          const theme = c?.theme || c?.comp?.theme;
          return theme === 'pi';
        });

        // Filter out ended
        const now = Date.now();
        const active = piOnly.filter((c) => {
          const statusOk = (c?.comp?.status ?? 'active') === 'active';
          const ends = c?.comp?.endsAt ? new Date(c.comp.endsAt).getTime() : Infinity;
          return statusOk && now < ends;
        });

        if (alive) setItems(active);
      } catch (e) {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <main className="app-background min-h-screen px-0 py-0 text-white">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-0">
        <h1
          className="
            text-3xl font-bold text-center mb-4
            bg-gradient-to-r from-[#00ffd5] to-[#0077ff]
            bg-clip-text text-transparent
          "
        >
          Pi Competitions
        </h1>

        <p className="text-center text-white text-base sm:text-lg max-w-md mx-auto mb-8">
          Join exciting Pi competitions starting from just{' '}
          <span className="font-semibold">1.6 π</span> per entry grab your chance to win big! 
          We’re always adding new competitions and creating even more winners as time goes on. 
     
        </p>

        {loading ? (
          <div className="py-10 text-center text-white/80">Loading Pi competitions…</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-white/70">No Pi competitions live right now.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mt-8">
            {items.map((item) => {
              const slug = item?.comp?.slug || Math.random().toString(36).slice(2);
              const feeNum = typeof item?.comp?.entryFee === 'number' ? item.comp.entryFee : 0;
              const fee = `${feeNum.toFixed(2)} π`;

              return (
                <PiCompetitionCard
                  key={slug}
                  {...item}
                  fee={fee}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

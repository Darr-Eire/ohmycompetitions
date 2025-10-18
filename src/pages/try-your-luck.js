// pages/try-your-luck.js
import { useEffect, useMemo, useState } from 'react';

export default function TryYourLuck() {
  const [games, setGames] = useState([]);        // ✅ always an array
  const [playedMap, setPlayedMap] = useState({}); // optional

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/games');
        const data = await res.json();
        const list = Array.isArray(data?.games)
          ? data.games
          : data?.games && typeof data.games === 'object'
          ? Object.values(data.games)
          : [];
        if (alive) setGames(list);
      } catch (e) {
        console.error('[OMC] Failed to load games', e);
        if (alive) setGames([]); // keep it an array
      }
    })();
    return () => { alive = false; };
  }, []);

  const safeGames = useMemo(() => games ?? [], [games]); // still safe

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {safeGames.length === 0 ? (
        <EmptyGames />
      ) : (
        safeGames.map((game) => {
          const hasPlayed = !!playedMap?.[game?.storageKey];
          return (
            <div key={game?.id ?? game?.slug ?? game?.storageKey ?? Math.random()}>
              {/* your card here */}
            </div>
          );
        })
      )}
    </div>
  );
}

function EmptyGames() {
  return (
    <div className="col-span-full rounded-xl border border-white/10 bg-white/[0.04] p-6 text-center">
      <h3 className="font-orbitron text-cyan-200 text-lg">No mini games right now</h3>
      <p className="text-cyan-300/90 text-sm mt-1">Check back soon OMC is currently building mini-games for you to enjoy.</p>
    </div>
  );
}

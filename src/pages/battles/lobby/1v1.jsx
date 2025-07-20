'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BattleCard from '../../../components/BattleCard';
import CreateBattleForm from '../../../components/CreateBattleForm';
import ChallengePioneerForm from '../../../components/ChallengePioneerForm';
import Tabs from '../../../components/Tabs';

export default function PiBomb1v1Lobby() {
  const [selectedTab, setSelectedTab] = useState('open');
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [battles, setBattles] = useState([]);

  useEffect(() => {
    fetchBattles();
  }, [selectedTab, selectedPrize]);

  const fetchBattles = async () => {
    try {
      const res = await fetch(`/api/battles?type=${selectedTab}&prize=${selectedPrize || ''}`);
      const data = await res.json();
      setBattles(data.battles || []);
    } catch (err) {
      console.error('Failed to load battles:', err);
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
      <div className="bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400 p-4 text-center text-white font-semibold text-xl rounded-md shadow-lg mb-8">
        🚨 Pi Bomb 1v1 is Coming Soon 🚨
        <p className="text-sm mt-2">💥 Stay tuned for updates and be ready for explosive fun 💥</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10">
        <Tabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          selectedPrize={selectedPrize}
          setSelectedPrize={setSelectedPrize}
        />

        <section className="border border-cyan-700 rounded-xl bg-[#0f172a]/60 p-6 shadow-[0_0_20px_#00fff044]">
          <h2 className="text-center text-base font-bold text-white mb-6">Available Pi Bomb 1v1 Royales</h2>
          {battles.length > 0 ? (
            <div className="space-y-4">
              {battles.map((battle) => (
                <BattleCard key={battle._id} battle={battle} />
              ))}
            </div>
          ) : (
            <p className="text-center text-white/70">No battles match your filters.</p>
          )}
        </section>

        <CreateBattleForm />

        <ChallengePioneerForm />

        <div className="text-center mt-4">
          <Link href="/battles/lobby">
            <span className="inline-block bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold px-6 py-2 rounded-md shadow hover:brightness-110 transition border border-cyan-700">
              Back to Battle Hub
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

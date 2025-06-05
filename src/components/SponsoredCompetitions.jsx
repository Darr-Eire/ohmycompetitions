'use client';
import React, { useEffect, useState } from 'react';
import CompetitionCard from '@components/CompetitionCard';

export default function SponsoredCompetitions() {
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {
    async function fetchCompetitions() {
      const res = await fetch('/api/competitions');
      const data = await res.json();

      // ✅ Handle correct response shape depending on API structure
      const comps = data?.competitions ?? data;  // fallback if you return either array or {competitions: [...]}

      setCompetitions(comps.filter(c => c?.type === 'sponsored'));
    }
    fetchCompetitions();
  }, []);

  if (competitions.length === 0) {
    return null;  // Hide section if no sponsored competitions
  }

  return (
    <section className="mb-12">
      <div className="text-center mb-12">
        <h2 className="w-full text-base font-bold text-center text-black bg-gradient-to-r from-[#00ffd5] to-[#0077ff] px-4 py-2 rounded-xl shadow font-orbitron">
          Sponsored Competitions
        </h2>
      </div>

      <div className="centered-carousel lg:hidden">
        {competitions.map((comp, i) => (
          <CompetitionCard key={comp._id} comp={comp} {...comp} />
        ))}
      </div>

      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {competitions.map((comp, i) => (
          <CompetitionCard key={comp._id} comp={comp} {...comp} />
        ))}
      </div>
    </section>
  );
}

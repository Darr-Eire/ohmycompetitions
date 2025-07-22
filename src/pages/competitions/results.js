'use client';

import React, { useEffect, useState } from 'react';

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/competitions/results');
        const data = await res.json();
        setResults(data || []);
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="bg-[#0f172a] min-h-screen text-white p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-center text-cyan-300 mb-8">
        Competition Results
      </h1>

      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-6 text-gray-400 text-lg">Loading competition results...</p>
        </div>
      ) : results.length === 0 ? (
        <p className="text-center text-gray-400 text-lg mt-16">No completed competitions found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {results.map((comp) => (
            <div
              key={comp.id}
              className="bg-[#1e293b] rounded-2xl border border-cyan-700 p-6 shadow-md hover:shadow-lg transition duration-300 flex flex-col"
            >
              <div className="flex flex-col gap-2 mb-4">
                <h2 className="text-2xl font-semibold text-cyan-300">{comp.title}</h2>
                <p className="text-sm text-gray-400">
                  📅 Ended:{' '}
                  {comp.endsAt
                    ? new Date(comp.endsAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Unknown'}
                </p>
                <p className="text-yellow-400 text-lg font-medium">🏆 Prize: {comp.prize}</p>
              </div>

              {comp.imageUrl && (
                <img
                  src={comp.imageUrl}
                  alt="Prize"
                  className="rounded-xl w-full h-40 object-cover border border-cyan-800 mb-4"
                />
              )}

              {comp.winners?.length > 0 ? (
                <div className="mt-auto">
                  <p className="text-green-400 font-medium text-md mb-2">
                    🎯 Winner{comp.winners.length > 1 ? 's' : ''}
                  </p>
                  <ul className="space-y-1 text-sm">
                    {comp.winners.map((w, i) => (
                      <li key={i} className="text-white">
                        <span className="inline-flex items-center gap-1">
                          {i === 0 && <span className="text-yellow-400">🥇</span>}
                          👤 {w.username} — 🎟 {w.ticketNumber}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-red-400 text-sm">No winners recorded.</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-10 text-sm text-gray-500 space-x-4">
        <a href="/" className="underline text-cyan-400 hover:text-cyan-300">
          Back to Home
        </a>
        <a href="/terms" className="underline hover:text-cyan-300">Terms</a>
        <a href="/privacy" className="underline hover:text-cyan-300">Privacy</a>
        <a href="/support" className="underline hover:text-cyan-300">Support</a>
        <div className="mt-4">© 2025 OhMyCompetitions. All rights reserved.</div>
      </div>
    </div>
  );
}

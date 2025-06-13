// pages/forums/[type]/all.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ForumTypeAllPage() {
  const router = useRouter();
  const { type } = router.query;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type) return;
    const fetchEntries = async () => {
      setLoading(true);
      const res = await fetch(`/api/get/${type}`);
      const data = await res.json();
      setEntries(data.entries || []);
      setLoading(false);
    };
    fetchEntries();
  }, [type]);

  const typeTitles = {
    discussion: 'Discussions',
    idea: 'Ideas',
    vote: 'Votes',
    celebration: 'Celebrations',
  };

  return (
    <main className="min-h-screen px-4 py-10 bg-[#0b1120] text-white font-orbitron">
      <div className="max-w-3xl mx-auto border border-cyan-400 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-[#0f172a] bg-gradient-to-r from-cyan-400 to-blue-600 py-3 px-6 rounded-2xl inline-block shadow-md">
            {typeTitles[type] || 'Forum'} Submissions
          </h1>
        </div>

        {loading ? (
          <p className="text-center mt-10 text-cyan-300">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-center mt-10 text-red-400">No entries found.</p>
        ) : (
          <div className="space-y-6 mt-4">
            {entries.map((entry, idx) => (
              <div key={idx} className="border border-cyan-500 rounded-xl p-4 bg-[#132033] shadow-md">
                <h3 className="text-lg font-bold mb-1 text-cyan-300">
                  {entry.title || entry.idea || entry.voteOption || entry.name}
                </h3>
                <p className="text-sm text-gray-200">
                  {entry.content || entry.reason || entry.story}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/forums">
            <button className="bg-gradient-to-r from-cyan-400 to-blue-600 text-[#0f172a] font-semibold px-6 py-2 rounded-2xl shadow-md hover:brightness-110 transition">
               Back to Forums
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}

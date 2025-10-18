'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PiCashHeroBanner() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/pi-cash-code');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('❌ Failed to fetch PiCash data:', err);
        setError(true);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!data?.expiresAt) return;
    const target = new Date(data.expiresAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;
      setTimeLeft(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const formatTime = ms => {
    if (!ms) return 'Loading...';
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (error) return <div className="text-red-500 text-center">Error loading data.</div>;

  return (
    <div className="glass glow text-center p-10 rounded-xl mt-6">
      <h1 className="text-4xl font-bold text-[var(--omc-cyan)] mb-4">Pi Cash Code Challenge</h1>
      <p className="text-lg mb-6">Time remaining to crack the code and win:</p>
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-4">{formatTime(timeLeft)}</h2>
      <button
        onClick={() => router.push('/try-your-luck/pi-cash-code')}
        className="bg-[var(--primary-solid)] hover:bg-[var(--primary-hover)] text-white px-6 py-2 rounded-full transition"
      >
        Crack the Code →
      </button>
    </div>
  );
}

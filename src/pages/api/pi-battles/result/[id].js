"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import PvPBattleEngine from '@/components/PvPBattleEngineV2'; // Make sure this path is correct

export default function PiBattleResults() {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady || !id) return;
    fetchResult();
  }, [router.isReady, id]);

  const fetchResult = async () => {
    try {
      const res = await axios.get(`/api/pi-battles/result/${id}`);
      setResult(res.data);
    } catch (err) {
      console.error("Error fetching result:", err);
      setError(err?.response?.data?.error || "Server error");
    }
  };

  if (error) return <div className="text-red-400 font-bold p-8">Error: {error}</div>;
  if (!result) return <div>Loading...</div>;

  // ✅ This is where you trigger the battle engine:
  return (
    <PvPBattleEngine result={result} />
  );
}

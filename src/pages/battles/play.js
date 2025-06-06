"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function PiBattleMatchmaking() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFindBattle = async () => {
    setLoading(true);
    
    const userId = 'demo-user-1';
    const username = 'PiPlayer1';

    const res = await axios.post('/api/pi-battles/matchmake', {
      userId,
      username,
      boxId: 'MysteryBox01',
      entryFee: 1
    });

    router.replace(`/battles/${res.data._id}`);  // ✅ THIS LINE IS THE KEY

  };

  useEffect(() => {
    handleFindBattle();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] flex justify-center items-center text-white font-orbitron text-3xl">
      {loading ? "Finding Battle..." : "Initializing..."}
    </div>
  );
}

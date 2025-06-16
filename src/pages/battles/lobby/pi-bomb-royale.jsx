import React, { useEffect, useState } from 'react';
import { FaBomb } from 'react-icons/fa';
import { usePiAuth } from 'context/PiAuthContext';
import Link from 'next/link';

export default function PiBombRoyaleLobby() {
  const { username } = usePiAuth();
  const [battles, setBattles] = useState([]);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [inviteCode, setInviteCode] = useState('');

  // Fetch available battles
  const fetchBattles = async () => {
    const response = await fetch(`/api/battles?mode=pi-bomb-royale`);
    const data = await response.json();
    setBattles(data);
  };

  useEffect(() => {
    fetchBattles();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold text-center mb-4">Pi Bomb Royale</h2>
      
      <div className="mb-4">
        <h3 className="text-lg">Join a Battle</h3>
        <div className="grid grid-cols-1 gap-4">
          {battles.map((battle) => (
            <div key={battle._id} className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 rounded-lg text-white">
              <h4>{battle.name}</h4>
              <p>{battle.status}</p>
              <button className="bg-cyan-500 text-white p-2 rounded-lg" onClick={() => setSelectedBattle(battle._id)}>
                Join Battle
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg">Create a New Battle</h3>
        <input
          type="text"
          placeholder="Enter Invite Code (Optional)"
          className="p-2 rounded-lg w-full"
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <button
          className="mt-4 bg-cyan-500 text-white p-2 rounded-lg"
          onClick={async () => {
            const newBattle = await fetch('/api/battles/create', {
              method: 'POST',
              body: JSON.stringify({ inviteCode }),
              headers: { 'Content-Type': 'application/json' },
            }).then((res) => res.json());
            setBattles([...battles, newBattle]);
          }}
        >
          Create Battle
        </button>
      </div>
    </div>
  );
}

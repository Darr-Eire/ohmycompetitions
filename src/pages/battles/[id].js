import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router';
import axios from 'axios';

let socket;

export default function BattleRoom() {
  const router = useRouter();
  const { id: battleId } = router.query;

  const [battle, setBattle] = useState(null);
  const [readyState, setReadyState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('user-1');
  const [username, setUsername] = useState('Player-1');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const uid = urlParams.get('userId') || 'user-1';
      const uname = urlParams.get('username') || 'Player-1';
      setUserId(uid);
      setUsername(uname);
    }
  }, []);

  const fetchBattle = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/pi-battles/${battleId}`);
      setBattle(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch battle', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!battleId || !userId) return;

    fetchBattle();

    socket = io('http://localhost:5000');
    socket.emit('joinBattle', { battleId, userId, username });

    socket.on('battleUpdate', () => fetchBattle());
    socket.on('readyUpdate', ({ readyState }) => setReadyState(readyState));

    return () => socket.disconnect();
  }, [battleId, userId, username]);

  const setReady = () => {
    socket.emit('setReady', { battleId, userId });
  };

  const attack = () => {
    const damage = Math.floor(Math.random() * 21) + 10;
    socket.emit('attack', { battleId, damage, attacker: userId });
  };

  if (loading || !battle) return (
    <div className="min-h-screen bg-[#0f172a] text-white flex justify-center items-center">
      <h2 className="text-3xl font-bold">Loading battle...</h2>
    </div>
  );

  const { players, hp, turn, winner } = battle;
  const battleStarted = Object.keys(hp || {}).length > 0;

  if (!battleStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white p-6 font-orbitron">
        <h1 className="text-4xl font-bold text-cyan-400 text-center mb-6">⚔️ Battle Room: {battle.boxId}</h1>

        <div className="flex flex-col gap-4 max-w-xl mx-auto">
          {players.map(p => (
            <div key={p.userId} className={`p-4 rounded-xl text-black text-center font-bold ${p.ready ? 'bg-green-400' : 'bg-yellow-400'}`}>
              {p.username} {p.ready ? '✅ Ready' : '⌛ Waiting'}
            </div>
          ))}

          {[...Array(battle.maxPlayers - players.length)].map((_, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-gray-300 text-black text-center font-bold">
              Waiting for opponent...
            </div>
          ))}

          <button className="mt-4 bg-blue-500 px-6 py-3 rounded-xl font-bold text-xl hover:scale-105 transition" onClick={setReady}>
            ✅ Ready
          </button>

          {readyState?.waiting && (
            <p className="text-yellow-400 text-center text-lg mt-2">Waiting for opponent to be ready...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 font-orbitron">
      <h1 className="text-4xl font-bold text-center mb-6">🔥 The Battle Begins!</h1>
      <div className="flex flex-col gap-4 max-w-xl mx-auto">
        {Object.entries(hp).map(([uid, hpVal]) => {
          const player = players.find(p => p.userId === uid);
          return (
            <div key={uid} className="p-4 rounded-xl bg-[#1e293b] text-center text-xl">
              {player?.username || 'Unknown'} — HP: {hpVal}
            </div>
          );
        })}

        {winner ? (
          <div className="p-4 bg-green-500 text-black font-bold text-center text-2xl rounded-xl">
            🎉 Winner: {winner}
          </div>
        ) : (
          <>
            {turn === userId ? (
              <button onClick={attack} className="bg-red-500 px-6 py-3 rounded-xl font-bold text-xl hover:scale-105 transition">
                🔥 Attack!
              </button>
            ) : (
              <p className="text-center text-yellow-400 text-xl">Waiting for opponent's move...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

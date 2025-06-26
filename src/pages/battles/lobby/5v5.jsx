'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRightCircle } from 'react-icons/fi';
import { FaBomb } from 'react-icons/fa';
import { nanoid } from 'nanoid';

const PRIZE_RANGES = [0.2, 0.5, 1.0, 2.0, 5.0];

export default function PiBombRoyaleLobby() {
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [battles, setBattles] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [pioneerUsername, setPioneerUsername] = useState(''); // State for the opponent's Pi username
  const [challengeCode, setChallengeCode] = useState(null); // Declare challengeCode state

  const [isGameLaunched, setIsGameLaunched] = useState(false); // Set to false for coming soon

  useEffect(() => {
    fetchBattles();
  }, [selectedPrize]);

  const fetchBattles = async () => {
    try {
      const res = await fetch(`/api/battles?type=pi-bomb-5v5&prize=${selectedPrize || ''}`);
      const data = await res.json();
      setBattles(data.battles || []);
    } catch (err) {
      console.error('Failed to load battles:', err);
    }
  };

  const handleCreateBattle = async () => {
    if (!username || !amount) {
      alert('Please fill in all fields');
      return;
    }

    const inviteCode = nanoid(6).toUpperCase();

    try {
      const res = await fetch('/api/battles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: username.startsWith('@') ? username : `@${username}`,
          prize: parseFloat(amount),
          type: 'pi-bomb-5v5',
          inviteCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Create error:', data);
        alert(data.error || 'Failed to create battle');
        return;
      }

      alert(`✅ Pi Bomb 5v5 Battle created! Share invite code: ${inviteCode}`);
      setInviteCode(inviteCode);
      setUsername('');
      setAmount('');
      fetchBattles();
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Server error while creating Pi Bomb 5v5 Battle');
    }
  };

  const handleChallengePioneer = async () => {
    if (!pioneerUsername) {
      alert('Please enter a valid Pi username to challenge');
      return;
    }

    const challengeCode = nanoid(6).toUpperCase(); // Generate a challenge code

    try {
      const res = await fetch('/api/battles/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenger: `@${username}`,
          opponent: `@${pioneerUsername}`,
          challengeCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Challenge error:', data);
        alert(data.error || 'Failed to create challenge');
        return;
      }

      setChallengeCode(challengeCode); // Set challenge code on success
      alert(`✅ Challenge created! Share challenge code: ${challengeCode}`);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Server error while creating challenge');
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400 p-4 text-center text-white font-semibold text-xl rounded-md shadow-lg mb-8">
        🚨 Pi Bomb 5v5 is Coming Soon 🚨
        <p className="text-sm mt-2">💥 Stay tuned for updates and be ready for explosive fun 💥</p>
      </div>

      <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055] space-y-10">

        {/* Header */}
        <div className="text-center">
          <h1 className="w-full text-lg sm:text-xl font-bold text-white px-4 py-3 rounded-xl shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400">
            <div className="flex justify-center items-center gap-2">
              <FaBomb />
              Pi Bomb 5v5 Royale Lobby
            </div>
          </h1>
          <p className="text-white text-sm sm:text-base mt-4">
            Join a 5-player team or create your own challenge! In Pi Bomb 5v5 Royale, each team of 5 players competes to be the last team standing.
            <br />
            One player holds the Pi Bomb at a time and must pass it to the other team. If the bomb explodes in your hands, your team loses. The last team member standing wins the prize for their team.
            <br />
            <strong>Have you and your team got what it takes?</strong>
          </p>
        </div>

        {/* Prize Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setSelectedPrize(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${selectedPrize === null ? 'bg-cyan-300 text-[#0f172a]' : 'border-cyan-500 text-white'}`}
          >
            All Prizes
          </button>
          {PRIZE_RANGES.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPrize(p)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${selectedPrize === p ? 'bg-cyan-300 text-[#0f172a]' : 'border-cyan-500 text-white'}`}
            >
              {p} π
            </button>
          ))}
        </div>

        {/* Available Battles */}
        <section className="border border-cyan-700 rounded-xl bg-[#0f172a]/60 p-6 shadow-[0_0_20px_#00fff044]">
          <h2 className="text-center text-sm sm:text-base font-bold text-white px-4 py-2 rounded-xl mb-6 shadow-[0_0_20px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400">
            Available Pi Bomb 5v5 Royales
          </h2>
          <div className="space-y-4">
            {battles.length > 0 ? (
              battles.map((battle) => (
                <div key={battle._id} className="bg-[#1e293b] p-4 rounded-xl flex justify-between items-center shadow-md">
                  <div>
                    <p className="font-semibold text-white">{battle.host}'s Team</p>
                    <p className="text-sm text-white/70">{battle.status || 'Waiting for players'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-medium">{battle.prize} π</p>
                    <Link href={`/battles/pi-bomb-5v5/${battle.inviteCode}`}>
                      <button className="mt-1 text-sm bg-cyan-500 text-[#0f172a] font-bold py-1 px-3 rounded-md hover:bg-cyan-400 flex items-center gap-1">
                        <FiArrowRightCircle /> Join
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-white/70">No battles available right now.</p>
            )}
          </div>
        </section>

        {/* Create a Battle */}
        <section className="border border-cyan-700 rounded-xl bg-[#0f172a]/60 p-6 shadow-[0_0_20px_#00fff044]">
          <h2 className="text-center text-sm sm:text-base font-bold text-white px-4 py-2 rounded-xl mb-6 shadow-[0_0_20px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400">
            Create a Pi Bomb 5v5 Royale
          </h2>
          <input
            type="text"
            placeholder="Your Pi username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-md text-black mb-3"
          />
          <input
            type="number"
            placeholder="Prize amount in π"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-md text-black mb-4"
          />
          <button
            onClick={handleCreateBattle}
            disabled={!isGameLaunched} // Disable button if game is not launched
            className={`w-full ${!isGameLaunched ? 'bg-gray-400 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400'} text-[#0f172a] font-bold py-3 rounded-md flex justify-center items-center gap-2`}
          >
            💣 Launch Pi Bomb 5v5 Royale
          </button>

          {inviteCode && (
            <div className="mt-4 text-center text-cyan-300 text-sm">
              Invite Code: <strong>{inviteCode}</strong>
            </div>
          )}
        </section>

        {/* Terms & Conditions Link */}
        <div className="text-center mt-6">
          <a href="/terms-conditions" className="text-xs text-cyan-400 underline hover:text-cyan-300 transition-all">
            View full Terms & Conditions
          </a>
        </div>
      </div>
    </main>
  );
}

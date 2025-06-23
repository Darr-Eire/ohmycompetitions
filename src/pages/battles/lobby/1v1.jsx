'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRightCircle } from 'react-icons/fi';
import { FaUserFriends } from 'react-icons/fa';
import { nanoid } from 'nanoid';

const PRIZE_RANGES = [0.2, 0.5, 1.0, 2.0, 5.0];

export default function PiBomb1v1Lobby() {
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedTab, setSelectedTab] = useState('open');
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [battles, setBattles] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [pioneerUsername, setPioneerUsername] = useState(''); // State for the opponent's Pi username
  const [challengeCode, setChallengeCode] = useState(null); // Declare challengeCode state

  // Disable the button while the game is "coming soon"
  const [isGameLaunched, setIsGameLaunched] = useState(false); // Set to true when the game is launched

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

  const handleCreateBattle = async () => {
    if (!username || !amount) {
      alert('Please fill in all fields');
      return;
    }

    const inviteCode = nanoid(6).toUpperCase(); // Generate an invite code (e.g., "X9P2LW")

    try {
      const res = await fetch('/api/battles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: `@${username}`,
          prize: parseFloat(amount),
          type: 'friends',
          inviteCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Create error:', data);
        alert(data.error || 'Failed to create battle');
        return;
      }

      alert(`✅ Pi Bomb 1v1 Battle created! Share invite code: ${inviteCode}`);
      setUsername('');
      setAmount('');
      setInviteCode(inviteCode);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Server error while creating battle');
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
        🚨 Pi Bomb 1v1 is Coming Soon 🚨
        <p className="text-sm mt-2">💥 Stay tuned for updates and be ready for explosive fun 💥</p>
      </div>

      <div className="max-w-3xl mx-auto border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055] space-y-10">

        {/* Header */}
        <div className="text-center">
          <h1 className="w-full text-lg sm:text-xl font-bold text-white px-4 py-3 rounded-xl shadow-[0_0_30px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400">
            <div className="flex justify-center items-center gap-2">
              <FaUserFriends />
              Pi Bomb 1v1 Royale Lobby
            </div>
          </h1>
          <p className="text-white text-sm sm:text-base mt-4">
            In Pi Bomb 1v1 Royale, two players compete against each other.
            <br />
            One player holds the Pi Bomb at a time and must pass it to the other player. If the bomb explodes while you’re holding it, you lose.
            <br />
            Only one player can survive! The winner takes the prize.
            <br />
            <strong>Have you got what it takes to survive the Pi Bomb?</strong>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-4">
          {['open', 'friends'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setSelectedTab(tab); setInviteCode(null); }}
              className={`px-4 py-2 rounded-md text-sm font-bold border ${
                selectedTab === tab
                  ? 'bg-cyan-500 text-[#0f172a]'
                  : 'bg-transparent text-white border-cyan-600'
              }`}
            >
              {tab === 'open' ? 'Open Battles' : 'Friends Only'}
            </button>
          ))}
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
            Available Pi Bomb 1v1 Royales
          </h2>
          <div className="space-y-4">
            {battles.length > 0 ? (
              battles.map((battle) => (
                <div key={battle._id} className="bg-[#1e293b] p-4 rounded-xl flex justify-between items-center shadow-md">
                  <div>
                    <p className="font-semibold text-white">{battle.host}'s Game</p>
                    <p className="text-sm text-white/70">{battle.status || 'Waiting for players'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-medium">{battle.prize} π</p>
                    <Link
                      href={battle.type === 'friends'
                        ? `/battles/1v1/${battle.inviteCode}`
                        : `/battles/1v1/${battle._id}`}
                    >
                      <button className="mt-1 text-sm bg-cyan-500 text-[#0f172a] font-bold py-1 px-3 rounded-md hover:bg-cyan-400 flex items-center gap-1">
                        <FiArrowRightCircle /> Join
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-white/70">No battles match your filters.</p>
            )}
          </div>
        </section>

        {/* Create a Battle */}
        <section className="border border-cyan-700 rounded-xl bg-[#0f172a]/60 p-6 shadow-[0_0_20px_#00fff044]">
          <h2 className="text-center text-sm sm:text-base font-bold text-white px-4 py-2 rounded-xl mb-6 shadow-[0_0_20px_#00fff055] bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-400">
            Create Your Pi Bomb 1v1 Royale
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
            placeholder="Prize amount in π (e.g. 0.5)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-md text-black mb-4"
          />
          <button
            onClick={handleCreateBattle}
            disabled={!isGameLaunched} // Disable button if game isn't launched
            className={`w-full ${!isGameLaunched ? 'bg-gray-400 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400'} text-[#0f172a] font-bold py-3 rounded-md flex justify-center items-center gap-2`}
          >
            Create & Invite Friend
          </button>

          {inviteCode && (
            <div className="mt-4 text-center text-cyan-300 text-sm">
              Invite Code: <strong>{inviteCode}</strong>
            </div>
          )}
        </section>

        {/* Challenge a Pioneer Section */}
        <div className="mt-8 border-t border-cyan-700 pt-8">
          <h3 className="text-center text-xl sm:text-2xl font-semibold text-white mb-4">
            Challenge a Pioneer
          </h3>
          <p className="text-center text-white/80 mb-4">
            Want to challenge a friend to a Pi Bomb 1v1 Royale? Enter their Pi username below and send them an invite!
          </p>

          {/* Pioneer Username Input */}
          <input
            type="text"
            placeholder="Enter your opponent's Pi username"
            value={pioneerUsername}
            onChange={(e) => setPioneerUsername(e.target.value)}
            className="w-full p-4 rounded-md text-black bg-white/80 placeholder-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-shadow duration-300"
          />

          {/* Challenge Button */}
          <button
            onClick={handleChallengePioneer}
            className="w-full py-3 rounded-md text-[#0f172a] font-semibold bg-gradient-to-r from-[#4e8cff] to-[#5c6aee] hover:bg-gradient-to-l text-white transition-colors duration-300 mt-4"
          >
            Challenge to Pi Bomb Royale
          </button>

          {/* Display Challenge Code */}
          {challengeCode && (
            <div className="mt-4 text-center text-cyan-300 text-lg font-semibold">
              Challenge Code: <strong>{challengeCode}</strong>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="text-center mt-3">
          <a href="/terms-conditions" className="text-xs text-cyan-400 underline hover:text-cyan-300 transition">
            View full Terms & Conditions
          </a>
        </div>

        {/* Back */}
        <div className="text-center">
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

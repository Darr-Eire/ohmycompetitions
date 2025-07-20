// components/ChallengePioneerForm.jsx
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { FiCopy } from 'react-icons/fi';

export default function ChallengePioneerForm() {
  const [pioneerUsername, setPioneerUsername] = useState('');
  const [challengeCode, setChallengeCode] = useState(null);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isChallenging, setIsChallenging] = useState(false);

  const handleChallenge = async () => {
    setError('');
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(pioneerUsername)) {
      return setError('Opponent username must be 3–15 characters and alphanumeric.');
    }

    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) {
      return setError('Your username must be 3–15 characters and alphanumeric.');
    }

    setIsChallenging(true);
    const code = nanoid(6).toUpperCase();

    try {
      const res = await fetch('/api/battles/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenger: `@${username}`,
          opponent: `@${pioneerUsername}`,
          challengeCode: code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return setError(data.error || 'Error sending challenge.');
      }

      setChallengeCode(code);
      setPioneerUsername('');
    } catch (err) {
      setError('Server error. Try again.');
    } finally {
      setIsChallenging(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(challengeCode);
  };

  return (
    <section className="border-t border-cyan-700 pt-8">
      <h3 className="text-center text-xl sm:text-2xl font-semibold text-white mb-4">
        Challenge a Pioneer
      </h3>
      <p className="text-center text-white/80 mb-4">
        Want to challenge a friend to a Pi Bomb 1v1 Royale? Enter their Pi username and your own to send an invite.
      </p>

      <input
        type="text"
        placeholder="Your Pi username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-3 rounded-md text-black mb-3"
      />

      <input
        type="text"
        placeholder="Opponent's Pi username"
        value={pioneerUsername}
        onChange={(e) => setPioneerUsername(e.target.value)}
        className="w-full p-3 rounded-md text-black mb-4"
      />

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        onClick={handleChallenge}
        disabled={isChallenging}
        className={`w-full ${isChallenging ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400'} text-white font-semibold py-3 rounded-md`}
      >
        {isChallenging ? 'Sending Challenge...' : 'Challenge to Pi Bomb Royale'}
      </button>

      {challengeCode && (
        <div className="mt-4 text-center text-cyan-300 text-sm flex justify-center items-center gap-2">
          Challenge Code: <strong>{challengeCode}</strong>
          <button onClick={copyToClipboard} title="Copy" className="hover:text-white">
            <FiCopy />
          </button>
        </div>
      )}
    </section>
  );
}

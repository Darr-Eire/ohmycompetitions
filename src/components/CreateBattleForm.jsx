// components/CreateBattleForm.jsx
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { FiCopy } from 'react-icons/fi';

export default function CreateBattleForm() {
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [inviteCode, setInviteCode] = useState(null);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBattle = async () => {
    setError('');
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) {
      return setError('Username must be 3–15 characters and only use letters, numbers, or underscores.');
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return setError('Prize must be a number greater than 0.');
    }

    setIsCreating(true);
    const code = nanoid(6).toUpperCase();

    try {
      const res = await fetch('/api/battles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: `@${username}`,
          prize: parseFloat(amount),
          type: 'friends',
          inviteCode: code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return setError(data.error || 'Error creating battle.');
      }

      setInviteCode(code);
      setUsername('');
      setAmount('');
    } catch (err) {
      setError('Server error. Try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
  };

  return (
    <section className="border border-cyan-700 rounded-xl bg-[#0f172a]/60 p-6 shadow-[0_0_20px_#00fff044]">
      <h2 className="text-center text-base font-bold text-white mb-6">
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
        min="0.01"
        step="0.01"
        placeholder="Prize amount in π (e.g. 0.5)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-md text-black mb-4"
      />

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        onClick={handleCreateBattle}
        disabled={isCreating}
        className={`w-full ${isCreating ? 'bg-gray-400' : 'bg-cyan-500 hover:bg-cyan-400'} text-[#0f172a] font-bold py-3 rounded-md`}
      >
        {isCreating ? 'Creating...' : 'Create & Invite Friend'}
      </button>

      {inviteCode && (
        <div className="mt-4 text-center text-cyan-300 text-sm flex justify-center items-center gap-2">
          Invite Code: <strong>{inviteCode}</strong>
          <button onClick={copyToClipboard} title="Copy" className="hover:text-white">
            <FiCopy />
          </button>
        </div>
      )}
    </section>
  );
}

'use client';

import { usePiAuth } from '@/context/PiAuthContext';

export default function PiLoginButton() {
  const { login, user, error } = usePiAuth();

  return (
    <div className="p-4">
      {user ? (
        <p>👋 Welcome {user.username}</p>
      ) : (
        <button
          onClick={login}
          className="bg-yellow-400 text-black px-4 py-2 rounded"
        >
          Login with Pi
        </button>
      )}
      {error && (
        <p className="text-red-500 mt-2 text-sm">⚠️ {error}</p>
      )}
    </div>
  );
}

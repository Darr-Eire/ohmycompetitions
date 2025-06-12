'use client';

import { usePiAuth } from '@/context/PiAuthContext';

export default function PiLoginButton() {
  const { user, login } = usePiAuth();

  return (
    <button
      onClick={login}
      className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded shadow font-bold"
    >
      {user ? `👋 ${user.username}` : 'Login with Pi'}
    </button>
  );
}

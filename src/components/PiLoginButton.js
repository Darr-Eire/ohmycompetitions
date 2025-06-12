'use client';

import { usePiAuth } from '@/context/PiAuthContext';

export default function PiLoginButton() {
  const { loginWithPi, user } = usePiAuth();

  return (
    <button
      onClick={loginWithPi}
      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
    >
      {user ? `Logged in as ${user.username}` : 'Login with Pi'}
    </button>
  );
}

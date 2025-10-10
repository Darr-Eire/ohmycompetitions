'use client';
import { usePiAuth } from '../context/PiAuthContext';
import { usePiEnv } from '../hooks/usePiEnv';

export default function PiLoginButton({ onSuccess }) {
  // Hooks always at the top
  const { loginWithPi } = usePiAuth();
  const { isPiBrowser, hasPi } = usePiEnv();

  const handleLogin = async () => {
    if (!isPiBrowser || !hasPi) {
      alert('Open in Pi Browser to login with Pi.');
      return;
    }
    await loginWithPi(onSuccess); // your existing flow
  };

  return (
    <button onClick={handleLogin} className="btn btn-primary">
      Login with Pi
    </button>
  );
}

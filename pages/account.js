// pages/account.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AccountPage() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // fetch current user
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          // not logged in -> back to home
          router.replace('/');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.username) {
          setUser(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/');
  };

  if (loading) return <p>Loading your account…</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Hello, {user?.username}</h1>

      <ul className="mb-6 space-y-2">
        <li>
          <a href="/competitions" className="text-blue-600 underline">
            Your Competitions
          </a>
        </li>
        <li>
          <a href="/settings" className="text-blue-600 underline">
            Account Settings
          </a>
        </li>
        {/* add more links as needed */}
      </ul>

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Log out
      </button>
    </div>
  );
}

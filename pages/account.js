'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // On mount, fetch /api/auth/me (a new endpoint you’ll create) to get the current user
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error('Not authenticated');
      })
      .then(setUser)
      .catch(() => router.push('/')); // Not logged in → back to home
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/');
  };

  if (!user) return <p>Loading…</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Welcome, {user.username}!</h1>

      <ul className="list-disc pl-6 mb-6">
        <li>
          <a href="/dashboard">Dashboard</a>
        </li>
        <li>
          <a href="/settings">Settings</a>
        </li>
        <li>
          <a href="/orders">Your Orders</a>
        </li>
        {/* add whatever links you need */}
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

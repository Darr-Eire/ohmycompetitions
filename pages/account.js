import { useEffect, useState } from 'react';

export default function Account() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(setMe)
      .catch(console.error);
  }, []);

  if (!me) return <p>Loading account…</p>;

  return (
    <div>
      <h1>Welcome, {me.username}!</h1>
      <button
        onClick={async () => {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          window.location.href = '/';
        }}
      >
        Log out
      </button>
      {/* Add any other links or account-only UI here */}
    </div>
  );
}

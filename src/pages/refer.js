'use client';

import { usePiAuth } from '../context/PiAuthContext';

export default function ReferPage() {
  const { user, login, loading } = usePiAuth();

  if (loading) return <p className="p-8 text-center">Loading...</p>;

  if (!user)
    return (
      <div className="p-8 text-center">
        <p>Please sign in with Pi to get your referral link.</p>
        <button onClick={login} className="btn btn-primary mt-4">
          login
        </button>
      </div>
    );

  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/competitions/pi-day-freebie?ref=${user.id}`;

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Your Pi Day Referral Link</h1>
      <p className="break-all bg-gray-100 p-4 rounded">{link}</p>
      <button
        onClick={() => navigator.clipboard.writeText(link)}
        className="btn btn-primary"
      >
        Copy to Clipboard
      </button>
    </main>
  );
}

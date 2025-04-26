// pages/account.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function AccountPage() {
  const [me, setMe] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) throw new Error('Not logged in');
        return res.json();
      })
      .then((data) => setMe(data))
      .catch(() => router.replace('/'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.replace('/');
  };

  if (!me) return <p>Loading…</p>;

  return (
    <>
      <Head>
        <title>Account • My Pi App</title>
      </Head>
      <main className="p-8">
        <h1 className="text-2xl">Hello, {me.username}!</h1>
        <p>Your UID: {me.uid}</p>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Log out
        </button>
      </main>
    </>
  );
}

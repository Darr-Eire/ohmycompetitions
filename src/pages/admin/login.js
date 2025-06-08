// src/pages/admin/login.js

import { getCsrfToken, signIn } from 'next-auth/react';
import { useState } from 'react';

export default function AdminLoginPage({ csrfToken }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const username = e.target.username.value;
    const password = e.target.password.value;

    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError('Invalid credentials');
    } else {
      window.location.href = '/admin/competitions';
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-white">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>

        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        <div className="mb-4">
          <label className="block mb-1">Username</label>
          <input type="text" name="username" className="w-full p-2 rounded text-black" required />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input type="password" name="password" className="w-full p-2 rounded text-black" required />
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <button type="submit" className="w-full bg-cyan-500 py-2 rounded font-bold" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

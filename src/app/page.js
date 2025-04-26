// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import PiLoginButton from '../components/PiLoginButton';
import CompetitionCard from '../components/CompetitionCard';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [comps, setComps] = useState([]);

  // On mount: check current session/user
  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => {
        console.log('No active session:', err.message);
      });
  }, []);

  // Fetch competitions list
  useEffect(() => {
    fetch('/api/competitions')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setComps(data.competitions || []);
      })
      .catch((err) => {
        console.error('Failed fetching competitions:', err);
      });
  }, []);

  return (
    <div className="container mx-auto p-6">
      {/* Always show the login button */}
      <div className="mb-6">
        <PiLoginButton onLogin={(userData) => setUser(userData)} />
      </div>

      {/* Welcome message when logged in */}
      {user && (
        <p className="mb-4 text-green-600">
          Logged in as: <span className="font-mono">{user.publicAddress}</span>
        </p>
      )}

      {/* Competitions grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {comps.length > 0 ? (
          comps.map((c) => (
            <CompetitionCard key={c.slug} competition={c} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No competitions available.
          </p>
        )}
      </div>
    </div>
  );
}

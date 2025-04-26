'use client';

import { useState, useEffect } from 'react';
import PiLoginButton from '../components/PiLoginButton';
import CompetitionCard from '../components/CompetitionCard';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [comps, setComps] = useState([]);

  useEffect(() => {
    // 1. Who’s logged in?
    fetch('/api/sessions')
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(console.error);

    // 2. Always load the competitions
    fetch('/api/competitions')
      .then((r) => r.json())
      .then((data) => setComps(data.competitions || []))
      .catch(console.error);
  }, []);

  return (
    <div className="container mx-auto p-6">
      {/* Show login button if not yet authenticated */}
      {!user && (
        <div className="mb-6">
          <PiLoginButton />
        </div>
      )}

      {/* Competition cards always */}
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

      {/* If you want to show purchase UI below for logged-in users, you can add it here */}
    </div>
  );
}


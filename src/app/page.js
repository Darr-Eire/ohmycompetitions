'use client';

import { useState, useEffect } from 'react';
import PiLoginButton from '../components/PiLoginButton';
import CompetitionCard from '../components/CompetitionCard';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [comps, setComps] = useState([]);

  useEffect(() => {
    fetch('/api/competitions')
      .then((r) => r.json())
      .then((data) => {
        console.log('Fetched competitions:', data.competitions);
        setComps(data.competitions || []);
      })
      .catch(console.error);
  }, []);
  

  return (
    <div className="container mx-auto p-6">
      {/* Always show login button */}
      <div className="mb-6">
        <PiLoginButton />
      </div>

      {/* If you want, show a welcome message when logged in */}
      {user && (
        <p className="mb-4 text-green-600">Logged in as: {user.publicAddress}</p>
      )}

      {/* Competitions grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {comps.length > 0 ? (
          comps.map(c => <CompetitionCard key={c.slug} competition={c} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No competitions available.
          </p>
        )}
      </div>
    </div>
  );
}

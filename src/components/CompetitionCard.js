"use client";

import { useRouter } from 'next/navigation';

export default function CompetitionCard({ competition }) {
  const router = useRouter();
  const handleEnter = () => {
    router.push(`/ticket-purchase/${competition.slug}`);
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-sm text-center">
      <h2 className="text-2xl font-semibold mb-2">{competition.title}</h2>
      <p className="mb-4">
        Entry Fee: {competition.entryFee} {competition.currency}
      </p>
      <button
        onClick={handleEnter}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Enter Now
      </button>
    </div>
  );
}

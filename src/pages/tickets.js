'use client';

import { usePiAuth } from '../lib/PiAuthContext';

import BuyTicketButton from 'components/BuyTicketButton';

export default function TicketsPage() {
  const { user: piUser } = usePiAuth();

  const entryFee = 0.5;
  const quantity = 1;
  const competitionSlug = 'pi-weekly-123';

  return (
    <main className="p-6">
      <h2 className="text-xl font-bold mb-4">Buy Entry Ticket</h2>
      {piUser ? (
        <BuyTicketButton
          entryFee={entryFee}
          quantity={quantity}
          competitionSlug={competitionSlug}
          piUser={piUser}
        />
      ) : (
        <p className="text-gray-600">🔒 Please log in with Pi to purchase tickets.</p>
      )}
    </main>
  );
}

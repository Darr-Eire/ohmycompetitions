// pages/tickets.js
import BuyTicketButton from '../components/BuyTicketButton';

export default function TicketsPage() {
  return (
    <main className="p-6">
      <h2 className="text-xl font-bold mb-4">Buy Entry Ticket</h2>
      <BuyTicketButton
        amount={0.5}
        memo="Buy Ticket for Pi Giveaway"
        metadata={{ eventId: 'pi-weekly-123', tier: 'standard' }}
      />
    </main>
  );
}

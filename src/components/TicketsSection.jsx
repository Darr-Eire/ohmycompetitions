// components/TicketsSection.jsx
'use client';

import Image from 'next/image';

export default function TicketsSection({ tickets }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 border border-cyan-400 text-white">
        <h2 className="text-xl mb-4 font-semibold">Purchase History</h2>
        <p>You have not purchased any tickets yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6 border border-cyan-400 text-white">
      <h2 className="text-xl mb-6 font-semibold">Purchase History</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tickets.map((ticket, index) => (
          <div
            key={index}
            className="rounded-xl overflow-hidden border border-cyan-500 bg-[#0f172a] shadow-md"
          >
            <Image
              src={ticket.imageUrl}
              alt={ticket.competitionTitle}
              width={600}
              height={400}
              className="w-full h-32 object-cover"
            />
            <div className="p-3 space-y-1 text-xs leading-tight">
              <h3 className="text-sm font-semibold text-cyan-300 mb-1">
                {ticket.competitionTitle}
              </h3>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                <p>
                  <span className="text-gray-400">🎫 Qty:</span>{' '}
                  <span className="text-white">{ticket.quantity}</span>
                </p>
                <p>
                  <span className="text-gray-400">📅 Date:</span>{' '}
                  <span className="text-white">
                    {new Date(ticket.purchasedAt).toLocaleDateString()}
                  </span>
                </p>
                <p className="col-span-2">
                  <span className="text-gray-400">🔢 Numbers:</span>{' '}
                  <span className="text-white">
                    {ticket.ticketNumbers.join(', ')}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

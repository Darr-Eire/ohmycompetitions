import { useState } from 'react';

export default function CompressedTicketView({ tickets }) {
  const [selectedTicket, setSelectedTicket] = useState(null);

  if (!tickets || tickets.length === 0) return null;

  // Group tickets by competition
  const groupedTickets = tickets.reduce((groups, ticket) => {
    const key = ticket.competitionSlug;
    if (!groups[key]) {
      groups[key] = {
        competition: ticket,
        totalQuantity: 0,
        tickets: []
      };
    }
    groups[key].totalQuantity += ticket.quantity;
    groups[key].tickets.push(ticket);
    return groups;
  }, {});

  const groups = Object.values(groupedTickets);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-cyan-300 mb-3">
        📊 Grouped View ({tickets.length} total tickets)
      </h3>
      
      {groups.map((group, index) => {
        const ticket = group.competition;
        const drawDate = new Date(ticket.drawDate);
        const isActive = new Date() < drawDate;
        
        return (
          <div
            key={index}
            className={`bg-[#2a3441] border border-cyan-500/30 rounded-lg p-3 cursor-pointer transition-all hover:bg-[#334155] ${
              selectedTicket === index ? 'border-cyan-400 bg-[#334155]' : ''
            }`}
            onClick={() => setSelectedTicket(selectedTicket === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={ticket.imageUrl}
                  alt="Prize"
                  className="w-10 h-10 rounded object-cover"
                  onError={(e) => {
                    e.target.src = '/images/default.jpg';
                  }}
                />
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {ticket.competitionTitle}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {group.totalQuantity} ticket{group.totalQuantity > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-xs font-semibold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {isActive ? '🟢 Active' : '🔴 Closed'}
                </p>
                <p className="text-xs text-gray-400">
                  {drawDate.toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedTicket === index && (
              <div className="mt-3 pt-3 border-t border-cyan-500/20">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Prize:</span>
                    <p className="text-cyan-300">{ticket.prize}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Entry Fee:</span>
                    <p className="text-white">{ticket.entryFee.toFixed(2)} π</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Theme:</span>
                    <p className="text-white capitalize">{ticket.theme}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <p className={ticket.gifted ? 'text-yellow-400' : 'text-green-400'}>
                      {ticket.gifted ? '🎁 Gifted' : '✅ Purchased'}
                    </p>
                  </div>
                </div>
                
                {group.tickets.length > 1 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-400">Ticket Numbers:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {group.tickets.map((t, i) => (
                        <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {t.ticketNumbers.join(', ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 
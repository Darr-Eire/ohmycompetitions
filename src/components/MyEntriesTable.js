'use client'

export default function MyEntriesTable({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white bg-opacity-10 rounded-2xl p-6 shadow-lg text-center text-white">
        <p>You haven't entered any competitions yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white bg-opacity-10 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">🎟️ My Entries</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white border-collapse">
          <thead>
            <tr className="text-left border-b border-white/20">
              <th className="py-2 pr-4">Competition</th>
              <th className="py-2 pr-4">Tickets</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="py-2 pr-4">{entry.competitionName || '—'}</td>
                <td className="py-2 pr-4">{entry.quantity || 1}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      entry.status === 'Won'
                        ? 'bg-green-600 text-white'
                        : entry.status === 'Not Selected'
                        ? 'bg-gray-600 text-white'
                        : 'bg-yellow-600 text-white'
                    }`}
                  >
                    {entry.status}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

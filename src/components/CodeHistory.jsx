// src/components/CodeHistory.jsx
import { useEffect, useState } from 'react';

const CodeHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/pi-cash-code/history');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="border border-cyan-700 bg-black/30 rounded-xl p-4 space-y-3 mt-6">
      <h3 className="text-cyan-300 font-semibold">📘 Past Code History</h3>
      {history.length === 0 ? (
        <p className="text-cyan-400 text-sm">No history yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {history.map((entry, i) => (
            <li key={i} className="border border-cyan-800 p-3 rounded-md">
              <div className="flex justify-between">
                <span className="text-cyan-300">Week {entry.weekStart}</span>
                <span className="text-white font-mono">{entry.code}</span>
              </div>
              <div className="text-xs text-cyan-500 mt-1">
                Winner: <strong>{entry.winner}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CodeHistory;

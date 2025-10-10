import { useEffect, useState } from 'react';

const LiveActivityFeed = () => {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/pi-cash-code/activity');
        const data = await res.json();
        setActivity(data.slice(0, 6)); // show last 6
      } catch (err) {
        console.error('Failed to load live activity:', err);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 10000); // every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-cyan-700 bg-black/30 rounded-xl p-4">
      <h3 className="text-cyan-300 font-semibold mb-2">Live Purchase Activity</h3>
      {activity.length === 0 ? (
        <p className="text-cyan-400 text-sm">No recent purchases activity.</p>
      ) : (
        <ul className="text-sm text-cyan-100 space-y-1 max-h-36 overflow-y-auto">
          {activity.map((entry, i) => (
            <li key={i}>
              <span className="text-cyan-400 font-medium">{entry.username}</span>{' '}
              purchased <span className="text-white">{entry.quantity}</span> ticket
              {entry.quantity > 1 ? 's' : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveActivityFeed;

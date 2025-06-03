import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [competitions, setCompetitions] = useState([]);
  const [entries, setEntries] = useState([]);
  const [audits, setAudits] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [compRes, auditRes] = await Promise.all([
        axios.get('/api/admin/competitions'),
        axios.get('/api/admin/audits')
      ]);
      setCompetitions(compRes.data);
      setAudits(auditRes.data);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async (competitionId) => {
    try {
      const res = await axios.get(`/api/admin/entries?competitionId=${competitionId}`);
      setEntries(res.data);
      setSelectedCompetition(competitionId);
    } catch (err) {
      console.error("Error fetching entries:", err);
    }
  };

  const triggerDraw = async (competitionId) => {
    try {
      const res = await axios.post('/api/competition/draw', { competitionId });
      alert(`Winner Selected: ${res.data.winner.userId}`);
      await loadData();
    } catch (err) {
      console.error("Error triggering draw:", err);
      alert("Draw failed.");
    }
  };

  const logPayout = async (auditId) => {
    const tx = prompt("Enter payout transaction hash:");
    if (!tx) return;
    try {
      await axios.post('/api/admin/payout', { auditId, payoutTx: tx });
      await loadData();
    } catch (err) {
      console.error("Error logging payout:", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-white text-xl">Loading admin panel...</div>;
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl mb-6 font-bold">OhMyCompetitions Admin Panel</h1>

      <section className="mb-10">
        <h2 className="text-xl mb-3">Competitions</h2>
        <div className="space-y-3">
          {competitions.map((comp) => (
            <div key={comp._id} className="border p-4 rounded bg-[#0a0a1f]">
              <div className="mb-2 font-semibold">
                {comp.title} — Prize: {comp.prize}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => fetchEntries(comp._id)}
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                >
                  View Entries
                </button>
                <button
                  onClick={() => triggerDraw(comp._id)}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
                >
                  Trigger Draw
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedCompetition && (
        <section className="mb-10">
          <h3 className="text-xl mb-3">Entries</h3>
          <ul className="list-disc pl-6 space-y-1">
            {entries.map((entry) => (
              <li key={entry._id}>
                {entry.userId} — <span className="text-xs text-gray-400">{entry.entryHash}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

    <section>
  <h2 className="text-xl mb-3">Audit Logs</h2>

  <button 
    onClick={() => window.open('/api/admin/audit-export')} 
    className="bg-blue-600 px-3 py-1 rounded mb-4"
  >
    Export Audit Logs
  </button>

  <div className="space-y-2">
    {audits.map(audit => (
      <div key={audit._id} className="border p-4 rounded bg-[#0a0a1f]">
        <div>Competition: {audit.competitionId}</div>
        <div>Winner Entry ID: {audit.winnerEntryId}</div>
        <div>Randomness Seed: {audit.randomnessSeed}</div>
        <div>
          Payout TX: {audit.payoutTx ? audit.payoutTx : <span className="text-yellow-400">Pending</span>}
        </div>
        {!audit.payoutTx && (
          <button
            onClick={() => logPayout(audit._id)}
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded mt-2"
          >
            Log Payout
          </button>
        )}
      </div>
    ))}
  </div>
</section>

    </div>
  );
}

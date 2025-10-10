import { useState } from 'react';
import Layout from '../../components/Layout';

export default function FreeCompetitionEntry() {
  const [slug, setSlug] = useState('free-welcome');
  const [username, setUsername] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/competitions/free/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionSlug: slug, username, proof: { url: proofUrl } })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setMsg('✅ Entered successfully');
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Free Competition Entry</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Competition Slug</label>
            <input value={slug} onChange={e=>setSlug(e.target.value)} className="w-full bg-[#0f172a] border border-cyan-700 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Your Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-[#0f172a] border border-cyan-700 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Proof URL (post link)</label>
            <input value={proofUrl} onChange={e=>setProofUrl(e.target.value)} className="w-full bg-[#0f172a] border border-cyan-700 rounded px-3 py-2" />
          </div>
          <button disabled={loading} className="neon-button px-4 py-2">{loading ? 'Submitting…' : 'Submit'}</button>
        </form>
        {msg && <div className="mt-3 text-sm">{msg}</div>}
      </div>
    </Layout>
  );
}



// pages/forums/reply.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ReplyPage() {
  const [body, setBody] = useState('');
  const [threadId, setThreadId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/forums/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, body }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Failed to post reply');
    } else {
      setBody('');
      router.push(`/forums/thread/${threadId}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded">
      <h1 className="text-2xl font-bold mb-4">Post a Reply</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Thread ID"
          value={threadId}
          onChange={(e) => setThreadId(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <textarea
          placeholder="Your reply..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full p-2 border rounded mb-4 h-32"
          required
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Submit Reply'}
        </button>
      </form>
    </div>
  );
}


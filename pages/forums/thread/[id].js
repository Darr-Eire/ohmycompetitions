import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ThreadPage() {
  const router = useRouter();
  const { id } = router.query;

  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchThreadAndReplies();
  }, [id]);

  const fetchThreadAndReplies = async () => {
    try {
      const res = await fetch(`/api/forums/thread/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load thread');
      setThread(data.thread);
      setReplies(data.replies);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load thread.');
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!body) return;

    const res = await fetch('/api/forums/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: id, body }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed to post reply');
    } else {
      setBody('');
      fetchThreadAndReplies();
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{thread?.title}</h1>
      <p className="mb-6 text-gray-700">{thread?.body}</p>

      <h2 className="text-xl font-semibold mb-2">Replies</h2>
      <div className="mb-6">
        {replies.length === 0 ? (
          <p className="text-gray-500">No replies yet.</p>
        ) : (
          replies.map((reply) => (
            <div key={reply._id} className="border p-3 mb-2 rounded bg-white">
              <p className="text-gray-800">{reply.body}</p>
              <p className="text-sm text-gray-500 mt-1">
                By {reply.userUid} • {new Date(reply.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleReplySubmit} className="space-y-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply..."
          className="w-full border p-2 rounded h-28"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Reply
        </button>
      </form>
    </div>
  );
}

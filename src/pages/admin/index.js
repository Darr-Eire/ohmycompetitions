'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminForumsPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const res = await axios.get('/api/admin/forums');
      setThreads(res.data);
    } catch (err) {
      console.error('Error loading threads:', err);
      setError('Failed to load threads');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this thread?')) return;
    try {
      await axios.delete('/api/admin/forums', { data: { id } });
      setThreads(threads.filter(thread => thread._id !== id));
    } catch (err) {
      console.error('Error deleting thread:', err);
      alert('Failed to delete.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Loading Forum Threads...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-orbitron">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Admin Forum Threads</h1>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {threads.length === 0 ? (
        <p>No threads found.</p>
      ) : (
        <table className="w-full border border-cyan-400 bg-[#111827]">
          <thead>
            <tr>
              <th className="p-3 border">Section</th>
              <th className="p-3 border">Title</th>
              <th className="p-3 border">Author</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {threads.map(thread => (
              <tr key={thread._id} className="text-center">
                <td className="p-3 border">{thread.section}</td>
                <td className="p-3 border">{thread.title}</td>
                <td className="p-3 border">{thread.author}</td>
                <td className="p-3 border">{new Date(thread.createdAt).toLocaleDateString()}</td>
                <td className="p-3 border">
                  <button
                    onClick={() => handleDelete(thread._id)}
                    className="bg-red-500 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

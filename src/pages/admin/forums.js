'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function AdminForumsPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    body: '',
    category: 'general',
    author: 'admin'
  });

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/forums');
      setThreads(res.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading threads', err);
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
      alert('Thread deleted successfully!');
    } catch (err) {
      console.error('Error deleting thread:', err);
      alert('Failed to delete thread.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.body.trim()) {
      alert('Title and body are required');
      return;
    }

    try {
      setCreating(true);
      const slug = newThread.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      const res = await axios.post('/api/admin/forums', {
        ...newThread,
        slug: `${slug}-${Date.now()}`
      });
      
      setThreads([res.data, ...threads]);
      setNewThread({ title: '', body: '', category: 'general', author: 'admin' });
      alert('Thread created successfully!');
    } catch (err) {
      console.error('Error creating thread:', err);
      alert('Failed to create thread.');
    } finally {
      setCreating(false);
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-cyan-400">Admin - Forum Management</h1>

        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

        {/* Create New Thread Form */}
        <div className="border border-cyan-400 rounded-lg p-6 bg-[#0f172a] mb-8">
          <h2 className="text-xl font-bold text-cyan-300 mb-4">Create New Thread</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Title</label>
              <input
                type="text"
                value={newThread.title}
                onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                placeholder="Thread title..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Category</label>
              <select
                value={newThread.category}
                onChange={(e) => setNewThread({...newThread, category: e.target.value})}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="general">General</option>
                <option value="vote">Vote</option>
                <option value="ideas">Ideas</option>
                <option value="winners">Winners</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Author</label>
              <input
                type="text"
                value={newThread.author}
                onChange={(e) => setNewThread({...newThread, author: e.target.value})}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                placeholder="Author name..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Content</label>
              <textarea
                value={newThread.body}
                onChange={(e) => setNewThread({...newThread, body: e.target.value})}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white h-32"
                placeholder="Thread content..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-2 rounded font-bold disabled:opacity-50"
            >
              {creating ? 'Creating...' : '➕ Create Thread'}
            </button>
          </form>
        </div>

        {/* Threads Table */}
        <div className="border border-cyan-400 rounded-lg bg-[#0f172a]">
          <div className="p-4 border-b border-cyan-600">
            <h2 className="text-xl font-bold text-cyan-300">Forum Threads ({threads.length})</h2>
          </div>
          
          {threads.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No forum threads found. Create one above to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cyan-800">
                  <tr>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Author</th>
                    <th className="p-3 text-left">Created</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {threads.map(thread => (
                    <tr key={thread._id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-3">
                        <div className="font-bold text-cyan-300">{thread.title}</div>
                        {thread.body && (
                          <div className="text-gray-400 text-xs mt-1 truncate max-w-xs">
                            {thread.body.substring(0, 100)}...
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-600 rounded text-xs capitalize">
                          {thread.category}
                        </span>
                      </td>
                      <td className="p-3">{thread.author}</td>
                      <td className="p-3 text-gray-400">
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/forums/${thread.slug}`}
                            className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(thread._id)}
                            className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={loadThreads}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-bold"
          >
            🔄 Refresh
          </button>
          <Link
            href="/forums"
            className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded font-bold"
          >
            📋 View Public Forums
          </Link>
          <Link
            href="/admin/dashboard"
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-bold"
          >
            ⬅️ Back to Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

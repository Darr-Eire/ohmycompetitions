'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function AdminForumsPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadThreads() {
      try {
        const res = await axios.get('/api/admin/forums');
        setThreads(res.data);
      } catch (err) {
        console.error('Error loading threads', err);
        setError('Failed to load threads');
      } finally {
        setLoading(false);
      }
    }

    loadThreads();
  }, []);

  if (loading) return <p className="text-white">Loading threads...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Admin Forum Threads</h1>

      <table className="w-full border border-cyan-500">
        <thead>
          <tr className="bg-[#0f172a]">
            <th className="p-3 border">Section</th>
            <th className="p-3 border">Title</th>
            <th className="p-3 border">Slug</th>
            <th className="p-3 border">Author</th>
            <th className="p-3 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {threads.map(thread => (
            <tr key={thread._id}>
              <td className="p-3 border">{thread.section}</td>
              <td className="p-3 border">{thread.title}</td>
              <td className="p-3 border">{thread.slug}</td>
              <td className="p-3 border">{thread.author}</td>
              <td className="p-3 border">{new Date(thread.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

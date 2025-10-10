'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function AdminForumsPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchThreads() {
      try {
        const res = await axios.get('/api/admin/forums');
        setThreads(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load threads');
      } finally {
        setLoading(false);
      }
    }
    fetchThreads();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading forum threads...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center mt-10">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Admin Forums</h1>

      <table className="w-full border border-cyan-400">
        <thead>
          <tr className="bg-[#0f172a]">
            <th className="p-3 border">Title</th>
            <th className="p-3 border">Section</th>
            <th className="p-3 border">Author</th>
            <th className="p-3 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {threads.map((thread) => (
            <tr key={thread._id} className="text-center border-t border-cyan-400">
              <td className="p-3">{thread.title}</td>
              <td className="p-3">{thread.section}</td>
              <td className="p-3">{thread.username}</td>
              <td className="p-3">{new Date(thread.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

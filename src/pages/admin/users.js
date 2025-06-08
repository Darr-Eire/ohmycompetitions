'use client';
import React, { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users').then(res => res.json()).then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete user?')) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setUsers(users.filter(u => u._id !== id));
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl mb-6">Admin Users</h1>
      {loading && <p>Loading...</p>}
      {users.map(user => (
        <div key={user._id} className="border p-4 mb-2 bg-[#111]">
          <p>Username: {user.username}</p>
          <p>Email: {user.email || 'N/A'}</p>
          <p>Role: {user.role}</p>
          <button onClick={() => handleDelete(user._id)} className="p-1 bg-red-400 text-black rounded">Delete</button>
        </div>
      ))}
    </div>
  );
}

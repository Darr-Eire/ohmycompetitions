'use client';

import React, { useState } from 'react';

export default function CreateSponsoredCompetition() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    prizePool: '',
    drawDate: '',
    partnerName: '',
    partnerLogoUrl: '',
    partnerWebsite: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch('/api/admin/create-competition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type: 'sponsored', entryFee: 0, status: 'open' }),
    });
    const data = await res.json();
    alert('Competition Created!');
  };

  return (
    <div className="max-w-md mx-auto p-5 bg-[#0f1b33] border border-cyan-400 rounded-xl text-white space-y-3">
      <h2 className="text-lg font-bold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text">
        Create Sponsored Competition
      </h2>

      <input className="w-full p-2 rounded text-black" placeholder="Competition Title" name="title" onChange={handleChange} />
      <textarea className="w-full p-2 rounded text-black" placeholder="Description" name="description" onChange={handleChange} />
      <input className="w-full p-2 rounded text-black" placeholder="Prize Pool (π)" name="prizePool" onChange={handleChange} />
      <input className="w-full p-2 rounded text-black" placeholder="Draw Date (YYYY-MM-DD)" name="drawDate" onChange={handleChange} />
      
      <input className="w-full p-2 rounded text-black" placeholder="Partner Name" name="partnerName" onChange={handleChange} />
      <input className="w-full p-2 rounded text-black" placeholder="Partner Logo URL" name="partnerLogoUrl" onChange={handleChange} />
      <input className="w-full p-2 rounded text-black" placeholder="Partner Website" name="partnerWebsite" onChange={handleChange} />

      <button onClick={handleSubmit} className="w-full py-2 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] rounded text-black font-bold">
        Create
      </button>
    </div>
  );
}

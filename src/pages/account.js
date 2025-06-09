'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { countries } from 'data/countries'; 
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!session?.user?.email) return;

    fetchUser(session.user.email);
    fetchTickets(session.user.email);
  }, [session, status]);

  const fetchUser = async (email) => {
    try {
      const res = await axios.post('/api/user/me', { email });
      setUser(res.data);
      setSelectedCountry(res.data.country);
    } catch (err) {
      console.error('Failed to load user', err);
    }
  };

  const fetchTickets = async (email) => {
    try {
      const res = await axios.post('/api/user/tickets', { email });
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to load tickets', err);
    }
  };

  const handleCountryChange = async (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    try {
      await axios.post('/api/user/update-country', {
        email: session.user.email,
        country: newCountry,
      });
    } catch (err) {
      console.error('Failed to update country', err);
    }
  };

  if (status === 'loading') {
    return <div className="text-white text-center mt-10">Loading session...</div>;
  }

  if (!user) {
    return <div className="text-white text-center mt-10">Loading your account data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-3xl mb-6 font-orbitron text-center">My Account</h1>

      <div className="bg-[#111827] rounded-2xl shadow-lg p-6 mb-8 border border-cyan-400">
        <h2 className="text-xl mb-4 font-semibold">Personal Info</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {session.user.email}</p>

        <div className="mt-4">
          <label className="block mb-2">Country:</label>
          <select
            className="p-2 rounded text-black"
            value={selectedCountry}
            onChange={handleCountryChange}
          >
            {countries.map(c => (
              <option key={c.code} value={c.name}>{c.name}</option>
            ))}
          </select>

          {selectedCountry && selectedCountry.trim() !== '' && (
            <div className="mt-2 flex items-center">
              <Image 
                src={`/flags/${selectedCountry}.png`} 
                alt={`${selectedCountry} flag`} 
                width={40} 
                height={25} 
                className="rounded shadow" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="ml-2">{selectedCountry}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#111827] rounded-2xl shadow-lg p-6 mb-8 border border-cyan-400">
        <h2 className="text-xl mb-4 font-semibold">Tickets Summary</h2>
        <p><strong>Total Tickets Purchased:</strong> {tickets.reduce((acc, t) => acc + t.quantity, 0)}</p>
      </div>

      <div className="bg-[#111827] rounded-2xl shadow-lg p-6 border border-cyan-400">
        <h2 className="text-xl mb-4 font-semibold">Purchase History</h2>
        {tickets.length === 0 ? (
          <p>You have not purchased any tickets yet.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <div key={index} className="p-4 bg-[#1f2937] rounded-lg border border-cyan-500">
                <p><strong>Competition:</strong> {ticket.competitionTitle}</p>
                <p><strong>Tickets Purchased:</strong> {ticket.quantity}</p>
                <p><strong>Purchase Date:</strong> {new Date(ticket.purchasedAt).toLocaleDateString()}</p>
                <p><strong>Ticket Numbers:</strong> {ticket.ticketNumbers.join(', ')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

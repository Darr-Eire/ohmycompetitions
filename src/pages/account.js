'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { countries } from 'data/countries';  // <-- Make sure this file exists
import Image from 'next/image';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    fetchUser();
    fetchTickets();
  }, []);

  const fetchUser = async () => {
    const piUserId = localStorage.getItem('piUserId');  // Pi UID stored after login

    if (!piUserId) {
      console.error("No Pi User ID found in localStorage");
      return;
    }

    const res = await axios.post('/api/user/me', { piUserId });  // <-- POST not GET now
    setUser(res.data);
    setSelectedCountry(res.data.country);
  };

  const fetchTickets = async () => {
    const piUserId = localStorage.getItem('piUserId');
    if (!piUserId) return;

    const res = await axios.post('/api/user/tickets', { piUserId });
    setTickets(res.data);
  };

  const handleCountryChange = async (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    const piUserId = localStorage.getItem('piUserId');

    await axios.post('/api/user/update-country', { piUserId, country: newCountry });
  };

  if (!user) return <div className="text-white text-center mt-10">Loading your account...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-3xl mb-6 font-orbitron text-center">My Account</h1>

      {/* User Info */}
      <div className="bg-[#111827] rounded-2xl shadow-lg p-6 mb-8 border border-cyan-400">
        <h2 className="text-xl mb-4 font-semibold">Personal Info</h2>
        <p><strong>Username:</strong> {user.username}</p>

        {/* Country Selector */}
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
          {selectedCountry && (
            <div className="mt-2 flex items-center">
              <Image src={`/flags/${selectedCountry}.png`} alt="" width={40} height={25} className="rounded shadow" />
              <span className="ml-2">{selectedCountry}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="bg-[#111827] rounded-2xl shadow-lg p-6 mb-8 border border-cyan-400">
        <h2 className="text-xl mb-4 font-semibold">Tickets Summary</h2>
        <p><strong>Total Tickets Purchased:</strong> {tickets.reduce((acc, t) => acc + t.quantity, 0)}</p>
      </div>

      {/* Ticket Purchase History */}
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

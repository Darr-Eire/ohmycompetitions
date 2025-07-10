'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function EditCompetition() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({
    comp: {
      slug: '',
      entryFee: '',
      totalTickets: '',
      piAmount: '',
      paymentType: 'pi',
      status: 'active'
    },
    title: '',
    prize: '',
    theme: '',
    description: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check admin auth on component mount
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin/login');
      return;
    }

    if (!id || loaded) return;

    async function loadCompetition() {
      try {
        const adminData = JSON.parse(localStorage.getItem('adminUser'));
        const res = await fetch(`/api/admin/competitions/${id}`, {
          headers: {
            'Authorization': `Bearer ${adminData.token}`
          }
        });
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/admin/login');
            return;
          }
          throw new Error(data.message || 'Failed to load competition');
        }

        // Ensure all form values are strings and handle nested structure
        setForm({
          comp: {
            slug: String(data.comp?.slug || ''),
            entryFee: String(data.comp?.entryFee || ''),
            totalTickets: String(data.comp?.totalTickets || ''),
            piAmount: String(data.comp?.piAmount || ''),
            paymentType: data.comp?.paymentType || 'pi',
            status: data.comp?.status || 'active'
          },
          title: String(data.title || ''),
          prize: String(data.prize || ''),
          theme: String(data.theme || ''),
          description: String(data.description || '')
        });
        setLoaded(true);
      } catch (err) {
        console.error('Error loading competition:', err);
        setError(err.message || 'Failed to load competition');
        // Reset form to empty strings on error
        setForm({
          comp: {
            slug: '',
            entryFee: '',
            totalTickets: '',
            piAmount: '',
            paymentType: 'pi',
            status: 'active'
          },
          title: '',
          prize: '',
          theme: '',
          description: ''
        });
      }
    }

    loadCompetition();
  }, [id, loaded, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle nested comp fields
    if (['slug', 'entryFee', 'totalTickets', 'piAmount', 'paymentType', 'status'].includes(name)) {
      setForm(prev => ({
        ...prev,
        comp: {
          ...prev.comp,
          [name]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const adminData = JSON.parse(localStorage.getItem('adminUser'));
      const res = await fetch(`/api/admin/competitions/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminData.token}`
        },
        body: JSON.stringify({
          comp: {
            slug: form.comp.slug,
            entryFee: parseFloat(form.comp.entryFee) || 0,
            totalTickets: parseInt(form.comp.totalTickets) || 0,
            piAmount: parseFloat(form.comp.piAmount) || 0,
            paymentType: form.comp.paymentType,
            status: form.comp.status
          },
          title: form.title,
          prize: form.prize,
          theme: form.theme || 'tech',
          description: form.description
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error(data.message || 'Failed to update competition');
      }
      
      router.push('/admin/competitions');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Edit Competition</h1>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 p-4 border border-cyan-400/30 rounded-lg">
          <h2 className="text-xl font-semibold text-cyan-300">Basic Details</h2>
          {['slug', 'entryFee', 'totalTickets', 'piAmount'].map((field) => (
            <div key={field} className="space-y-1">
              <label className="block text-sm font-medium text-cyan-300">
                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                name={field}
                value={form.comp[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                className="w-full p-3 rounded bg-black border border-cyan-400"
                required
              />
            </div>
          ))}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-cyan-300">Payment Type</label>
            <select
              name="paymentType"
              value={form.comp.paymentType}
              onChange={handleChange}
              className="w-full p-3 rounded bg-black border border-cyan-400"
            >
              <option value="pi">Pi</option>
              <option value="free">Free</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-cyan-300">Status</label>
            <select
              name="status"
              value={form.comp.status}
              onChange={handleChange}
              className="w-full p-3 rounded bg-black border border-cyan-400"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 p-4 border border-cyan-400/30 rounded-lg">
          <h2 className="text-xl font-semibold text-cyan-300">Competition Details</h2>
          {['title', 'prize'].map((field) => (
            <div key={field} className="space-y-1">
              <label className="block text-sm font-medium text-cyan-300">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="w-full p-3 rounded bg-black border border-cyan-400"
                required
              />
            </div>
          ))}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-cyan-300">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Competition description"
              className="w-full p-3 rounded bg-black border border-cyan-400 h-32"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-cyan-300">Theme</label>
            <select
              name="theme"
              value={form.theme}
              onChange={handleChange}
              className="w-full p-3 rounded bg-black border border-cyan-400"
            >
              <option value="">Select Theme</option>
              <option value="tech">Tech</option>
              <option value="premium">Premium</option>
              <option value="daily">Daily</option>
              <option value="free">Free</option>
              <option value="pi">Pi</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-3 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Competition'}
        </button>
      </form>
    </div>
  );
}

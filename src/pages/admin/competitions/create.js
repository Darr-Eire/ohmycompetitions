'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../../components/AdminSidebar';

export default function CreateCompetitionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    prize: '',
    description: '',
    totalTickets: 100,
    entryFee: 1,
    piAmount: 1,
    theme: 'tech',
    startsAt: '',
    endsAt: '',
    status: 'active',
    imageUrl: ''
  });

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Auto-generate slug if not provided
      const submitData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        piAmount: formData.piAmount || formData.entryFee
      };

      console.log('Submitting data:', submitData);

      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create competition');
      }
      
      const data = await res.json();
      alert('✅ Competition created successfully!');
      router.push('/admin/competitions');
    } catch (err) {
      console.error('Error creating competition:', err);
      alert('❌ Failed to create competition: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // Auto-update slug when title changes
      if (name === 'title' && !prev.slug) {
        newData.slug = generateSlug(value);
      }

      // Auto-update piAmount when entryFee changes
      if (name === 'entryFee') {
        newData.piAmount = value;
      }

      return newData;
    });
  };

  return (
    <AdminSidebar>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">➕ Create New Competition</h1>
          <p className="text-gray-400 mt-1">Set up a new competition with prizes and rules</p>
        </div>

        {/* Form */}
        <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2">
                  Competition Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                  placeholder="e.g., Win a PlayStation 5"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                  placeholder="e.g., win-playstation-5"
                />
                <p className="text-xs text-gray-400 mt-1">Auto-generated from title. Used in competition URL.</p>
              </div>

              {/* Prize */}
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2">
                  Prize *
                </label>
                <input
                  type="text"
                  name="prize"
                  value={formData.prize}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                  placeholder="e.g., PlayStation 5 Console"
                />
              </div>

              {/* Theme */}
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2">
                  Theme *
                </label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white focus:border-cyan-300 focus:outline-none"
                >
                  <option value="tech">Tech</option>
                  <option value="premium">Premium</option>
                  <option value="pi">Pi Rewards</option>
                  <option value="daily">Daily</option>
                  <option value="crypto">Crypto</option>
                  <option value="free">Free</option>
                </select>
              </div>

              {/* Total Tickets */}
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2">
                  Total Tickets *
                </label>
                <input
                  type="number"
                  name="totalTickets"
                  value={formData.totalTickets}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                />
              </div>

              {/* Entry Fee */}
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2">
                  Entry Fee (π) *
                </label>
                <input
                  type="number"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                />
              </div>

              {/* Pi Amount */}
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2">
                  Pi Amount *
                </label>
                <input
                  type="number"
                  name="piAmount"
                  value={formData.piAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Usually same as entry fee</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white focus:border-cyan-300 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="startsAt"
                  value={formData.startsAt}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty to start immediately</p>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  name="endsAt"
                  value={formData.endsAt}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                placeholder="Describe the competition and prize details..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-2">
                Competition Image
              </label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                placeholder="e.g., /images/playstation.jpeg or https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use existing images from /public/images/ folder or provide external URL. Leave empty for default image.
              </p>
              
              {/* Available Images Preview */}
              <div className="mt-3">
                <p className="text-xs text-cyan-400 mb-2">📸 Quick select from available images:</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'imageUrl', value: '/images/playstation.jpeg' } })}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
                  >
                    🎮 PlayStation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'imageUrl', value: '/images/xbox.jpeg' } })}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
                  >
                    🎯 Xbox
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'imageUrl', value: '/images/nintendo.png' } })}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
                  >
                    🎲 Nintendo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'imageUrl', value: '/images/tv.jpg' } })}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
                  >
                    📺 Smart TV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'imageUrl', value: '/images/airpods.png' } })}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
                  >
                    🎧 AirPods
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'imageUrl', value: '/images/bitcoin.png' } })}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
                  >
                    💰 Pi/Crypto
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'imageUrl', value: '/images/glasses.jpg' } })}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
                  >
                    🕶️ Glasses
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'imageUrl', value: '/images/hotel.jpeg' } })}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
                  >
                    🏨 Travel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'imageUrl', value: '/images/daily.png' } })}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
                  >
                    ⭐ Daily
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="mt-3">
                  <p className="text-xs text-cyan-400 mb-2">🖼️ Preview:</p>
                  <div className="w-32 h-24 bg-gray-800 rounded border border-gray-600 overflow-hidden">
                    <img 
                      src={formData.imageUrl} 
                      alt="Competition preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Creating...' : '✅ Create Competition'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin/competitions')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition"
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <h3 className="text-blue-400 font-bold mb-2">💡 Tips for Creating Competitions</h3>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>Choose clear, engaging titles that describe the prize</li>
            <li>Slug is used in the competition URL (/competitions/your-slug)</li>
            <li>Set reasonable ticket limits based on expected participation</li>
            <li>Entry fees in Pi should reflect the prize value</li>
            <li>End dates should allow sufficient time for ticket sales</li>
            <li>Detailed descriptions help users understand what they're entering for</li>
          </ul>
        </div>
      </div>
    </AdminSidebar>
  );
}

'use client';

import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';

export default function SeedCompetitionsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSeedCompetitions = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed-competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed competitions');
      }

      setResult(data);
    } catch (err) {
      console.error('Error seeding competitions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSidebar>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">🌱 Seed Competitions</h1>
          <p className="text-gray-400 mt-1">Add predefined competitions to your database</p>
        </div>

        {/* Info Card */}
        <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-cyan-300 mb-4">📋 What This Does</h2>
          <p className="text-gray-300 mb-4">
            This will add the following predefined competitions to your database:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="text-cyan-400 font-semibold mb-2">🎮 Tech Competitions</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• PS5 Bundle Giveaway</li>
                <li>• 55″ Smart TV Giveaway</li>
                <li>• Xbox One Bundle</li>
                <li>• Nintendo Switch Console</li>
                <li>• Apple AirPods Pro</li>
                <li>• Ray-Ban Meta Smart Glasses</li>
              </ul>
            </div>
            <div>
              <h3 className="text-cyan-400 font-semibold mb-2">✈️ Premium & Others</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Dubai Luxury Vacation</li>
                <li>• Luxury Penthouse Weekend</li>
                <li>• Weekly Pi Rewards</li>
                <li>• Daily Pi Jackpot</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Only competitions that don't already exist will be added. Existing competitions won't be duplicated.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-6">
          <div className="text-center">
            <button
              onClick={handleSeedCompetitions}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Seeding Competitions...
                </div>
              ) : (
                '🌱 Seed Competitions Database'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-[#0f172a] border border-green-400 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-400 mb-4">✅ Seeding Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{result.data.existingCount}</div>
                <div className="text-xs text-gray-400">Existing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{result.data.newlyAdded}</div>
                <div className="text-xs text-gray-400">Added</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{result.data.errors}</div>
                <div className="text-xs text-gray-400">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{result.data.totalAfter}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>

            {result.data.results.length > 0 && (
              <div>
                <h3 className="text-cyan-300 font-semibold mb-2">📝 Detailed Results</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.data.results.map((item, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        item.status === 'success'
                          ? 'bg-green-900/20 border border-green-600 text-green-300'
                          : 'bg-red-900/20 border border-red-600 text-red-300'
                      }`}
                    >
                      <span className="font-semibold">{item.title}</span> ({item.slug})
                      {item.error && (
                        <div className="text-xs mt-1 opacity-80">Error: {item.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#0f172a] border border-red-400 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2">❌ Error</h2>
            <p className="text-gray-300">{error}</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-[#0f172a] border border-blue-400 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-400 mb-4">🎯 Next Steps</h2>
          <div className="text-gray-300 space-y-2">
            <p>After seeding competitions:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Visit the <a href="/" className="text-cyan-400 hover:underline">homepage</a> to see competitions displayed</li>
              <li>Check <a href="/admin/competitions" className="text-cyan-400 hover:underline">competition management</a> to edit details</li>
              <li>Users can now purchase tickets for these competitions</li>
              <li>Monitor sales and draw winners when competitions end</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
} 
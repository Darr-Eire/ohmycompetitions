import { getAllDescriptions } from 'utils/getDescriptions';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminGuard from '../../../components/AdminGuard';

export default function CreateCompetitionPage({ descriptions = [] }) {
  const router = useRouter();
  const now = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(now.getDate() + 7);

  const defaultStart = now.toISOString().slice(0, 16);
  const defaultEnd = sevenDaysLater.toISOString().slice(0, 16);

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
    startsAt: defaultStart,
    endsAt: defaultEnd,
    status: 'active',
    imageUrl: '',
    thumbnail: '',
    maxTickets: 1,
    numberOfWinners: 1
  });

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
      const submitData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        piAmount: formData.piAmount || formData.entryFee
      };

      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create competition');
      }

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
      const ImageOption = ({ label, path }) => (
  <button
    type="button"
    onClick={() => handleChange({ target: { name: 'imageUrl', value: path } })}
    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
  >
    {label}
  </button>
);

      const newData = {
        ...prev,
        [name]: value
      };
      if (name === 'title' && !prev.slug) {
        newData.slug = generateSlug(value);
      }
      if (name === 'entryFee') {
        newData.piAmount = value;
      }
      return newData;
    });
  };
const ImageOption = ({ label, path }) => (
  <button
    type="button"
    onClick={() =>
      handleChange({ target: { name: 'imageUrl', value: path } })
    }
    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-left transition"
  >
    {label}
  </button>
);

  return (
    <AdminGuard>
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
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Competition Title *</label>
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
                  <label className="block text-cyan-300 text-sm font-bold mb-2">URL Slug *</label>
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
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Prize *</label>
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
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Theme *</label>
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
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Total Tickets *</label>
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

                {/* Max Tickets */}
                <div>
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Max Tickets per User *</label>
                  <input
                    type="number"
                    name="maxTickets"
                    value={formData.maxTickets}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                  />
                </div>

                {/* Number of Winners */}
                <div>
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Number of Winners *</label>
                  <input
                    type="number"
                    name="numberOfWinners"
                    value={formData.numberOfWinners}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                  />
                </div>

                {/* Entry Fee */}
                <div>
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Entry Fee (π) *</label>
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
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Pi Amount *</label>
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
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Status *</label>
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
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Competition Start Date (optional)</label>
                  <input
                    type="datetime-local"
                    name="startsAt"
                    value={formData.startsAt}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white focus:border-cyan-300 focus:outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty to start immediately.</p>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-cyan-300 text-sm font-bold mb-2">Competition End Date (required)</label>
                  <input
                    type="datetime-local"
                    name="endsAt"
                    value={formData.endsAt}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white focus:border-cyan-300 focus:outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">When ticket sales close. Format: YYYY-MM-DDTHH:MM.</p>
                </div>
              </div>

              {/* Description Dropdown */}
            <div>
  <label className="block text-cyan-300 text-sm font-bold mb-2">
    Description (optional)
  </label>

  <select
    className="w-full px-4 py-2 mb-2 bg-black border border-cyan-400 rounded-lg text-white focus:border-cyan-300 focus:outline-none"
  >
    <option value="">Select a preset description (view only)</option>
    {descriptions.map((desc, idx) => (
      <option key={idx} value={desc}>{desc.slice(0, 50)}...</option>
    ))}
  </select>

  <textarea
    placeholder="Write your own description here..."
    className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white focus:border-cyan-300 focus:outline-none"
    rows={4}
  />
</div>

{/* Image URL and buttons */}
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
    placeholder="e.g., /images/playstation.png or https://example.com/image.jpg"
  />
  <p className="text-xs text-gray-400 mt-1">
    Use existing images from /public/images/ folder or provide external URL. Leave empty for default image.
  </p>

  {/* Available Images Preview */}
  <div className="mt-3">
    <p className="text-sm text-cyan-400 mb-2">Quick select from available images:</p>

    {/* Tech / Featured */}
    <p className="text-cyan-300 text-xs font-semibold mt-4 mb-1">🎮 Tech / Featured</p>
    <div className="grid grid-cols-3 gap-2 text-xs">
      <ImageOption label="PlayStation" path="/images/playstation.png" />
      <ImageOption label="PlayStation 5" path="/images/playstation1.png" />
      <ImageOption label="PS5 Digital" path="/images/playstation2.png" />
      <ImageOption label="Xbox" path="/images/xbox.png" />
      <ImageOption label="Xbox Series S" path="/images/xbox1.png" />
      <ImageOption label="Fortnite Xbox" path="/images/xbox3.png" />
      <ImageOption label="Game Pass 12 Month" path="/images/xbox4.png" />
      <ImageOption label="Nintendo Switch" path="/images/nintendo.png" />
      <ImageOption label="MacBook" path="/images/macbook.png" />
      <ImageOption label="iPhone" path="/images/iphone.png" />
      <ImageOption label="AirPods" path="/images/airpods.png" />
      <ImageOption label="Smart TV" path="/images/tv.png" />
      <ImageOption label="Gaming Chair" path="/images/chair.png" />
      <ImageOption label="Scooter" path="/images/scooter.png" />
      <ImageOption label="Match Day" path="/images/matchday.png" />
      <ImageOption label="Viture" path="/images/viture.png" />
      <ImageOption label="Ray-Ban 1" path="/images/rayban1.png" />
      <ImageOption label="Bundle" path="/images/bundle.png" />
    </div>

    {/* Daily Competitions */}
    <p className="text-cyan-300 text-xs font-semibold mt-4 mb-1">🗓️ Daily Competitions</p>
    <div className="grid grid-cols-3 gap-2 text-xs">
      <ImageOption label="Pi Giveaway" path="/images/pi1.png" />
      <ImageOption label="Pi Power" path="/images/pi2.png" />
      <ImageOption label="Pi Giveaway Alt" path="/images/pi3.png" />
      <ImageOption label="Early Pioneers" path="/images/pi4.png" />
      <ImageOption label="500 Pi Giveaway" path="/images/pi5.png" />
    </div>

    {/* Travel */}
    <p className="text-cyan-300 text-xs font-semibold mt-4 mb-1">🌴 Travel</p>
    <div className="grid grid-cols-3 gap-2 text-xs">
      <ImageOption label="Dubai Holiday" path="/images/dubai-luxury-holiday.png" />
      <ImageOption label="Hotel Stay" path="/images/hotel.png" />
      <ImageOption label="Spa Retreat" path="/images/spa.png" />
      <ImageOption label="Weekend Getaway" path="/images/weekend.png" />
      <ImageOption label="First Class" path="/images/first.png" />
    </div>

    {/* Crypto */}
    <p className="text-cyan-300 text-xs font-semibold mt-4 mb-1">💰 Crypto</p>
    <div className="grid grid-cols-3 gap-2 text-xs">
      <ImageOption label="Bitcoin" path="/images/bitcoin.png" />
      <ImageOption label="Ethereum" path="/images/ethereum.png" />
      <ImageOption label="Litecoin" path="/images/litecoin.png" />
      <ImageOption label="Ripple" path="/images/ripple.png" />
      <ImageOption label="XRP" path="/images/xrp.png" />
      <ImageOption label="Pi Network" path="/images/pi.png" />
      <ImageOption label="BNB" path="/images/bnb.png" />
      <ImageOption label="SUI" path="/images/sui.png" />
      <ImageOption label="HBAR" path="/images/hbar.png" />
      <ImageOption label="SOL" path="/images/sol.png" />
      <ImageOption label="GT Token" path="/images/gt.png" />
    </div>

    {/* Promo */}
    <p className="text-cyan-300 text-xs font-semibold mt-4 mb-1">📢 Promo</p>
    <div className="grid grid-cols-3 gap-2 text-xs">
      <ImageOption label="Sponsor Banner" path="/images/sponsor-banner.png" />
      <ImageOption label="Your Logo" path="/images/your logo.png" />
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
    </AdminGuard>
  );
}

export async function getStaticProps() {
  const descriptions = getAllDescriptions();
  return {
    props: {
      descriptions,
    },
  };
}

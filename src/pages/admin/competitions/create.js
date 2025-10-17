import { getAllDescriptions } from 'utils/getDescriptions';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
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
  maxPerUser: 1,       // ✅ renamed from maxTickets
  winnersCount: 1,     // ✅ renamed from numberOfWinners
  prizes: ['']
});



  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };
const handlePrizeChange = (index, value) => {
  const updatedPrizes = [...formData.prizes];
  updatedPrizes[index] = value;
  setFormData({ ...formData, prizes: updatedPrizes });
};

const addPrize = () => {
  if (formData.prizes.length < 10) {
    setFormData({ ...formData, prizes: [...formData.prizes, ''] });
  }
};

const removePrize = (index) => {
  const updatedPrizes = formData.prizes.filter((_, i) => i !== index);
  setFormData({ ...formData, prizes: updatedPrizes });
};



const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const submitData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
      piAmount: formData.piAmount || formData.entryFee,
      prize: formData.prizes[0] || '',
      prizeBreakdown: formData.prizes.filter(p => p.trim() !== '') // Add this line
    };

    const res = await fetch('/api/admin/competitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData),
    });

    // ...
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

            {/* Dynamic Prizes */}
<div>
  <label className="block text-cyan-300 text-sm font-bold mb-2">Prizes *</label>

  {formData.prizes.map((prize, index) => (
    <div key={index} className="flex items-center gap-2 mb-2">
      <input
        type="text"
        name={`prize-${index}`}
        value={prize}
        onChange={(e) => handlePrizeChange(index, e.target.value)}
        required
        className="flex-grow px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
        placeholder={`Prize ${index + 1}`}
      />
      {formData.prizes.length > 1 && (
        <button
          type="button"
          onClick={() => removePrize(index)}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          ✕
        </button>
      )}
    </div>
  ))}

  {formData.prizes.length < 10 && (
    <button
      type="button"
      onClick={addPrize}
      className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm underline"
    >
       Add another prize
    </button>
  )}
</div>


              {/* Theme */}
<div>
  <label className="block text-cyan-300 text-sm font-bold mb-2">Category (Theme) *</label>
  <select
    name="theme"
    value={formData.theme}
    onChange={handleChange}
    className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white focus:border-cyan-300 focus:outline-none"
  >
    <option value="tech">💻 Featured / Tech</option>
    <option value="premium">🌴 Travel & Lifestyle</option>
    <option value="pi">🟡 Pi Giveaways</option>
    <option value="daily">📆 Daily Competitions</option>
    <option value="crypto">💰 Crypto Giveaways</option>
    <option value="free">🆓 Free</option>
    <option value="regional">🌍 Regional Giveaways</option>
    <option value="event">🎉 Special Events</option>
    <option value="launch">🚀 OMC Launch Week</option>
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

              {/* Max Tickets per User */}
<div>
  <label className="block text-cyan-300 text-sm font-bold mb-2">Max Tickets per User *</label>
  <input
    type="number"
    name="maxPerUser" // CHANGE THIS FROM "maxTickets"
    value={formData.maxPerUser}
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
    name="winnersCount" // CHANGE THIS FROM "numberOfWinners"
    value={formData.winnersCount}
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

  {/* If you want the preset descriptions to also populate the textarea,
      you'd need to add onChange to this select and update formData.description.
      For now, keeping it 'view only' as per your comment, but note it's not interactive. */}
  <select
    className="w-full px-4 py-2 mb-2 bg-black border border-cyan-400 rounded-lg text-white focus:border-cyan-300 focus:outline-none"
    // If you want this to *apply* a description to the textarea:
    // onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
    // value="" // You might not want a value here if it's just a selector
  >
    <option value="">Select a preset description (view only)</option>
    {descriptions.map((desc, idx) => (
      <option key={idx} value={desc}>{desc.slice(0, 50)}...</option>
    ))}
  </select>

  <textarea
    name="description" // ADD THIS
    value={formData.description} // ADD THIS
    onChange={handleChange} // ADD THIS
    placeholder="Write your own description here..."
    className="w-full px-4 py-2 bg-black border border-cyan-400 rounded-lg text-white focus:border-cyan-300 focus:outline-none"
    rows={4}
  />
</div>


                    {/* Image URL and buttons */}
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
  <p className="text-sm text-cyan-400 mb-2">Quick select from available images:</p>

  {/* Tech */}
  <p className="text-cyan-300 text-xs font-semibold mt-4 mb-1">🎮 Tech/Featured</p>
  <div className="grid grid-cols-3 gap-2 text-xs">
    <ImageOption label="PlayStation" path="/images/playstation.jpeg" />
    <ImageOption label="Xbox" path="/images/xbox.jpeg" />
    <ImageOption label="Nintendo" path="/images/nintendo.png" />
    <ImageOption label="MacBook" path="/images/macbook.jpeg" />
    <ImageOption label="iPhone" path="/images/iphone.jpeg" />
    <ImageOption label="AirPods" path="/images/airpods.png" />
    <ImageOption label="GoPro" path="/images/gopro.png" />
    <ImageOption label="Viture" path="/images/viture.png" />
   <ImageOption label="Smart TV" path="/images/tv.jpg" />
    <ImageOption label="Gaming Chair" path="/images/chair.png" />
     <ImageOption label="Scooter" path="/images/scooter.png" />
  </div>



  {/* Travel */}
  <p className="text-cyan-300 text-xs font-semibold mt-4 mb-1">🌴 Travel</p>
  <div className="grid grid-cols-3 gap-2 text-xs">
    <ImageOption label="Weekend" path="/images/weekend.jpeg" />
    <ImageOption label="Dubai Holiday" path="/images/dubai-luxury-holiday.png" />
    <ImageOption label="Spa" path="/images/spa.jpeg" />
    <ImageOption label="Hotel Stay" path="/images/hotel.jpeg" />
  </div>

{/* Crypto */}
<p className="text-cyan-300 text-xs font-semibold mt-4 mb-1">💰 Crypto</p>
<div className="grid grid-cols-3 gap-2 text-xs">
  <ImageOption label="Bitcoin" path="/images/bitcoin.png" />
  <ImageOption label="Pi" path="/images/pi.png" />
  <ImageOption label="XRP" path="/images/xrp.png" />
</div>

{/* Daily */}
<p className="text-cyan-300 text-xs font-semibold mt-4 mb-1">📆 Daily</p>
<div className="grid grid-cols-3 gap-2 text-xs">
    <ImageOption label="Pi 4" path="/images/pi4.png" />
  <ImageOption label="Pi 3" path="/images/pi3.png" />
  <ImageOption label="Pi 2" path="/images/pi2.png" />
  <ImageOption label="Pi 1" path="/images/pi1.png" />
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

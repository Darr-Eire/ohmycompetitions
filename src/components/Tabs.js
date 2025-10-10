// components/Tabs.jsx
const PRIZE_RANGES = [0.2, 0.5, 1.0, 2.0, 5.0];

export default function Tabs({ selectedTab, setSelectedTab, selectedPrize, setSelectedPrize }) {
  return (
    <>
      {/* Tab Switcher */}
      <div className="flex justify-center gap-4 mb-4">
        {['open', 'friends'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-bold border ${
              selectedTab === tab
                ? 'bg-cyan-500 text-[#0f172a]'
                : 'bg-transparent text-white border-cyan-600'
            }`}
          >
            {tab === 'open' ? 'Open Battles' : 'Friends Only'}
          </button>
        ))}
      </div>

      {/* Prize Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 overflow-auto">
        <button
          onClick={() => setSelectedPrize(null)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            selectedPrize === null ? 'bg-cyan-300 text-[#0f172a]' : 'border-cyan-500 text-white'
          }`}
        >
          All Prizes
        </button>
        {PRIZE_RANGES.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPrize(p)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              selectedPrize === p ? 'bg-cyan-300 text-[#0f172a]' : 'border-cyan-500 text-white'
            }`}
          >
            {p} π
          </button>
        ))}
      </div>
    </>
  );
}

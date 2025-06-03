'use client';
export default function PiLotteryTerms() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-8 font-orbitron">
      <div className="max-w-3xl mx-auto bg-[#1e293bcc] backdrop-blur-md border border-cyan-600 rounded-xl shadow-lg p-6 space-y-6">

        <div className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 text-black px-6 py-3 rounded-lg shadow-inner">
          Pi Lottery Terms & Conditions
        </div>

        <p className="text-sm text-gray-300 text-center">
          Welcome to the official Pi Lottery. Please review the following terms before participating.
        </p>

        {/* Section 1 */}
        <div>
          <h3 className="text-lg sm:text-xl text-cyan-300 font-semibold border border-cyan-600 px-4 py-2 rounded mb-2 text-center">
            General Rules
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-200">
            <li>You must have a verified Pi Wallet to enter.</li>
            <li>Tickets cost exactly 1 π and cannot be refunded.</li>
            <li>Each ticket represents one entry for the upcoming draw.</li>
            <li>You may enter as many times as you want before the deadline.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div>
          <h3 className="text-lg sm:text-xl text-cyan-300 font-semibold border border-cyan-600 px-4 py-2 rounded mb-2 text-center">
             Number Selection
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-200">
            <li>Select 5 main numbers and 1 bonus ball (6 total).</li>
            <li>Once submitted, your numbers are final and stored securely.</li>
            <li>If you win, your wallet must still be linked to claim the prize.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div>
          <h3 className="text-lg sm:text-xl text-cyan-300 font-semibold border border-cyan-600 px-4 py-2 rounded mb-2 text-center">
             Winning & Payouts
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-200">
            <li>Winners are drawn automatically and publicly.</li>
            <li>Jackpots increase with more ticket purchases.</li>
            <li>Winners receive Pi directly via Pi Wallet within 48 hours.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div>
          <h3 className="text-lg sm:text-xl text-cyan-300 font-semibold border border-cyan-600 px-4 py-2 rounded mb-2 text-center">
             Fairness & Security
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-200">
            <li>Draws are randomized and cannot be manipulated.</li>
            <li>Attempts to cheat or abuse the system will result in permanent bans.</li>
            <li>OhMyCompetitions is not liable for wallet access issues.</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 text-center pt-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>
<div className="pt-6 text-center">
  <a
    href="/lottery"
    className="inline-block bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 px-6 rounded-lg hover:from-blue-500 hover:to-cyan-400 transition"
  >
    ← Back to Pi Lottery
  </a>
</div>

      </div>
    </div>
  );
}

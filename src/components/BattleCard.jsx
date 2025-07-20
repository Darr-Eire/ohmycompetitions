// components/BattleCard.jsx
import Link from 'next/link';
import { FiArrowRightCircle } from 'react-icons/fi';

export default function BattleCard({ battle }) {
  return (
    <div className="bg-[#1e293b] p-4 rounded-xl flex justify-between items-center shadow-md">
      <div>
        <p className="font-semibold text-white">{battle.host}'s Game</p>
        <p className="text-sm text-white/70">
          {battle.status || '⏳ Waiting for players'}
        </p>
      </div>
      <div className="text-right">
        <p className="text-cyan-400 font-medium">{battle.prize} π</p>
        <Link
          href={
            battle.type === 'friends'
              ? `/battles/1v1/${battle.inviteCode}`
              : `/battles/1v1/${battle._id}`
          }
        >
          <button className="mt-1 text-sm bg-cyan-500 text-[#0f172a] font-bold py-1 px-3 rounded-md hover:bg-cyan-400 flex items-center gap-1">
            <FiArrowRightCircle /> Join
          </button>
        </Link>
      </div>
    </div>
  );
}

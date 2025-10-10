// components/BattleCard.jsx
import Link from 'next/link'
import { FiArrowRightCircle } from 'react-icons/fi'

export default function BattleCard({ battle }) {
  // Determine which ID to use (inviteCode for friends, else _id)
  const idValue = battle.type === 'friends'
    ? battle.inviteCode
    : battle._id

  // If we don’t yet have a valid ID, disable the join link
  const canJoin = Boolean(idValue)

  return (
    <div className="bg-[#1e293b] p-4 rounded-xl flex justify-between items-center shadow-md">
      <div>
        <p className="font-semibold text-white">{battle.host}’s Game</p>
        <p className="text-sm text-white/70">
          {battle.status || '⏳ Waiting for players'}
        </p>
      </div>

      <div className="text-right">
        <p className="text-cyan-400 font-medium">{battle.prize} π</p>

        {canJoin ? (
          <Link
            href={{
              pathname: '/battles/pi-bomb-1v1/[id]',
              query:    { id: idValue }
            }}
            className="mt-1 inline-flex items-center gap-1 bg-cyan-500 text-[#0f172a] font-bold py-1 px-3 rounded-md text-sm hover:bg-cyan-400 transition"
          >
            <FiArrowRightCircle /> Join
          </Link>
        ) : (
          <span
            className="mt-1 inline-flex items-center gap-1 bg-gray-700 text-gray-400 font-bold py-1 px-3 rounded-md text-sm cursor-not-allowed"
            aria-disabled="true"
          >
            <FiArrowRightCircle /> Join
          </span>
        )}
      </div>
    </div>
  )
}

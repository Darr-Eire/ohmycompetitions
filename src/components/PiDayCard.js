// src/components/PiDayCard.js
'use client'

import Link from 'next/link'
import CompetitionCard from './CompetitionCard'

export default function PiDayCard({ comp }) {
  return (
    <CompetitionCard
      comp={comp}
      title={comp.title}
      prize={comp.prize}
      fee="Free"
      href={`/competitions/${comp.slug}`}
      small
    >
      {/* Green referral panel */}
      <div className="mt-2 p-2 bg-green-50 rounded">
        <h4 className="text-green-700 font-semibold">Referral Rewards</h4>
        <p className="text-sm text-gray-600">
          Earn 1 free entry for every friend who signs up!
        </p>
        <Link
          href={`/refer?comp=${comp.slug}`}
          className="text-green-600 text-sm underline"
        >
          Get your referral link
        </Link>
      </div>
    </CompetitionCard>
  )
}

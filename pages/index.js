'use client'

import CompetitionCard from '../src/components/CompetitionCard'

export default function Home() {
  return (
    <div className="page p-6">
       <CompetitionCard
        title="Everyday Pioneer"
        prize="1,000 PI Giveaways"
        fee="0.314 PI"
        onEnter={() => {
          // Navigate to your competition entry page
          window.location.href = '/competitions/everyday-pioneer'
        }}
      />
    </div>
  )
}
" " 

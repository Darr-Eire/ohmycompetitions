// pages/competition.js

import { useState } from 'react'

export default function CompetitionPage() {
  const [status, setStatus] = useState('')

  const competitionDetails = {
    prize: 'Brand new laptop',
    endDate: 'Friday at 5 PM',
    description: 'Enter your details below to participate in the competition and stand a chance to win exciting prizes.',
  }

  return (
    <div className="competition-page">
      <h1>Pi Code Competition</h1>
      <p>{competitionDetails.description}</p>

      <div className="competition-details">
        <h2>Prize:</h2>
        <p>{competitionDetails.prize}</p>

        <h2>Competition Ends:</h2>
        <p>{competitionDetails.endDate}</p>
      </div>

      <div className="entry-form">
        <form>
          <label>
            Your Name:
            <input type="text" placeholder="Enter your name" required />
          </label>
          <button type="submit">Enter the Competition</button>
        </form>
      </div>

      {status && <p>{status}</p>}
    </div>
  )
}

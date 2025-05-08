'use client'

import { useEffect, useState } from 'react'

export default function GiftTicketModal({ user, onClose }) {
  const [competitions, setCompetitions] = useState([])
  const [selectedComp, setSelectedComp] = useState('')
  const [recipientUid, setRecipientUid] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Fetch competitions user has entered
    fetch('/api/user/entries')
      .then(res => res.json())
      .then(data => {
        // Extract unique competition names & IDs
        const comps = Array.from(
          new Map(data.map(entry => [entry.competitionId, {
            id: entry.competitionId,
            name: entry.competitionName,
          }])).values()
        )
        setCompetitions(comps)
      })
  }, [])

  const handleSubmit = async () => {
    if (!selectedComp || !recipientUid || quantity < 1) {
      setMessage('Fill all fields properly.')
      return
    }

    setSubmitting(true)
    const res = await fetch('/api/tickets/gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromUid: user.uid,
        toUid: recipientUid,
        competitionId: selectedComp,
        quantity: parseInt(quantity),
      }),
    })

    const result = await res.json()
    setSubmitting(false)

    if (res.ok) {
      setMessage('✅ Ticket(s) successfully gifted!')
      setTimeout(onClose, 1500)
    } else {
      setMessage(`❌ ${result.error || 'Something went wrong'}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center px-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl max-w-md w-full text-white shadow-lg">
        <h2 className="text-xl font-bold mb-4">🎁 Gift a Ticket</h2>

        <div className="space-y-4">
          {/* Competition Selection */}
          <div>
            <label className="block mb-1 text-sm">Competition</label>
            <select
              value={selectedComp}
              onChange={(e) => setSelectedComp(e.target.value)}
              className="w-full bg-white bg-opacity-20 rounded px-3 py-2"
            >
              <option value="">-- Select --</option>
              {competitions.map((comp) => (
                <option key={comp.id} value={comp.id}>{comp.name}</option>
              ))}
            </select>
          </div>

          {/* Recipient UID */}
          <div>
            <label className="block mb-1 text-sm">Recipient Pi UID</label>
            <input
              type="text"
              value={recipientUid}
              onChange={(e) => setRecipientUid(e.target.value)}
              className="w-full bg-white bg-opacity-20 rounded px-3 py-2"
              placeholder="e.g. pi_abcdef123"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block mb-1 text-sm">Tickets to Gift</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
              className="w-full bg-white bg-opacity-20 rounded px-3 py-2"
            />
          </div>

          {/* Message */}
          {message && <p className="text-sm text-yellow-300">{message}</p>}

          {/* Actions */}
          <div className="flex justify-between mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              {submitting ? 'Sending...' : 'Send Gift'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

export default function GiftTicketModal({ user, onClose }) {
  const [competitions, setCompetitions] = useState([])
  const [selectedComp, setSelectedComp] = useState('')
  const [recipientUsername, setRecipientUsername] = useState('')
  const [recipientUid, setRecipientUid] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/user/entries')
      .then(res => res.json())
      .then(data => {
        const safeEntries = Array.isArray(data)
          ? data
          : Array.isArray(data.entries)
            ? data.entries
            : []

        const comps = Array.from(
          new Map(
            safeEntries.map(entry => [
              entry.competitionId,
              {
                id: entry.competitionId,
                name: entry.competitionName,
              },
            ])
          ).values()
        )
        setCompetitions(comps)
      })
      .catch(() => {
        setCompetitions([])
        setMessage('⚠️ Failed to load competitions.')
      })
  }, [])

  const handleSubmit = async () => {
    if (!selectedComp || !recipientUsername || quantity < 1) {
      setMessage('Fill all fields properly.')
      return
    }

    setSubmitting(true)
    setMessage('Looking up recipient...')

    try {
      // Lookup UID by username
      const lookupRes = await fetch(`/api/user/lookup?username=${recipientUsername}`)
      const lookupData = await lookupRes.json()

      if (!lookupRes.ok || !lookupData.uid) {
        setMessage('❌ User not found.')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/tickets/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUid: user.uid,
          toUid: lookupData.uid,
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
    } catch (err) {
      console.error(err)
      setMessage('❌ Failed to send gift.')
      setSubmitting(false)
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

          {/* Recipient Username */}
          <div>
            <label className="block mb-1 text-sm">Recipient Username</label>
            <input
              type="text"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              className="w-full bg-white bg-opacity-20 rounded px-3 py-2"
              placeholder="e.g. john_doe"
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

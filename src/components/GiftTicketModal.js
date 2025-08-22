'use client'

import { useEffect, useState } from 'react'
import { usePiAuth } from 'context/PiAuthContext'

export default function GiftTicketModal({ isOpen, onClose, preselectedCompetition = null }) {
  const { user } = usePiAuth()
  const [competitions, setCompetitions] = useState([])
  const [selectedCompetition, setSelectedCompetition] = useState('')
  const [recipientUsername, setRecipientUsername] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success', 'error', 'info'

  useEffect(() => {
    if (isOpen) {
      loadCompetitions()
      if (preselectedCompetition) {
        const competitionId = preselectedCompetition._id || preselectedCompetition.id;
        console.log('Setting preselected competition:', competitionId, preselectedCompetition);
        setSelectedCompetition(competitionId);
      }
    }
  }, [isOpen, preselectedCompetition])

  const loadCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions/all')
      const data = await response.json()

      if (data.success) {
        const activeCompetitions = data.data.filter(comp => comp.comp?.status === 'active')
        console.log('Loaded competitions for gifting:', activeCompetitions);
        setCompetitions(activeCompetitions)
      } else {
        setMessage('Failed to load competitions')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error loading competitions:', error)
      setMessage('Failed to load competitions')
      setMessageType('error')
    }
  }

  const validateRecipient = async (username) => {
    try {
      const response = await fetch(`/api/user/lookup?username=${encodeURIComponent(username)}`)
      const data = await response.json()
      return response.ok && data.found ? { valid: true, user: data } : { valid: false, error: 'User not found' }
    } catch (error) {
      return { valid: false, error: 'Error checking user' }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user?.username) {
      setMessage('You must be logged in to gift tickets')
      setMessageType('error')
      return
    }

    if (!selectedCompetition || !recipientUsername.trim() || quantity < 1) {
      setMessage('Please fill in all fields')
      setMessageType('error')
      return
    }

    if (recipientUsername.trim().toLowerCase() === user.username.toLowerCase()) {
      setMessage('You cannot gift a ticket to yourself')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('Checking recipient...')
    setMessageType('info')

    try {
      const recipientCheck = await validateRecipient(recipientUsername.trim())
      if (!recipientCheck.valid) {
        setMessage(recipientCheck.error)
        setMessageType('error')
        setLoading(false)
        return
      }

      const selectedComp = competitions.find(c => c._id === selectedCompetition)
      const entryFee = selectedComp?.comp?.entryFee || 0
      const amountToPay = quantity * entryFee

      window.Pi.createPayment({
        amount: amountToPay,
        memo: `Gifting ${quantity} ticket(s) to ${recipientUsername} for ${selectedComp.title}`,
        metadata: {
          type: 'gift',
          from: user.username,
          to: recipientUsername,
          competitionSlug: selectedComp.comp?.slug,
          quantity,
        },
      }, {
        onReadyForServerApproval: (paymentId) => {
          console.log('Payment ID ready:', paymentId);
        },
        onReadyForServerCompletion: async (paymentId, txId) => {
          const res = await fetch('/api/tickets/gift', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromUsername: user.username,
              toUsername: recipientUsername.trim(),
              competitionId: selectedCompetition,
              quantity: parseInt(quantity),
              paymentId,
              transaction: { identifier: paymentId }
            })
          })

          const result = await res.json()
          if (res.ok && result.success) {
            setMessage(`🎁 Successfully gifted ${quantity} ticket(s) to ${recipientUsername}!`)
            setMessageType('success')
            setRecipientUsername('')
            setQuantity(1)
            if (!preselectedCompetition) setSelectedCompetition('')
            setTimeout(() => { onClose(); setMessage('') }, 2000)
          } else {
            setMessage(result.error || 'Failed to send gift')
            setMessageType('error')
          }
          setLoading(false)
        },
        onCancel: () => {
          setLoading(false)
          setMessage('Payment cancelled')
          setMessageType('info')
        },
        onError: (err) => {
          console.error('Payment error:', err)
          setLoading(false)
          setMessage('Payment error: ' + err.message)
          setMessageType('error')
        }
      })
    } catch (error) {
      console.error('Gift error:', error)
      setMessage('Failed to send gift')
      setMessageType('error')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMessage('')
    setRecipientUsername('')
    setQuantity(1)
    if (!preselectedCompetition) setSelectedCompetition('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-cyan-400 rounded-xl max-w-md w-full p-6 text-white shadow-[0_0_30px_#00f0ff88]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-cyan-400">🎁 Gift a Ticket</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-cyan-300 text-sm font-bold mb-2">Competition *</label>
            <select
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
              disabled={preselectedCompetition}
              className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white focus:border-cyan-300 focus:outline-none disabled:opacity-50"
              required>
              <option value="">Select a competition</option>
              {competitions.map((comp) => (
                <option key={comp.comp.slug || comp._id} value={comp._id}>
                  {comp.title} - {comp.comp?.entryFee || 0} π
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-cyan-300 text-sm font-bold mb-2">Recipient Username *</label>
            <input
              type="text"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
              placeholder="Enter Pi username"
              required
            />
          </div>

          <div>
            <label className="block text-cyan-300 text-sm font-bold mb-2">Number of Tickets *</label>
            <input
              type="number"
              min="1"
              max="50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white focus:border-cyan-300 focus:outline-none"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded border text-sm ${
              messageType === 'success' ? 'bg-green-900/20 border-green-500 text-green-400' :
              messageType === 'error' ? 'bg-red-900/20 border-red-500 text-red-400' :
              'bg-blue-900/20 border-blue-500 text-blue-400'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleClose} className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded font-bold transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !user?.username}
              className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-bold rounded transition">
              {loading ? 'Sending...' : 'Send Gift 🎁'}
            </button>
          </div>
        </form>

        {!user?.username && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500 rounded text-yellow-400 text-sm">
            Please log in with Pi Network to gift tickets
          </div>
        )}
      </div>
    </div>
  )
}
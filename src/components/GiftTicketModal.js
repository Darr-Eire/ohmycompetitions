'use client'

import { useEffect, useRef, useState } from 'react'
import { usePiAuth } from 'context/PiAuthContext'

/* ---------- lightweight logger (toggle with ?debugGift=1 or localStorage.debugGift=1) ---------- */
const DEBUG_GIFT =
  typeof window !== 'undefined' &&
  (
    new URLSearchParams(window.location.search).get('debugGift') === '1' ||
    localStorage.getItem('debugGift') === '1'
  )
const L = (...a) => { if (DEBUG_GIFT) console.log('%c[OMC][Gift]', 'color:#00e5ff', ...a) }
const W = (...a) => { if (DEBUG_GIFT) console.warn('%c[OMC][Gift]', 'color:#ffcc00', ...a) }
const E = (...a) => { if (DEBUG_GIFT) console.error('%c[OMC][Gift]', 'color:#ff5a5a', ...a) }

/* ---- tiny helpers for diagnosing swallowed events ---- */
const eat = (e) => { e.stopPropagation(); }
const logKey = (e) => { if (DEBUG_GIFT) console.log('[Gift][key]', e.type, e.key) }
const logFocus = (e) => { if (DEBUG_GIFT) console.log('[Gift][focus]', e.type, e.target?.id) }

export default function GiftTicketModal({ isOpen, onClose, preselectedCompetition = null }) {
  const auth = usePiAuth() || {}
  const user = auth.user
  const ctxToken = auth.token

  const [competitions, setCompetitions] = useState([])
  const [selectedCompetition, setSelectedCompetition] = useState('')
  const [recipientUsername, setRecipientUsername] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' | 'error' | 'info' | ''

  const recipientRef = useRef(null)
  const qtyRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    L('Modal opened')
    loadCompetitions()
    if (preselectedCompetition) {
      const competitionId = preselectedCompetition._id || preselectedCompetition.id
      setSelectedCompetition(competitionId)
    }
  }, [isOpen, preselectedCompetition])

  // Focus retries (covers mobile layout/paint delays)
  useEffect(() => {
    if (!isOpen) return
    const t1 = setTimeout(() => { try { recipientRef.current?.focus() } catch {} }, 50)
    const t2 = setTimeout(() => { try { recipientRef.current?.focus() } catch {} }, 300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isOpen])

  const loadCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions/all', { headers: { 'x-client-trace': 'gift-modal' } })
      const data = await response.json()
      if (data.success) {
        const activeCompetitions = (data.data || []).filter((c) => c.comp?.status === 'active')
        setCompetitions(activeCompetitions)
      } else {
        setMessage('Failed to load competitions'); setMessageType('error')
      }
    } catch (error) {
      E('Error loading competitions:', error)
      setMessage('Failed to load competitions'); setMessageType('error')
    }
  }

  const validateRecipient = async (username) => {
    try {
      const response = await fetch(`/api/user/lookup?username=${encodeURIComponent(username)}`, { headers: { 'x-client-trace': 'gift-modal' } })
      const data = await response.json().catch(()=> ({}))
      return response.ok && data.found ? { valid: true, user: data } : { valid: false, error: 'User not found' }
    } catch {
      return { valid: false, error: 'Error checking user' }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.username) { setMessage('You must be logged in to gift tickets'); setMessageType('error'); return }

    const qty = Math.max(1, Number.isFinite(+quantity) ? parseInt(String(quantity), 10) : 0)
    if (!selectedCompetition || !recipientUsername.trim() || qty < 1) {
      setMessage('Please fill in all fields'); setMessageType('error'); return
    }
    if (recipientUsername.trim().toLowerCase() === user.username.toLowerCase()) {
      setMessage('You cannot gift a ticket to yourself'); setMessageType('error'); return
    }

    if (typeof window === 'undefined' || !window.Pi?.createPayment) {
      setMessage('Pi SDK not loaded. Please open in Pi Browser.'); setMessageType('error'); return
    }

    setLoading(true)
    setMessage('Checking recipient...'); setMessageType('info')

    try {
      const recipientCheck = await validateRecipient(recipientUsername.trim())
      if (!recipientCheck.valid) { setMessage(recipientCheck.error); setMessageType('error'); setLoading(false); return }

      const selectedComp = competitions.find((c) => c._id === selectedCompetition)
      const entryFee = Number(selectedComp?.comp?.entryFee || 0)
      const amountToPay = qty * entryFee

      const headerToken =
        ctxToken || (typeof window !== 'undefined' && localStorage.getItem('omc_token')) || ''

      window.Pi.createPayment({
        amount: amountToPay,
        memo: `Gifting ${qty} ticket(s) to ${recipientUsername} for ${selectedComp?.title}`,
        metadata: {
          type: 'gift',
          from: user.username,
          to: recipientUsername.trim(),
          competitionSlug: selectedComp?.comp?.slug,
          quantity: qty,
        },
      }, {
        onReadyForServerApproval: (paymentId) => { L('Ready for approval', paymentId) },
        onReadyForServerCompletion: async (paymentId, txId) => {
          try {
            const res = await fetch('/api/tickets/gift', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-client-trace': 'gift-modal',
                ...(headerToken ? { Authorization: `Bearer ${headerToken}` } : {}),
              },
              body: JSON.stringify({
                fromUsername: user.username,
                toUsername: recipientUsername.trim(),
                competitionId: selectedCompetition,
                quantity: qty,
                paymentId,
                transaction: { identifier: paymentId, txId },
              }),
            })
            const result = await res.json().catch(()=> ({}))
            if (res.ok && (result.success || result.ok)) {
              setMessage(`🎁 Successfully gifted ${qty} ticket(s) to ${recipientUsername}!`)
              setMessageType('success')
              setRecipientUsername(''); setQuantity(1)
              if (!preselectedCompetition) setSelectedCompetition('')
              setTimeout(() => { onClose?.(); setMessage('') }, 1200)
            } else {
              setMessage(result?.error || result?.message || 'Failed to send gift')
              setMessageType('error')
            }
          } catch (err) {
            E('Gift completion error:', err)
            setMessage('Failed to send gift'); setMessageType('error')
          } finally {
            setLoading(false)
          }
        },
        onCancel: () => { setLoading(false); setMessage('Payment cancelled'); setMessageType('info') },
        onError: (err) => { E('Payment error:', err); setLoading(false); setMessage('Payment error: ' + (err?.message || 'Unknown')); setMessageType('error') },
      })
    } catch (error) {
      E('Gift flow unhandled error:', error)
      setMessage('Failed to send gift'); setMessageType('error')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMessage(''); setRecipientUsername(''); setQuantity(1)
    if (!preselectedCompetition) setSelectedCompetition('')
    onClose?.()
  }

  if (!isOpen) return null

  return (
    <div
      id="gift-modal-root"
      className="fixed inset-0 z-[9999]"
      aria-hidden={!isOpen}
    >
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px] pointer-events-auto z-[9999]"
        onClick={handleClose}
      />

      {/* CONTENT */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[10000] mx-auto my-8 max-w-md w-[92%] sm:w-full
                   bg-[#0f172a] border border-cyan-400 rounded-xl p-6 text-white
                   shadow-[0_0_30px_#00f0ff88] pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-cyan-400">🎁 Gift a Ticket</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-cyan-300 text-sm font-bold mb-2">Competition *</label>
            <select
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
              disabled={!!preselectedCompetition}
              className="w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white focus:border-cyan-300 focus:outline-none disabled:opacity-50"
              required
            >
              <option value="">Select a competition</option>
              {competitions.map((comp) => (
                <option key={comp.comp?.slug || comp._id} value={comp._id}>
                  {comp.title} - {comp.comp?.entryFee || 0} π
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gift-recipient" className="block text-cyan-300 text-sm font-bold mb-2">
              Recipient Username *
            </label>
            <input
              id="gift-recipient"
              ref={recipientRef}
              type="text"
              inputMode="text"
              autoComplete="username"
              autoCorrect="off"
              spellCheck={false}
              readOnly={false}
              // ensure nothing eats clicks/keys on mobile
              onClick={eat}
              onMouseDown={eat}
              onPointerDown={eat}
              onTouchStart={eat}
              onFocus={logFocus}
              onBlur={logFocus}
              onKeyDown={logKey}
              onKeyUp={logKey}
              tabIndex={0}
              style={{ position: 'relative', zIndex: 10001, pointerEvents: 'auto' }}
              className="relative z-[10001] w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              placeholder="Enter Pi username"
              required
            />
          </div>

          <div>
            <label htmlFor="gift-qty" className="block text-cyan-300 text-sm font-bold mb-2">
              Number of Tickets *
            </label>
            <input
              id="gift-qty"
              ref={qtyRef}
              type="number"
              min="1"
              max="50"
              value={quantity}
              onClick={eat}
              onMouseDown={eat}
              onPointerDown={eat}
              onTouchStart={eat}
              onKeyDown={logKey}
              onKeyUp={logKey}
              onChange={(e) => {
                const n = Math.max(1, Math.min(50, parseInt(e.target.value || '1', 10)))
                setQuantity(n)
              }}
              style={{ position: 'relative', zIndex: 10001, pointerEvents: 'auto' }}
              className="relative z-[10001] w-full px-3 py-2 bg-black border border-cyan-400 rounded text-white focus:border-cyan-300 focus:outline-none"
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
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !user?.username}
              className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-bold rounded transition"
            >
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

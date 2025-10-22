'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePiAuth } from 'context/PiAuthContext'

/* ---------- debug logger (toggle with ?debugGift=1 or localStorage.debugGift=1) ---------- */
const DEBUG_GIFT =
  typeof window !== 'undefined' &&
  (new URLSearchParams(window.location.search).get('debugGift') === '1' ||
   localStorage.getItem('debugGift') === '1')
const L = (...a) => { if (DEBUG_GIFT) console.log('%c[OMC][Gift]', 'color:#00e5ff', ...a) }
const W = (...a) => { if (DEBUG_GIFT) console.warn('%c[OMC][Gift]', 'color:#ffcc00', ...a) }
const E = (...a) => { if (DEBUG_GIFT) console.error('%c[OMC][Gift]', 'color:#ff5a5a', ...a) }

/* ---------- small helpers ---------- */
const toTs = (d) => d ? new Date(d).getTime() : NaN
const now = () => Date.now()
function isActive(compLike) {
  const s = toTs(compLike?.startsAt)
  const e = toTs(compLike?.endsAt)
  const t = now()
  if (Number.isFinite(s) && t < s) return false
  if (Number.isFinite(e) && t > e) return false
  return true
}

/** Ensure we have a portal root */
function useModalRoot() {
  const [el, setEl] = useState(null)
  useEffect(() => {
    if (typeof document === 'undefined') return
    let root = document.getElementById('modal-root')
    if (!root) {
      root = document.createElement('div')
      root.id = 'modal-root'
      document.body.appendChild(root)
    }
    setEl(root)
  }, [])
  return el
}

export default function GiftTicketModal({ isOpen, onClose, preselectedCompetition = null }) {
  const portalRoot = useModalRoot()
  const { user, token: ctxToken } = usePiAuth() || {}

  const [competitions, setCompetitions] = useState([])
  const [selectedCompetition, setSelectedCompetition] = useState('') // _id
  const [recipientUsername, setRecipientUsername] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' | 'error' | 'info' | ''

  const recipientRef = useRef(null)

  /* ---- lock background scroll on mobile while open ---- */
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  /* ---- load competitions when opened ---- */
  useEffect(() => {
    if (!isOpen) return
    L('Modal opened')

    ;(async () => {
      try {
        const r = await fetch('/api/competitions/all', { headers: { 'x-client-trace': 'gift-modal' } })
        const raw = await r.json().catch(() => ({}))
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
        const active = list.filter((c) => isActive(c?.comp ?? c))
        setCompetitions(active)
      } catch (err) {
        E('load comps', err)
        setMessage('Failed to load competitions'); setMessageType('error')
      }
    })()

    // preselect if provided
    if (preselectedCompetition) {
      const id = preselectedCompetition._id || preselectedCompetition.id || ''
      setSelectedCompetition(id)
    } else {
      setSelectedCompetition('')
    }
  }, [isOpen, preselectedCompetition])

  /* ---- focus username after paint (mobile friendly) ---- */
  useEffect(() => {
    if (!isOpen) return
    const t1 = setTimeout(() => { try { recipientRef.current?.focus() } catch {} }, 60)
    const t2 = setTimeout(() => { try { recipientRef.current?.focus() } catch {} }, 220)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isOpen])

  const validateRecipient = async (username) => {
    try {
      const r = await fetch(`/api/user/lookup?username=${encodeURIComponent(username)}`, { headers: { 'x-client-trace': 'gift-modal' } })
      const d = await r.json().catch(() => ({}))
      return r.ok && d.found ? { valid: true, user: d } : { valid: false, error: 'User not found' }
    } catch {
      return { valid: false, error: 'Error checking user' }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const qty = Math.max(1, Math.min(50, parseInt(String(quantity || '1'), 10) || 1))
    if (!user?.username) { setMessage('You must be logged in to gift tickets'); setMessageType('error'); return }
    if (!selectedCompetition) { setMessage('Please choose a competition'); setMessageType('error'); return }
    if (!recipientUsername.trim()) { setMessage('Please enter a recipient username'); setMessageType('error'); return }
    if (recipientUsername.trim().toLowerCase() === user.username.toLowerCase()) { setMessage('You cannot gift a ticket to yourself'); setMessageType('error'); return }
    if (typeof window === 'undefined' || !window.Pi?.createPayment) { setMessage('Pi SDK not loaded. Please open in Pi Browser.'); setMessageType('error'); return }

    const selectedComp = competitions.find((c) => c._id === selectedCompetition)
    if (!selectedComp) { setMessage('Selected competition not found'); setMessageType('error'); return }

    const entryFee = Number(selectedComp?.comp?.entryFee || 0)
    const amountToPay = qty * (Number.isFinite(entryFee) ? entryFee : 0)

    setLoading(true); setMessage('Checking recipient...'); setMessageType('info')

    try {
      const recipientCheck = await validateRecipient(recipientUsername.trim())
      if (!recipientCheck.valid) { setMessage(recipientCheck.error); setMessageType('error'); setLoading(false); return }

      const headerToken =
        ctxToken ||
        (typeof window !== 'undefined' && localStorage.getItem('omc_token')) ||
        ''

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

  if (!isOpen || !portalRoot) return null

  return createPortal(
    <div id="gift-modal-root" className="fixed inset-0 z-[9999]" aria-hidden={!isOpen}>
      {/* BACKDROP */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px] modal-backdrop"
        onClick={handleClose}
        aria-label="Close"
      />
      {/* PANEL */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-modal-title"
        className="
          relative z-[10000] mx-auto my-4 sm:my-8 max-w-md w-[94%] sm:w-full
          bg-[#0f172a] border border-cyan-400 rounded-xl p-0 text-white
          shadow-[0_0_30px_#00f0ff88] modal-panel pointer-events-auto
          max-h-[calc(100svh-2rem)] overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 id="gift-modal-title" className="text-lg sm:text-xl font-bold text-cyan-300">🎁 Gift a Ticket</h2>
            <button type="button" aria-label="Close" onClick={handleClose} className="text-gray-400 hover:text-white text-2xl leading-none">✕</button>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-cyan-300 text-sm font-bold mb-2">Competition *</label>
              <select
                value={selectedCompetition}
                onChange={(e) => setSelectedCompetition(e.target.value)}
                disabled={!!preselectedCompetition}
                className="w-full h-12 px-3 bg-black border border-cyan-400 rounded text-white text-base focus:border-cyan-300 focus:outline-none disabled:opacity-50"
                required
              >
                <option value="">Select a competition</option>
                {competitions.map((c) => {
                  const comp = c.comp ?? c
                  const id = c._id
                  const fee = Number(comp?.entryFee || 0)
                  const feeText = Number.isFinite(fee) ? `${fee} π` : String(comp?.entryFee ?? '—')
                  return (
                    <option key={id} value={id}>
                      {c.title} — {feeText}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label htmlFor="gift-recipient" className="block text-cyan-300 text-sm font-bold mb-2">Recipient Username *</label>
              <input
                id="gift-recipient"
                ref={recipientRef}
                type="text"
                inputMode="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                className="w-full h-12 px-3 bg-black border border-cyan-400 rounded text-white text-base placeholder-gray-400 focus:border-cyan-300 focus:outline-none"
                placeholder="Enter Pi username"
                required
              />
            </div>

            <div>
              <label htmlFor="gift-qty" className="block text-cyan-300 text-sm font-bold mb-2">Number of Tickets *</label>
              <input
                id="gift-qty"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => {
                  const n = Math.max(1, Math.min(50, parseInt(e.target.value || '1', 10)))
                  setQuantity(n)
                }}
                className="w-full h-12 px-3 bg-black border border-cyan-400 rounded text-white text-base focus:border-cyan-300 focus:outline-none"
                required
              />
              <p className="mt-1 text-xs text-white/60">Min 1, Max 50</p>
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

            {/* Sticky-ish action row with safe-area padding */}
            <div className="pt-2 pb-[max(0px,env(safe-area-inset-bottom))] flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 h-12 bg-gray-600 hover:bg-gray-700 rounded font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !user?.username}
                className="flex-1 h-12 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-bold rounded transition"
              >
                {loading ? 'Sending…' : 'Send Gift 🎁'}
              </button>
            </div>
          </form>

          {!user?.username && (
            <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-500 rounded text-yellow-400 text-sm">
              Please log in with Pi Network to gift tickets.
            </div>
          )}
        </div>
      </div>
    </div>,
    portalRoot
  )
}

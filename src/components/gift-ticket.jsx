'use client'

import { useState } from 'react'
import Image from 'next/image'
import axios from 'axios'

const competitions = [
  {
    slug: 'ps5-bundle',
    title: 'PS5 Mega Bundle',
    imageUrl: '/images/playstation.jpeg',
    entryFee: 0.4,
  },
  {
    slug: 'pi-cash-code',
    title: 'Pi Cash Code Jackpot',
    imageUrl: '/images/pi-cash-code.jpg',
    entryFee: 0.1,
  },
]

export default function GiftTicketPage() {
  const [selected, setSelected] = useState(null)
  const [recipient, setRecipient] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [lastGiftTime, setLastGiftTime] = useState(0)

  const currentUser = 'guest' // Replace with actual logged-in user when auth is wired up

  const handleGift = async () => {
    if (!selected || !recipient) {
      return setMessage('⚠️ Fill all fields.')
    }

    const trimmedRecipient = recipient.replace('@', '').trim()
    if (trimmedRecipient.toLowerCase() === currentUser.toLowerCase()) {
      return setMessage('❌ You cannot gift a ticket to yourself.')
    }

    const now = Date.now()
    if (now - lastGiftTime < 30000) {
      return setMessage('⏳ Please wait 30 seconds before gifting again.')
    }

    try {
      setSending(true)
      setMessage('⏳ Sending ticket...')

      await axios.post('/api/tickets/gift', {
        slug: selected.slug,
        title: selected.title,
        recipient: trimmedRecipient,
        imageUrl: selected.imageUrl,
        quantity: 1,
        giftedBy: currentUser,
      })

      setLastGiftTime(now)
      setMessage('✅ Ticket gifted successfully!')
      setRecipient('')
      setSelected(null)
    } catch (err) {
      console.error(err)
      setMessage('❌ Failed to gift ticket')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-orbitron text-center mb-6">🎁 Gift a Ticket</h1>

      <label className="block mb-2 font-semibold">Enter Pioneer Username</label>
      <input
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        className="w-full p-2 rounded text-black mb-6"
        placeholder="@exampleusername"
      />

      <label className="block mb-4 font-semibold">Select Competition</label>
      <div className="space-y-4 mb-6">
        {competitions.map(comp => (
          <div
            key={comp.slug}
            onClick={() => setSelected(comp)}
            className={`cursor-pointer p-4 rounded-xl border ${selected?.slug === comp.slug ? 'border-yellow-400' : 'border-white/20'} bg-[#1f2937] flex items-center space-x-4`}
          >
            <Image src={comp.imageUrl} alt={comp.title} width={60} height={60} className="rounded-lg" />
            <div>
              <h3 className="font-semibold">{comp.title}</h3>
              <p className="text-sm text-gray-300">🎫 {comp.entryFee} π</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          disabled={sending}
          onClick={handleGift}
          className="btn-gradient px-6 py-2 rounded font-semibold"
        >
          {sending ? 'Processing...' : 'Gift Ticket'}
        </button>
      </div>

      {message && <p className="text-center mt-4 text-yellow-300">{message}</p>}
    </div>
  )
}

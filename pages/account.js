'use client'

import { useEffect, useState } from 'react'
import AccountHeader from '@/components/AccountHeader'
import MyEntriesTable from '@/components/MyEntriesTable'
import DailyStreakCard from '@/components/DailyStreakCard'
import GiftTicketModal from '@/components/GiftTicketModal'
import GameHistoryTable from '@/components/GameHistoryTable'
import Link from 'next/link'

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [entries, setEntries] = useState([])
  const [showGiftModal, setShowGiftModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/user/me')
        const userData = await userRes.json()
        setUser(userData)

        const entriesRes = await fetch('/api/user/entries')
        const entriesData = await entriesRes.json()

        const safeEntries = Array.isArray(entriesData)
          ? entriesData
          : Array.isArray(entriesData.entries)
            ? entriesData.entries
            : []

        setEntries(safeEntries)
      } catch (err) {
        console.error('Failed to load account data', err)
      }
    }

    fetchData()
  }, [])

  if (!user) {
    return <div className="p-6 text-white">Loading account...</div>
  }

  return (
    <main className="app-background min-h-screen px-4 py-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="flex justify-center">
          <div className="btn-gradient px-6 py-2 rounded-full text-xl font-bold text-center shadow-md">
            My Account
          </div>
        </div>

        {/* Header Section */}
        <AccountHeader user={user} />

        {/* Gift Ticket Section */}
        <div className="text-center bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">🎁 Gift Tickets</h2>
          <p className="text-sm text-white mb-4">
            Purchase and gift tickets to friends using their username.
          </p>
          <button
            onClick={() => setShowGiftModal(true)}
            className="btn-gradient text-lg px-6 py-3 rounded-full font-semibold"
          >
            Buy & Gift a Ticket
          </button>
        </div>

        {showGiftModal && (
          <GiftTicketModal
            user={user}
            onClose={() => setShowGiftModal(false)}
            useUsername
          />
        )}

        {/* My Competitions Section */}
        <div className="rounded-xl shadow-lg p-6 bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black">
  <h2 className="text-2xl font-bold mb-4 text-center text-black">🎟️ My Competitions</h2>
  <div className="bg-white bg-opacity-80 rounded-lg p-4 overflow-x-auto text-black">
    <MyEntriesTable entries={entries} />
  </div>
</div>



        {/* Streak + Mini Games Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl shadow space-y-6 text-center">
          <DailyStreakCard uid={user.uid} />

          <div>
            <h3 className="text-2xl font-bold mb-3">🎮 Mini Games</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/try-your-luck/three-fourteen"
                className="btn-gradient text-center py-2 rounded-lg font-semibold"
              >
                ⏱️ 3.14 Challenge
              </Link>
              <Link
                href="/try-your-luck/slot-machine"
                className="btn-gradient text-center py-2 rounded-lg font-semibold"
              >
                🎰 Pi Slot Machine
              </Link>
              <Link
                href="/try-your-luck/mystery-wheel"
                className="btn-gradient text-center py-2 rounded-lg font-semibold"
              >
                🎡 Mystery Wheel
              </Link>
              <Link
                href="/try-your-luck/hack-the-vault"
                className="btn-gradient text-center py-2 rounded-lg font-semibold"
              >
                🔐 Hack the Vault
              </Link>
            </div>
          </div>
        </div>

        {/* Game History */}
        <GameHistoryTable />
      </div>
    </main>
  )
}

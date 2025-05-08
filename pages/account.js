'use client'

import { useEffect, useState } from 'react'
import AccountHeader from '@/components/AccountHeader'
import MyEntriesTable from '@/components/MyEntriesTable'
import DailyStreakCard from '@/components/DailyStreakCard'
import GiftTicketModal from '@/components/GiftTicketModal'
import GameHistoryTable from '@/components/GameHistoryTable'

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
        setEntries(entriesData)
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
        {/* 1. Header Section */}
        <AccountHeader user={user} />

        {/* 2. Daily Streak Card */}
        <DailyStreakCard uid={user.uid} />

        {/* 3. My Entries Table */}
        <MyEntriesTable entries={entries} />

        {/* 4. Gift Ticket Section */}
        <div className="text-center">
          <button
            onClick={() => setShowGiftModal(true)}
            className="btn-gradient px-6 py-2 rounded-full mt-4"
          >
            🎁 Gift a Ticket
          </button>
        </div>

        {/* Modal */}
        {showGiftModal && (
          <GiftTicketModal
            user={user}
            onClose={() => setShowGiftModal(false)}
          />
        )}

        {/* 5. Game History */}
        <GameHistoryTable />
      </div>
    </main>
  )
}

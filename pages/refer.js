// pages/refer.js
'use client'

import { useSession } from 'next-auth/react'

export default function ReferPage() {
  const { data: session } = useSession()

  if (!session) return <p className="p-8 text-center">Please sign in to get your referral link.</p>

  const link = `${process.env.NEXTAUTH_URL}/competitions/pi-day-freebie?ref=${session.user.id}`

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Your Pi Day Referral Link</h1>
      <p className="break-all bg-gray-100 p-4 rounded">{link}</p>
      <button
        onClick={() => navigator.clipboard.writeText(link)}
        className="btn btn-primary"
      >
        Copy to Clipboard
      </button>
    </main>
  )
}

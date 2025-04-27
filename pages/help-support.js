// pages/help-support.js
'use client'

import Link from 'next/link'

export default function HelpSupport() {
  return (
    <main className="page p-6 max-w-2xl mx-auto">
      <div className="competition-card">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-500">Help & Support</h1>

        <p className="mb-4">
          Welcome to our Help & Support Center. We're here to assist you with any questions or issues!
        </p>

        <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
        <ul className="mb-4 list-disc list-inside text-left">
        <li><strong>Email:</strong> <span className="text-blue-600">ohmycompetitions@gmail.com</span> {/* 🔵 Replace this with your real email */}</li>
          <li><strong>Phone:</strong> <span className="text-blue-600">+353871365782</span> {/* 🔵 Replace this with your real phone */}</li>
          <li><strong>Address:</strong> <span className="text-blue-600">Dublin,Irland</span> {/* 🔵 Replace this with your real or fake address */}</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions (FAQ)</h2>
        <ul className="mb-4 list-disc list-inside text-left">
          <li><strong>How do I enter competitions?</strong> — Click "Enter Now" on any competition and follow instructions!</li>
          <li><strong>Is joining free?</strong> — Some competitions are free, others have a small Pi entry fee.</li>
          <li><strong>Where are my tickets?</strong> — Check the "My Entries" page after logging in.</li>
          <li><strong>How are winners picked?</strong> — Randomly selected when competitions close.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">Useful Links</h2>
        <div className="flex flex-col items-start gap-2">
          <Link href="/" className="text-blue-600 underline">🏠 Home</Link>
          <Link href="/competitions" className="text-blue-600 underline">🎁 All Competitions</Link>
          <Link href="/future" className="text-blue-600 underline">🚀 The Future</Link>
          <Link href="/forums" className="text-blue-600 underline">💬 Forums</Link>
        </div>
      </div>
    </main>
  )
}

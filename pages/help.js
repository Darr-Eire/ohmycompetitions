// pages/help.js
'use client'

import Link from 'next/link'

export default function HelpSupport() {
  return (
    <main className="page p-6 max-w-2xl mx-auto">
      <div className="competition-card">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-500">Help & Support</h1>

        <p className="mb-4">
          Welcome to our Help & Support Center. We're here to make your experience smooth and enjoyable!
          If you have any questions, issues, or suggestions, feel free to reach out.
        </p>

        <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
        <ul className="mb-4 list-disc list-inside text-left">
          <li><strong>Email:</strong> <span className="text-blue-600">ohmycompetitions@gmail.com</span> {/* 🔵 CHANGE this to your real support email */}</li>
          <li><strong>Phone:</strong> <span className="text-blue-600">0871365782</span> {/* 🔵 CHANGE this to your real phone number */}</li>
          <li><strong>Address:</strong> <span className="text-blue-600">dublin,ireland</span> {/* 🔵 CHANGE this if you want to add a real or PO box address */}</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions (FAQ)</h2>
        <ul className="mb-4 list-disc list-inside text-left">
          <li><strong>How do I enter competitions?</strong> — Simply click "Enter Now", login, and pay with Pi!</li>
          <li><strong>Is it free to join?</strong> — Some competitions are free, others require a small Pi fee per ticket.</li>
          <li><strong>Where can I see my entries?</strong> — Go to your "My Entries" page after logging in.</li>
          <li><strong>When are winners announced?</strong> — Winners are selected at the announced end time and notified via email and Pi Browser.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">Other Useful Links</h2>
        <div className="flex flex-col items-start gap-2">
          <Link href="/" className="text-blue-600 underline">🏠 Back to Home</Link>
          <Link href="/competitions" className="text-blue-600 underline">🎁 View All Competitions</Link>
          <Link href="/future" className="text-blue-600 underline">🚀 The Future</Link>
          <Link href="/forums" className="text-blue-600 underline">💬 Forums</Link>
        </div>
      </div>
    </main>
  )
}

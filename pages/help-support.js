// pages/help-support.js
'use client'

import Link from 'next/link'

export default function HelpSupport() {
  return (
    <main className="page">
      <div className="competition-card max-w-2xl w-full">
         {/* Banner */}
         <div className="competition-top-banner">
          🚀 Help and Support
        </div>
           {/* Divider */}
           <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-lg">
            Welcome to our Help & Support Center. We’re here to assist you with any questions or issues!
          </p>

          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-blue-600 mb-1">Contact Information</h2>
              <ul className="list-disc list-inside text-left">
                <li>
                  <strong>Email:</strong>{' '}
                  <span className="text-blue-600">ohmycompetitions@gmail.com</span>
                </li>
                <li>
                  <strong>Phone:</strong>{' '}
                  <span className="text-blue-600">+353871365782</span>
                </li>
                <li>
                  <strong>Address:</strong>{' '}
                  <span className="text-blue-600">Dublin, Ireland</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold text-blue-600 mb-1">Frequently Asked Questions (FAQ)</h2>
              <ul className="list-disc list-inside text-left">
                <li>
                  <strong>How do I enter competitions?</strong> — Click “Enter Now” on any competition and follow instructions!
                </li>
                <li>
                  <strong>Is joining free?</strong> — Some competitions are free, others have a small Pi entry fee.
                </li>
                <li>
                  <strong>Where are my tickets?</strong> — Check the “My Entries” page after logging in.
                </li>
                <li>
                  <strong>How are winners picked?</strong> — Randomly selected when competitions close.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold text-blue-600 mb-1">Useful Links</h2>
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-blue-600 underline">
                  🏠 Home
                </Link>
                <Link href="/competitions" className="text-blue-600 underline">
                  🎁 All Competitions
                </Link>
                <Link href="/future" className="text-blue-600 underline">
                  🚀 The Future
                </Link>
                <Link href="/forums" className="text-blue-600 underline">
                  💬 Forums
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

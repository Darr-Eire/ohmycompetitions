// pages/help-support.js
'use client'

import Link from 'next/link'
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaDiscord,
} from 'react-icons/fa'

export default function HelpSupport() {
  return (
    <main className="page">
      <div className="competition-card max-w-2xl w-full">
        {/* Banner */}
        <div className="competition-top-banner">🚀 Help & Support</div>

        {/* Divider */}
        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-lg">
            Welcome to our Help & Support Center. We’re here to assist you with any questions or issues!
          </p>

          {/* Contact Information */}
          <div>
            <h2 className="font-semibold text-blue-600 mb-1">Contact Information</h2>
            <ul className="flex flex-wrap gap-6 list-inside">
              <li>
                <strong>Email:</strong>{' '}
                <span className="text-blue-600">ohmycompetitions@gmail.com</span>
              </li>
              <li>
                <strong>Phone:</strong>{' '}
                <span className="text-blue-600"><br/>
                +353 87 1365782</span>
              </li>
              <li>
                <strong>Address:</strong>{' '}
                <span className="text-blue-600"><br/>
                Dublin, Ireland</span>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-semibold text-blue-600 mb-1">Frequently Asked Questions (FAQ)</h2>
            <ul className="list-disc list-inside space-y-2 text-left">
              <li>
                <strong>How do I enter competitions?</strong><br />
                Click “Enter Now” on any competition and follow instructions!
              </li>
              <li>
                <strong>Is joining free?</strong><br />
                Some competitions are free, others have a small Pi entry fee.
              </li>
              <li>
                <strong>Where are my tickets?</strong><br />
                Check the “My Entries” page after logging in.
              </li>
              <li>
                <strong>How are winners picked?</strong><br />
                Randomly selected when competitions close.
              </li>
            </ul>
          </div>

          {/* Social Icons */}
          <div>
            <h2 className="font-semibold text-blue-600 mb-1 text-center">Connect with Us</h2>
            <div className="flex justify-center space-x-4 mb-4">
              <a
                href="https://twitter.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://facebook.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <FaFacebookF size={24} />
              </a>
              <a
                href="https://instagram.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://discord.gg/yourinvite"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <FaDiscord size={24} />
              </a>
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="text-center">
            <Link href="/" legacyBehavior>
            <a className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                ← Back to Home
              </a>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

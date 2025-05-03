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
      <div className="competition-card max-w-2xl w-full mx-auto">
        {/* Banner */}
        <div className="competition-top-banner text-center px-4 py-2 text-2xl font-bold bg-blue-600 text-white rounded-t-md">
          🚀 Help & Support
        </div>

        {/* Divider */}
        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-6">
         <p>
  <strong>
  Welcome to our Help & Support Center. We’re here to assist you with any questions or issues!
  </strong>
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
                <span className="text-blue-600">+353 87 1365782</span>
              </li>
              <li>
                <strong>Address:</strong>{' '}
                <span className="text-blue-600">Dublin, Ireland</span>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-semibold text-blue-600 mb-1">
              Frequently Asked Questions (FAQ)
            </h2>
            <ul className="list-disc list-inside space-y-4 text-left">
              <li>
                <strong>How do I enter competitions?</strong><br />
                Click “Enter Now” on any competition and follow the instructions!
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
                Winners are randomly selected when competitions close.
              </li>
            </ul>
          </div>

          {/* Social Icons */}
          <div>
            <h2 className="font-semibold mb-2 text-center text-white">
              Connect with Us
            </h2>
            <div className="flex justify-center space-x-4 mb-4">
              <a
                href="https://twitter.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://facebook.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200"
              >
                <FaFacebookF size={24} />
              </a>
              <a
                href="https://instagram.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://discord.gg/yourinvite"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200"
              >
                <FaDiscord size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

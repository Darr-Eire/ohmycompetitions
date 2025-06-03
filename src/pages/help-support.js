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
    <main className="app-background min-h-screen flex justify-center items-start px-4 py-12 text-white">
      <div className="competition-card max-w-3xl w-full bg-white bg-opacity-10 rounded-2xl shadow-lg">
        {/* Banner */}
        <div className="competition-top-banner title-gradient">
          Help & Support
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p>
            Welcome to our Help & Support Center. We’re here to assist you with any questions or issues!
          </p>

          {/* Contact Information */}
          <section>
            <h2 className="text-lg font-bold gradient-text mt-6 mb-2">Contact Information</h2>
            <ul className="flex flex-wrap gap-6 list-inside text-white">
              <li>
                <strong>Email:</strong>{' '}
                <span className="gradient-text">ohmycompetitions@gmail.com</span>
              </li>
              <li>
                <strong>Phone:</strong>{' '}
                <span className="gradient-text">+353 87 1365782</span>
              </li>
              <li>
                <strong>Address:</strong>{' '}
                <span className="gradient-text">Dublin, Ireland</span>
              </li>
            </ul>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-lg font-bold gradient-text mt-6 mb-4">Frequently Asked Questions</h2>
            <ul className="list-disc list-inside space-y-4 text-white">
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
          </section>

          {/* Connect */}
          <section>
            <h2 className="text-center text-lg font-semibold gradient-text mb-2">Connect with Us</h2>
            <div className="flex justify-center space-x-4 mb-4">
              {[FaTwitter, FaFacebookF, FaInstagram, FaDiscord].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition"
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
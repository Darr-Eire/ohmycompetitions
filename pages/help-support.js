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
    <main
      className="flex justify-center py-8 px-4 min-h-screen"
      style={{
        backgroundImage: 'linear-gradient(to bottom right, #1E3A8A, #60A5FA)',
      }}
    >
      <div className="competition-card max-w-3xl w-full bg-white">
        
        {/* Banner */}
        <div
   className="competition-top-banner text-white text-center px-4 py-2"
   style={{ background: 'var(--primary-gradient)' }}
 >
          🚀 Help And Support
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-black">
          <p className="">
            Welcome to our Help & Support Center. We’re here to assist you with any questions or issues!
          </p>

          {/* Contact Information */}
          <section>
            <h2 className="font-bold text-white mt-6">Contact Information</h2>
            <ul className="flex flex-wrap gap-6 list-inside">
              <li>
                <strong>Email:</strong>{' '}
                <span className="text-black">ohmycompetitions@gmail.com</span>
              </li>
              <li>
                <strong>Phone:</strong>{' '}
                <span className="text-black">+353 87 1365782</span>
              </li>
              <li>
                <strong>Address:</strong>{' '}
                <span className="text-black">Dublin, Ireland</span>
              </li>
            </ul>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="font-bold text-white mt-6">Frequently Asked Questions</h2>
            <ul className="list-disc list-inside space-y-4">
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
            <h2 className="font-semibold text-center text-white mb-2">
              Connect with Us
            </h2>
            <br/>
            <div className="flex justify-center space-x-4 mb-4">
              {[FaTwitter, FaFacebookF, FaInstagram, FaDiscord].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-800 transition"
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

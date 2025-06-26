'use client'

import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <main className="page text-white">
      <div className="competition-card max-w-3xl w-full mx-auto">

        {/* Title */}
        <div className="competition-top-banner text-center text-xl sm:text-2xl font-bold my-4 !text-cyan-300">
   Privacy Policy
</div>


        {/* Divider */}
        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-6 text-center">

          <p className="text-white">
            This Privacy Policy explains how OhMyCompetitions collects, uses, and protects your personal data in compliance with Pi Network guidelines and relevant privacy laws.
          </p>

          {/* Sections */}
          {[
            {
              title: '1. What We Collect',
              points: [
                'Pi Network UID and username via secure login.',
                'Optional email address (if provided during contact or nominations).',
                'Competition activity (e.g., tickets purchased, wins, participation history).',
                'Device and browser information (IP address, OS, browser type) for security and debugging.'
              ]
            },
            {
              title: '2. How We Use Your Data',
              points: [
                'To run competitions, deliver prizes, and contact winners.',
                'To verify you’re a real Pi user and prevent abuse.',
                'To improve our features, mini-games, and platform performance.',
                'To fulfill legal obligations or resolve disputes if needed.'
              ]
            },
            {
              title: '3. Data Protection & Security',
              points: [
                'We use secure Pi SDK authentication and industry-standard encryption.',
                'Access to user data is restricted to authorized team members only.',
                'We do not collect or store your Pi wallet balances or private keys.'
              ]
            },
            {
              title: '4. Who We Share It With',
              points: [
                'We never sell, rent, or trade your personal info.',
                'We only share data internally for admin purposes.',
                'We may disclose info if required by law (e.g., fraud investigation or legal order).'
              ]
            },
            {
              title: '5. Cookies & Tracking',
              points: [
                'We may use basic cookies for login sessions, user preferences, and performance analytics.',
                'No third-party ad tracking or invasive cookies are used.',
                'You can manage cookie settings in your browser.'
              ]
            },
            {
              title: '6. Your Privacy Rights',
              points: [
                'You can request access to your stored data.',
                'You can request corrections or deletion of your data.',
                'To make a request, contact us at ',
                <span key="email" className="text-cyan-300">ohmycompetitions@gmail.com</span>
              ]
            },
            {
              title: '7. Data Retention',
              points: [
                'We keep your data only as long as needed for app functionality and legal reasons.',
                'You may request full data deletion at any time.'
              ]
            },
            {
              title: '8. Pi Network Compliance',
              points: [
                'This app follows all Pi Network Developer Guidelines and ecosystem terms.',
                'We don’t interact with your wallet funds or store Pi private keys.'
              ]
            },
            {
              title: '9. Updates to This Policy',
              points: [
                'We may update this Privacy Policy to reflect changes in the law or our features.',
                'All updates take effect immediately once posted here.'
              ]
            }
          ].map((section, index) => (
            <div key={index}>
              <h2 className="font-semibold text-cyan-300 mt-6">{section.title}</h2>
              <ul className="list-disc list-inside mt-2 text-white text-left max-w-xl mx-auto">
                {section.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <h2 className="font-semibold text-cyan-300 mt-6">10. Contact Us</h2>
          <p>
            If you have any privacy-related questions or requests, please email us at{' '}
            <span className="text-cyan-300">ohmycompetitions@gmail.com</span>.
          </p>

        
        </div>
      </div>
    </main>
  )
}

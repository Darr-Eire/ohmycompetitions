'use client'

import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <main className="page">
      <div className="competition-card max-w-3xl w-full">

        {/* Title */}
        <div className="competition-top-banner text-center">
          🔒 Privacy Policy
        </div>

        {/* Divider */}
        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-6 text-left text-gray-700">

          <p>This Privacy Policy describes how OhMyCompetitions collects, uses, and protects your information.</p>

          <h2 className="font-semibold text-blue-600 mt-6">1. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Basic identification details from your Pi Network login (e.g., Pi username, UID).</li>
            <li>Email address, if provided voluntarily during registration or support inquiries.</li>
            <li>Competition participation records (tickets purchased, entries, wins).</li>
            <li>Technical information such as IP address, browser type, and device information for security purposes.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To manage competitions and prize distributions.</li>
            <li>To verify account authenticity through Pi Network integration.</li>
            <li>To notify winners and communicate competition updates.</li>
            <li>To improve our platform and user experience.</li>
            <li>To comply with legal obligations where required.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">3. Data Security</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>We implement strong measures to protect your data from unauthorized access or disclosure.</li>
            <li>All transactions through Pi Network are handled securely via official Pi SDKs.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">4. Data Sharing</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>We do not sell, rent, or trade your personal information to third parties.</li>
            <li>Information may be shared internally with authorized staff for competition administration purposes only.</li>
            <li>We may disclose information if legally required (e.g., by court order or investigation).</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">5. Cookies & Tracking</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Our website may use basic cookies for site functionality and anonymous analytics.</li>
            <li>You can control cookie settings through your browser preferences.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">6. Your Rights</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>You have the right to request access to the data we hold about you.</li>
            <li>You have the right to request correction, deletion, or restriction of your personal information.</li>
            <li>To exercise your rights, contact us at <span className="text-blue-600">ohmycompetitions@gmail.com</span>.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">7. Retention</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>We retain user data only as long as necessary to fulfill competition and legal requirements.</li>
            <li>Inactive accounts and related data may be deleted upon request.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">8. Pi Network Compliance</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Our app is designed to follow Pi Network's ecosystem rules and data security standards.</li>
            <li>We do not collect or store Pi balances or private wallet keys.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">9. Updates to This Policy</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>This Privacy Policy may be updated as needed for legal, operational, or technological reasons.</li>
            <li>Changes are effective immediately upon posting to this page.</li>
          </ul>

          <h2 className="font-semibold text-blue-600 mt-6">10. Contact Us</h2>
          <p>If you have any questions or concerns regarding this Privacy Policy, please contact us at <span className="text-blue-600">ohmycompetitions@gmail.com</span>.</p>

          {/* Back Home Button */}
          <div className="text-center mt-8">
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded">
                 Back to Home
              </button>
            </Link>
          </div>

        </div>

      </div>
    </main>
  )
}
